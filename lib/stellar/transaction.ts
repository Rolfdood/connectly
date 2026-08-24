import {
  Asset,
  Networks,
  NotFoundError,
  Operation,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { server } from "./horizon";

export class DestinationAccountNotFundedError extends Error {
  constructor(message = "Destination account does not exist.") {
    super(message);
    this.name = "DestinationAccountNotFundedError";
  }
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
