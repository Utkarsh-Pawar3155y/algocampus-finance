
import React from 'react';

export const ArchitectureOverview: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-3xl font-black mb-6 text-slate-800">Architecture Overview</h2>
        
        <div className="bg-slate-900 p-6 rounded-xl font-mono text-green-400 overflow-x-auto whitespace-pre">
{`
[ Frontend: React + Vite ]
       |
       | (algosdk + PeraConnect)
       v
[ Algorand TestNet Layer ]
       |
       +--- [ Lending Smart Contract ] (PyTeal)
       |      - Global State: Pool Liquidity, InterestRate
       |      - Local State: Debt, DueDate, RepaymentCount
       |
       +--- [ Crowdfund Smart Contract ] (PyTeal)
       |      - Global State: Campaign Info, FundsRaised
       |      - Local State: Contribution Tracker
       |
       +--- [ Campus Pass ASAs ] (Algorand Assets)
              - Bronze Pass (ID: XXXX)
              - Silver Pass (ID: YYYY)
`}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-8 text-slate-600">
          <div>
            <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest">The Flow</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Users connect using standard Pera Wallet protocols.</li>
              <li>Lending logic uses <strong>Atomic Groups</strong> to ensure "Repayment" + "ASA Distribution" happens in one block.</li>
              <li>Crowdfunding uses <strong>Logic Sig / App State</strong> to lock funds until a specific round (deadline).</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest">On-Chain Rules</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Lending is pool-based; anyone can be a liquidity provider.</li>
              <li>ASAs are frozen by the manager (Contract) to prevent trading.</li>
              <li>Campaign funds only release if Goal > Total before Deadline.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
        <h2 className="text-2xl font-bold mb-4 text-indigo-900">Locked Feature List</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200">
            <h4 className="font-bold text-indigo-700 mb-2">1. Lending Pool</h4>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>✅ Pool Liquidity Deposit</li>
              <li>✅ 5% Fixed Interest Loan</li>
              <li>✅ Local Debt Tracking</li>
              <li>✅ Full Repayments</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200">
            <h4 className="font-bold text-indigo-700 mb-2">2. Campus Pass</h4>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>✅ ASA Minting (Bronze/Silver)</li>
              <li>✅ Auto-Issuance on Repay</li>
              <li>✅ Wallet Verification</li>
              <li>✅ Non-transferable logic</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200">
            <h4 className="font-bold text-indigo-700 mb-2">3. Crowdfunding</h4>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>✅ Campaign Creation</li>
              <li>✅ Contribution Locking</li>
              <li>✅ Target-based Disbursement</li>
              <li>✅ On-Chain Refunds</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
