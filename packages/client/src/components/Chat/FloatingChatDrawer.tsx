import React, { useState } from 'react';
import type { ChatMessage, GameEvent } from '@dhandha/shared';
import { ChatPanel } from './ChatPanel';

interface FloatingChatDrawerProps {
  messages: ChatMessage[];
  events: GameEvent[];
  onSendMessage: (text: string) => void;
  onSendTaunt: (tauntId: string) => void;
}

export const FloatingChatDrawer: React.FC<FloatingChatDrawerProps> = ({
  messages,
  events,
  onSendMessage,
  onSendTaunt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = messages.length > 0 ? messages.length : 0;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] hover:border-[#dc2626] shadow-2xl transition-all duration-200"
          title="Open Chat & Event Feed"
        >
          <span className="text-base group-hover:scale-110 transition-transform">💬</span>
          <span className="text-xs font-black uppercase tracking-wider">Chat & Events</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-[#dc2626] text-white font-black px-1.5 py-0.2 rounded-full shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        /* Floating Slide-Up Overlay (Does not push or resize the board) */
        <div className="w-80 sm:w-96 h-[420px] rounded-2xl bg-[#18181b] border-2 border-[#27272a] shadow-2xl flex flex-col overflow-hidden animate-slide-in">
          {/* Header Bar with Close */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#27272a] bg-[#121215]">
            <div className="flex items-center gap-2">
              <span className="text-sm">💬</span>
              <span className="font-display font-black text-xs text-[#fafafa] uppercase tracking-wider">
                Live Activity & Chat
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-bold flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Embedded Chat Panel */}
          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={messages}
              events={events}
              onSendMessage={onSendMessage}
              onSendTaunt={onSendTaunt}
            />
          </div>
        </div>
      )}
    </div>
  );
};
