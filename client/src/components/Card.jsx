import React from 'react';

const SUIT_ICONS = {
    'S': '♠',
    'H': '♥',
    'D': '♦',
    'C': '♣'
};

const SUIT_COLORS = {
    'S': 'text-slate-800',
    'H': 'text-red-600',
    'D': 'text-red-600',
    'C': 'text-slate-800'
};

export function Card({ card, onClick, isPlayable = false, isSelected = false }) {
    if (!card) return <div className="w-16 h-24 bg-slate-700 rounded-lg border-2 border-slate-600"></div>;

    return (
        <div
            onClick={isPlayable ? onClick : undefined}
            className={`
                relative w-20 h-32 bg-white rounded-xl shadow-lg border-2 
                flex flex-col items-center justify-center select-none transition-all duration-200
                ${isPlayable ? 'cursor-pointer hover:-translate-y-4 hover:shadow-xl' : ''}
                ${isSelected ? '-translate-y-6 ring-4 ring-yellow-400' : 'border-slate-200'}
            `}
        >
            <div className={`absolute top-2 left-2 text-lg font-bold ${SUIT_COLORS[card.suit]}`}>
                {card.rank}
            </div>
            <div className={`text-4xl ${SUIT_COLORS[card.suit]}`}>
                {SUIT_ICONS[card.suit]}
            </div>
            <div className={`absolute bottom-2 right-2 text-lg font-bold ${SUIT_COLORS[card.suit]} rotate-180`}>
                {card.rank}
            </div>
        </div>
    );
}
