import React, { useEffect, useState } from "react";
import algosdk from "algosdk";

interface Props {
  address: string;
  wallet: any;
}

const APP_ID = 755303790;

const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

const indexer = new algosdk.Indexer(
  "",
  "https://testnet-idx.algonode.cloud",
  ""
);

export const LendingPool: React.FC<Props> = ({ address, wallet }) => {
  const [poolBalance, setPoolBalance] = useState(0);
  const [rate, setRate] = useState(5);
  const [loanAmount, setLoanAmount] = useState(10);
  const [debt, setDebt] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // =========================
  // LOAD GLOBAL + LOCAL STATE
  // =========================
  const loadPool = async () => {
    try {
      // -------- GLOBAL STATE --------
      const response = await indexer.lookupApplications(APP_ID).do();
      const app = response.application;
      if (!app?.params) return;

      const globalState =
        app.params["global-state"] || app.params.globalState || [];

      let pool = 0;
      let interest = 5;

      globalState.forEach((entry: any) => {
        const key = Buffer.from(entry.key, "base64").toString();

        if (key === "POOL") pool = Number(entry.value.uint);
        if (key === "RATE") interest = Number(entry.value.uint);
      });

      setPoolBalance(pool / 1_000_000);
      setRate(interest);

      // -------- LOCAL STATE (USER DEBT) --------
      if (address) {
        const accountInfo = await indexer.lookupAccountByID(address).do();
        const localStates = accountInfo.account["apps-local-state"] || [];
        const appLocal = localStates.find((a: any) => a.id === APP_ID);

        if (appLocal && appLocal["key-value"]) {
          let userDebt = 0;

          appLocal["key-value"].forEach((entry: any) => {
            const decodedKey = Buffer.from(entry.key, "base64").toString();

            if (decodedKey === "DEBT") {
              userDebt = entry.value.uint;
            }
          });

          setDebt(userDebt / 1_000_000);
        } else {
          setDebt(0);
        }
      }
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    if (address) loadPool();
  }, [address]);

  // =========================
  // BORROW
  // =========================
  const handleBorrow = async () => {
    try {
      if (!address || !wallet) {
        alert("Wallet not connected properly");
        return;
      }

      setIsProcessing(true);

      const params = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: address.trim(),
        appIndex: APP_ID,
        suggestedParams: params,
        appArgs: [
          new TextEncoder().encode("borrow"),
          algosdk.encodeUint64(
            BigInt(loanAmount) * BigInt(1_000_000)
          ),
        ],
      });

      const signed = await wallet.signTransaction([
        [{ txn, signers: [address.trim()] }],
      ]);

      await algodClient.sendRawTransaction(signed.flat()).do();

      alert("✅ Borrow transaction sent!");

      // reload after confirmation delay
      setTimeout(loadPool, 2500);

    } catch (err) {
      console.error("BORROW ERROR:", err);
      alert("Borrow failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================
  // REPAY
  // =========================
  const handleRepay = async () => {
    try {
      if (!address || !wallet) {
        alert("Wallet not connected properly");
        return;
      }

      setIsProcessing(true);

      const params = await algodClient.getTransactionParams().do();

      const appCall = algosdk.makeApplicationNoOpTxnFromObject({
        sender: address.trim(),
        appIndex: APP_ID,
        suggestedParams: params,
        appArgs: [new TextEncoder().encode("repay")],
      });

      const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: address.trim(),
        to: algosdk.getApplicationAddress(APP_ID),
        amount: Math.floor(debt * 1_000_000),
        suggestedParams: params,
      });

      algosdk.assignGroupID([appCall, payment]);

      const signed = await wallet.signTransaction([
        [
          { txn: appCall, signers: [address.trim()] },
          { txn: payment, signers: [address.trim()] },
        ],
      ]);

      await algodClient.sendRawTransaction(signed.flat()).do();

      alert("✅ Repayment transaction sent!");

      setTimeout(loadPool, 2500);

    } catch (err) {
      console.error("REPAY ERROR:", err);
      alert("Repayment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-xs uppercase font-bold mb-2">
            Liquidity Pool (On-Chain)
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">
              {poolBalance.toFixed(2)}
            </span>
            <span className="text-indigo-600 font-bold">
              ALGO
            </span>
          </div>

          <div className="mt-4 text-sm">
            Fixed APR:{" "}
            <span className="text-green-600 font-bold">
              {rate}%
            </span>
          </div>
        </div>

        {debt > 0 && (
          <div className="bg-red-50 p-6 rounded-2xl border">
            <h3 className="text-red-700 text-xs uppercase font-bold mb-2">
              Current Debt
            </h3>

            <div className="text-3xl font-black text-red-800">
              {debt.toFixed(2)} ALGO
            </div>

            <button
              onClick={handleRepay}
              disabled={isProcessing}
              className="w-full mt-4 bg-red-600 text-white py-3 rounded-xl font-bold"
            >
              {isProcessing ? "Processing..." : "Repay Full Debt"}
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-6">
            Request a Student Loan
          </h2>

          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full"
          />

          <div className="mt-2 text-lg">
            Borrow:{" "}
            <span className="font-bold text-indigo-600">
              {loanAmount} ALGO
            </span>
          </div>

          <div className="mt-4">
            Total to repay:{" "}
            <span className="font-bold">
              {(loanAmount * (1 + rate / 100)).toFixed(2)} ALGO
            </span>
          </div>

          <button
            onClick={handleBorrow}
            disabled={debt > 0 || isProcessing}
            className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-bold"
          >
            {debt > 0
              ? "Active Loan Exists"
              : isProcessing
                ? "Processing..."
                : "Borrow Algos Now"}
          </button>
        </div>
      </div>
    </div>
  );
};
