import {
  Asset,
  Networks,
  Operation,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { server } from "./horizon";

export interface SendXLMParams {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  signTransaction: (xdr: string) => Promise<string>;
}

export async function sendXLM({
  sourcePublicKey,
  destination,
  amount,
  signTransaction,
}: SendXLMParams): Promise<string> {
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

  const signedXdr = await signTransaction(transaction.toXdr());
  const signedTx = new Transaction(signedXdr, Networks.TESTNET);

  const response = await server.submitTransaction(signedTx);
  return response.hash;
}
