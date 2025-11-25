import React from 'react';

export function Scoreboard({ scores, myTeam }) {
    return (
        <div className="flex gap-8 justify-center mt-6 mb-4">
            <div className={`
                flex flex-col items-center bg-slate-800/90 backdrop-blur border-4 rounded-2xl p-6 shadow-2xl min-w-[140px] transform transition-all hover:scale-105
                ${myTeam === 'A' ? 'border-yellow-500 shadow-yellow-900/20' : 'border-slate-600'}
            `}>
                <div className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Team A</div>
                <div className={`text-5xl font-black ${scores.A >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {scores.A}
                </div>
                {myTeam === 'A' && <div className="text-xs text-yellow-500 font-black mt-2 tracking-wider">YOU</div>}
            </div>

            <div className={`
                flex flex-col items-center bg-slate-800/90 backdrop-blur border-4 rounded-2xl p-6 shadow-2xl min-w-[140px] transform transition-all hover:scale-105
                ${myTeam === 'B' ? 'border-yellow-500 shadow-yellow-900/20' : 'border-slate-600'}
            `}>
                <div className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Team B</div>
                <div className={`text-5xl font-black ${scores.B >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {scores.B}
                </div>
                {myTeam === 'B' && <div className="text-xs text-yellow-500 font-black mt-2 tracking-wider">YOU</div>}
            </div>
        </div>
    );
}
