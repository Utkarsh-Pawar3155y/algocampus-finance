
import React, { useState } from 'react';
import { Campaign } from '../types';

interface Props {
  address: string;
}

export const Crowdfunding: React.FC<Props> = ({ address }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      founder: "A7X...B4Y",
      title: "Textbooks for CS101",
      target: 250,
      raised: 185,
      deadline: Date.now() + 86400000 * 5,
      claimed: false
    },
    {
      id: 2,
      founder: "9Z2...P0L",
      title: "Robot Competition Entry",
      target: 1000,
      raised: 1000,
      deadline: Date.now() - 86400000, // Ended
      claimed: false
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(100);

  const handleCreate = () => {
    if (!newTitle) return;
    const campaign: Campaign = {
      id: Date.now(),
      founder: address,
      title: newTitle,
      target: newTarget,
      raised: 0,
      deadline: Date.now() + 86400000 * 30,
      claimed: false
    };
    setCampaigns([campaign, ...campaigns]);
    setNewTitle('');
    alert("Campaign smart contract deployed on TestNet!");
  };

  const handleDonate = (id: number) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id ? { ...c, raised: c.raised + 10 } : c
    ));
    alert("10 ALGO successfully contributed!");
  };

  return (
    <div className="space-y-10">
      <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-black mb-4">Support Student Innovation</h2>
          <p className="text-indigo-100 mb-8 text-lg opacity-80">Launch your own on-chain campaign. Funds are locked in smart contracts and only released if you hit your goal.</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              placeholder="Campaign Title..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-grow p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 outline-none focus:ring-2 focus:ring-white/50"
            />
            <div className="flex items-center bg-white/10 rounded-xl px-4 border border-white/20">
               <span className="text-xs font-bold mr-2">GOAL:</span>
               <input 
                 type="number" 
                 value={newTarget}
                 onChange={(e) => setNewTarget(Number(e.target.value))}
                 className="bg-transparent w-16 font-bold outline-none"
               />
               <span className="text-xs">ALGO</span>
            </div>
            <button 
              onClick={handleCreate}
              className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-black hover:bg-indigo-50 transition-all shadow-lg"
            >
              Start
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{c.title}</h3>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.deadline < Date.now() ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}>
                  {c.deadline < Date.now() ? 'Ended' : 'Active'}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 font-mono mb-6">Founder: {c.founder}</p>
              
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span className="text-indigo-600">{c.raised} / {c.target} ALGO</span>
                <span className="text-slate-500">{Math.round((c.raised/c.target) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (c.raised/c.target) * 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center text-xs text-slate-500 gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {c.deadline > Date.now() 
                  ? `${Math.round((c.deadline - Date.now()) / 86400000)} days left`
                  : 'Deadline passed'}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl">
              {c.deadline > Date.now() ? (
                <button 
                  onClick={() => handleDonate(c.id)}
                  className="w-full bg-white border border-indigo-200 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  Contribute 10 ALGO
                </button>
              ) : (
                <button 
                  disabled={c.raised < c.target}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    c.raised >= c.target 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {c.raised >= c.target ? 'Claim Funds' : 'Claim Refund'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
