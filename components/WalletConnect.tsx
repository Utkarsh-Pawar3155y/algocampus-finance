import React, { useEffect, useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

// Algorand TestNet chain ID
const peraWallet = new PeraWalletConnect({
  chainId: 416002,
});
interface Props {
  onConnect: (address: string | null, wallet: PeraWalletConnect | null) => void;
}


export const WalletConnect: React.FC<Props> = ({ onConnect }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto reconnect on refresh
  useEffect(() => {
    const reconnect = async () => {
      const accounts = await peraWallet.reconnectSession();
      if (accounts.length) {
        setAccount(accounts[0]);
        onConnect(accounts[0], peraWallet);
      }
    };

    reconnect();
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const accounts = await peraWallet.connect();
      if (accounts.length) {
        setAccount(accounts[0]);
        onConnect(accounts[0], peraWallet);
      }
    } catch (err) {
      console.log("Wallet connection cancelled");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    await peraWallet.disconnect();
    setAccount(null);
    onConnect(null, null);
  };

  return (
    <div>
      {account ? (
        <div className="flex items-center gap-3 bg-indigo-800 rounded-lg pl-4 pr-1 py-1 border border-indigo-600">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-indigo-300">
              Wallet Connected
            </span>
            <span className="text-sm font-mono">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 text-sm bg-indigo-700 rounded-md hover:bg-indigo-600 transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition shadow-md disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect Pera Wallet"}
        </button>
      )}
    </div>
  );
};
