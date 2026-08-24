import { Horizon } from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";

export const server = new Horizon.Server(HORIZON_URL);
