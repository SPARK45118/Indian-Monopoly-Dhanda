import React from 'react';

interface EventModalProps {
  icon: string;
  title: string;
  description: string;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  icon,
  title,
  description,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-gold max-w-sm w-full p-6 text-center relative overflow-hidden animate-bounce-in">
        <div className="text-5xl mb-3 animate-bounce">{icon}</div>
        <h3 className="font-display font-extrabold text-xl text-gold mb-2">{title}</h3>
        <p className="text-sm text-slate-200 mb-6 leading-relaxed">{description}</p>
        <button onClick={onClose} className="btn-primary w-full py-2.5">
          UNDERSTOOD! 👍
        </button>
      </div>
    </div>
  );
};
