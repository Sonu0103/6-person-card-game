import React from 'react';

export function LandingPage({ onPlayOffline, onPlayOnline }) {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('/card_game_bg_luxury.png')`,
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-5xl p-4 flex flex-col items-center">
                {/* Title Section */}
                <div className="text-center mb-16 animate-fade-in-down">
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 drop-shadow-2xl mb-6 tracking-tight font-serif">
                        CARD GAME 6
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-yellow-500/80">
                        <span className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500"></span>
                        <p className="text-lg md:text-xl font-medium tracking-[0.3em] uppercase text-yellow-100/90">
                            The Royal Table
                        </p>
                        <span className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></span>
                    </div>
                </div>

                {/* Buttons Container */}
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl animate-fade-in-up">
                    {/* Offline Button */}
                    <button
                        onClick={onPlayOffline}
                        className="group flex-1 relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 hover:border-yellow-500/50 rounded-xl p-8 transition-all duration-500 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-900/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 mb-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center group-hover:border-yellow-500/50 group-hover:bg-slate-700 transition-all duration-500">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-200 group-hover:text-yellow-100 mb-2 transition-colors duration-500">Play Offline</h2>
                            <p className="text-slate-500 text-center text-sm group-hover:text-slate-400 transition-colors duration-500">
                                Practice against AI
                            </p>
                        </div>
                    </button>

                    {/* Online Button */}
                    <button
                        onClick={onPlayOnline}
                        className="group flex-1 relative overflow-hidden bg-gradient-to-b from-emerald-900/80 to-slate-900 border border-emerald-800 rounded-xl p-8 transition-all duration-500 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/40 hover:border-emerald-400/50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 mb-6 rounded-full bg-emerald-950/50 border border-emerald-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-900/50 transition-all duration-500">
                                <span className="text-3xl">🌍</span>
                            </div>
                            <h2 className="text-2xl font-bold text-emerald-100 group-hover:text-white mb-2 transition-colors duration-500">Play Online</h2>
                            <p className="text-emerald-400/60 text-center text-sm group-hover:text-emerald-300/80 transition-colors duration-500">
                                Join the Global Table
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
