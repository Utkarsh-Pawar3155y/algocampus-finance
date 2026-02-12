import React, { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { LendingPool } from './components/LendingPool';
import { Crowdfunding } from './components/Crowdfunding';
import { CampusPasses } from './components/CampusPasses';
import { PeraWalletConnect } from '@perawallet/connect';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lending' | 'crowdfund' | 'passes'>('lending');
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<PeraWalletConnect | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* HEADER */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-indigo-700 font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase">
              AlgoCampus
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex bg-indigo-800/50 rounded-full p-1">
            {[
              { id: 'lending', label: 'Lending' },
              { id: 'crowdfund', label: 'Crowdfund' },
              { id: 'passes', label: 'Passes' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Wallet */}
          <WalletConnect
            onConnect={(addr, walletInstance) => {
              setAddress(addr);
              setWallet(walletInstance);
            }}
          />
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {!address ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-slate-600 mb-6">
                You need to connect an Algorand wallet (TestNet) to interact with Campus Finance.
              </p>
              <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">
                Algorand TestNet Required
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            
            {activeTab === 'lending' && wallet && (
              <LendingPool address={address} wallet={wallet} />
            )}

            {activeTab === 'crowdfund' && (
              <Crowdfunding address={address} />
            )}

            {activeTab === 'passes' && (
              <CampusPasses address={address} />
            )}

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Built for Hackspiration ’26 | Powered by Algorand Blockchain
          </p>
          <p className="text-xs mt-2 opacity-50">
            Experimental Hackathon Project - Use at own risk.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
