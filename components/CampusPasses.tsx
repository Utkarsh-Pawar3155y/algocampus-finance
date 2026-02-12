import React, { useEffect, useState } from "react";
import algosdk from "algosdk";

interface Props {
  address: string;
}

const BRONZE_ASA = 755306293;
const SILVER_ASA = 755306303;

const indexer = new algosdk.Indexer(
  "",
  "https://testnet-idx.algonode.cloud",
  ""
);

export const CampusPasses: React.FC<Props> = ({ address }) => {
  const [hasBronze, setHasBronze] = useState(false);
  const [hasSilver, setHasSilver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const loadPasses = async () => {
      setLoading(true);
      setHasBronze(false);
      setHasSilver(false);

      try {
        console.log("Checking campus passes for:", address);

        const res = await indexer.lookupAccountAssets(address).do();
        const assets = res.assets || [];

        console.log("All assets:", assets);

        for (const asset of assets) {
          const assetId = Number(asset.assetId);
          const amount = Number(asset.amount);

          if (assetId === BRONZE_ASA && amount >= 1) {
            setHasBronze(true);
          }

          if (assetId === SILVER_ASA && amount >= 1) {
            setHasSilver(true);
          }
        }
      } catch (err) {
        console.error("Indexer error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPasses();
  }, [address]);

  if (loading) {
    return <div className="text-slate-500">Loading campus passes…</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">
        Campus Passes (On-Chain)
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bronze */}
        <div
          className={`rounded-2xl p-6 border ${
            hasBronze ? "border-amber-500" : "border-slate-300 opacity-60"
          }`}
        >
          <h3 className="text-xl font-bold">🥉 Bronze Campus Pass</h3>
          <p className="text-sm text-slate-500 mt-1">ASA ID: {BRONZE_ASA}</p>
          <p className="mt-4 font-semibold">
            Status:{" "}
            {hasBronze ? (
              <span className="text-green-600">Owned</span>
            ) : (
              <span className="text-red-500">Not owned</span>
            )}
          </p>
        </div>

        {/* Silver */}
        <div
          className={`rounded-2xl p-6 border ${
            hasSilver ? "border-slate-500" : "border-slate-300 opacity-60"
          }`}
        >
          <h3 className="text-xl font-bold">🥈 Silver Campus Pass</h3>
          <p className="text-sm text-slate-500 mt-1">ASA ID: {SILVER_ASA}</p>
          <p className="mt-4 font-semibold">
            Status:{" "}
            {hasSilver ? (
              <span className="text-green-600">Owned</span>
            ) : (
              <span className="text-red-500">Not owned</span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-slate-100 p-4 rounded-xl text-sm text-slate-600">
        These passes are Algorand Standard Assets (ASAs) on TestNet and are frozen
        to your wallet, making them non-transferable.
      </div>
    </div>
  );
};
