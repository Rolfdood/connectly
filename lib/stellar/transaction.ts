import {
  Asset,
  Networks,
  NotFoundError,
  Operation,
  Transaction,
  TransactionBuilder,
  TransactionFailedError,
} from "@stellar/stellar-sdk";
import { WalletError } from "@/lib/wallet/errors";
import { server } from "./horizon";

export class DestinationAccountNotFundedError extends Error {
  constructor(message = "Destination account does not exist.") {
    super(message);
    this.name = "DestinationAccountNotFundedError";
  }
}

export function mapTransactionError(error: unknown): string {
  if (error instanceof WalletError && error.code === "USER_REJECTED") {
    return "Transaction was cancelled in Freighter.";
  }

  if (error instanceof DestinationAccountNotFundedError) {
    return "Destination account does not exist.";
  }

  if (error instanceof TransactionFailedError) {
    const { transaction, operations } = error.getResultCodes();
    if (transaction === "tx_bad_seq") {
      return "Transaction sequence number invalid. Please try again.";
    }
    if (
      transaction === "tx_insufficient_balance" ||
      operations.includes("op_underfunded")
    ) {
      return "Insufficient balance to complete this transaction.";
    }
    if (operations.includes("op_no_destination")) {
      return "Destination account does not exist.";
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rejected") || msg.includes("denied") || msg.includes("cancel")) {
      return "Transaction was cancelled in Freighter.";
    }
    if (msg.includes("bad_seq")) {
      return "Transaction sequence number invalid. Please try again.";
    }
    if (msg.includes("underfunded") || msg.includes("insufficient balance")) {
      return "Insufficient balance to complete this transaction.";
    }
    return error.message;
  }

  return "Transaction failed. Please try again.";
}

export interface SubmitPaymentParams {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  signTransaction: (xdr: string, networkPassphrase: string) => Promise<string>;
}

export async function submitPayment({
  sourcePublicKey,
  destination,
  amount,
  signTransaction,
}: SubmitPaymentParams): Promise<string> {
  // Pre-flight: validate destination account exists
  try {
    await server.loadAccount(destination);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new DestinationAccountNotFundedError();
    }
    if (
      error instanceof Error &&
      (error.message.includes("404") || error.message.includes("NotFound"))
    ) {
      throw new DestinationAccountNotFundedError();
    }
    throw error;
  }

  const account = await server.loadAccount(sourcePublicKey);

  const feeStats = await server.feeStats();
  const baseFee = Number(feeStats.last_ledger_base_fee);

  const transaction = new TransactionBuilder(account, {
    fee: baseFee.toString(),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      })
    )
    .setTimeout(30)
    .build();

  const signedXdr = await signTransaction(transaction.toXdr(), Networks.TESTNET);
  const signedTx = new Transaction(signedXdr, Networks.TESTNET);

  const response = await server.submitTransaction(signedTx);
  return response.hash;
}
