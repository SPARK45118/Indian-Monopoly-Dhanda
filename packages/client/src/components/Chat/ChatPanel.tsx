import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GameEvent } from '@dhandha/shared';
import { TAUNTS } from '@dhandha/shared';
import { formatTime } from '../../utils/format';

interface ChatPanelProps {
  messages: ChatMessage[];
  events?: GameEvent[];
  onSendMessage: (msg: string) => void;
  onSendTaunt: (tauntText: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  events = [],
  onSendMessage,
  onSendTaunt,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');
  const [input, setInput] = useState('');
  const [showTaunts, setShowTaunts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, events, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden border border-[#1e3054] bg-[#0E1628]">
      {/* Header Tabs: Chat vs Activity Log */}
      <div className="px-2 py-1.5 border-b border-[#1e3054] flex items-center justify-between bg-[#0A101C]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'chat'
                ? 'bg-[#131B2E] text-[#F5C75A] border border-[#1e3054]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💬</span>
            <span>CHAT ({messages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'activity'
                ? 'bg-[#131B2E] text-[#F5C75A] border border-[#1e3054]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📜</span>
            <span>ACTIVITY LOG ({events.length})</span>
          </button>
        </div>

        {activeTab === 'chat' && (
          <button
            onClick={() => setShowTaunts(!showTaunts)}
            className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${
              showTaunts ? 'bg-[#D9A441] text-[#080B14]' : 'bg-[#131B2E] text-[#D9A441] hover:bg-[#1e3054]'
            }`}
          >
            🔥 Taunts
          </button>
        )}
      </div>

      {/* Taunts Quick Selector */}
      {activeTab === 'chat' && showTaunts && (
        <div className="p-1.5 border-b border-[#1e3054] bg-[#0A101C] grid grid-cols-4 gap-1 animate-slide-in">
          {TAUNTS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSendTaunt(`${t.emoji} ${t.text}`);
                setShowTaunts(false);
              }}
              className="px-1.5 py-1 bg-[#131B2E] hover:bg-[#1e3054] border border-[#1e3054] rounded text-[10px] font-semibold truncate transition-all text-left text-slate-200"
            >
              {t.emoji} {t.text}
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: Chat Messages list */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col-reverse gap-1.5">
            <div ref={messagesEndRef} />
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg text-xs ${
                  msg.isTaunt
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : msg.isSystem
                    ? 'bg-[#131B2E] text-slate-400 italic text-[10px]'
                    : 'bg-[#131B2E]/70 border border-[#1e3054]/50'
                }`}
              >
                {!msg.isSystem && (
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className="font-bold text-[10px]"
                      style={{ color: msg.playerColor }}
                    >
                      {msg.playerName}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`text-xs ${msg.isTaunt ? 'font-bold text-amber-300' : 'text-slate-200'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-xs my-auto italic">
                No chat messages yet. Say hi! 👋
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-[#1e3054] bg-[#0A101C] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="game-input text-xs py-1.5 px-2.5 bg-[#131B2E] border-[#1e3054]"
              maxLength={150}
            />
            <button type="submit" className="btn-secondary py-1.5 px-3 text-xs bg-[#131B2E]">
              Send
            </button>
          </form>
        </>
      )}

      {/* TAB 2: Activity Log Stream */}
      {activeTab === 'activity' && (
        <div className="flex-1 overflow-y-auto p-2.5 flex flex-col-reverse gap-1.5">
          <div ref={eventsEndRef} />
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-2 rounded-lg bg-[#131B2E]/80 border border-[#1e3054] flex items-start gap-2 text-xs"
            >
              <div className="text-base shrink-0 mt-0.5">{evt.icon || '📌'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                  <span className="font-bold" style={{ color: evt.playerColor || '#F5C75A' }}>
                    {evt.playerName || 'GAME'}
                  </span>
                  <span>{formatTime(evt.timestamp)}</span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium leading-snug">
                  {evt.message}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center text-slate-500 text-xs my-auto italic">
              No activity recorded yet. Roll the dice to start! 🎲
            </div>
          )}
        </div>
      )}
    </div>
  );
};
