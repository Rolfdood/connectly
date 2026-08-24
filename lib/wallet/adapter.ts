/**
 * WalletAdapter defines the common interface that all wallet integrations
 * must implement. This allows the UI to remain agnostic to the underlying
 * wallet provider.
 */
export interface WalletAdapter {
  /** Unique identifier for this adapter (e.g. "freighter"). */
  id: string;

  /** Human-readable wallet name (e.g. "Freighter"). */
  name: string;

  /**
   * Returns true when the wallet extension is installed and available
   * in the current browser environment.
   */
  isAvailable(): Promise<boolean>;

  /** Initiates the connection flow and requests user authorization. */
  connect(): Promise<void>;

  /** Clears any cached connection state held by the adapter. */
  disconnect(): Promise<void>;

  /** Returns the public key of the currently authorized account. */
  getPublicKey(): Promise<string>;

  /**
   * Signs a transaction XDR string and returns the signed XDR.
   * @param xdr - The base64-encoded transaction XDR to sign.
   * @param networkPassphrase - The Stellar network passphrase (e.g. Networks.TESTNET).
   */
  signTransaction(xdr: string, networkPassphrase?: string): Promise<string>;
}
