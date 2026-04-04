import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Send, Lock } from 'lucide-react';
import type { ChatMessage, ChatRoom } from '../../types';

// Generate a stable anonymous username for this session
function generateUsername(): string {
  const adjectives = ['Safe', 'Brave', 'Kind', 'Calm', 'Warm', 'Gentle', 'Strong', 'Hopeful', 'Quiet', 'Bold'];
  const nouns      = ['Sparrow', 'River', 'Maple', 'Cedar', 'Willow', 'Iris', 'Dawn', 'Sage', 'Rain', 'Oak'];
  const adj  = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num  = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${noun}${num}`;
}

const SESSION_USERNAME_KEY = 'saferoots_anon_username';

function getOrCreateUsername(): string {
  const stored = sessionStorage.getItem(SESSION_USERNAME_KEY);
  if (stored) return stored;
  const name = generateUsername();
  sessionStorage.setItem(SESSION_USERNAME_KEY, name);
  return name;
}

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? '';

interface Props {
  room: ChatRoom;
}

export function ChatWindow({ room }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const username = useRef(getOrCreateUsername()).current;

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.emit('join-room', room);

    socket.on('chat-history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.emit('leave-room', room);
      socket.disconnect();
    };
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > 500) return;
    socketRef.current?.emit('chat-message', {
      room,
      message: trimmed,
      username,
    });
    setInput('');
  }, [input, room, username]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Privacy notice */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-2 rounded-xl mb-3">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>
          You are chatting anonymously as <strong>{username}</strong>. No personal data is stored.
        </span>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-1">
        <span>{messages.length} messages</span>
        <span className={`flex items-center gap-1 ${connected ? 'text-green-500' : 'text-gray-400'}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
          {connected ? 'Connected' : 'Connecting…'}
        </span>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-12">
            No messages yet. Be the first to say something.
          </div>
        )}
        {messages.map(msg => {
          const isOwn = msg.username === username;
          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-400 mb-0.5 px-1">
                {isOwn ? 'You' : msg.username}
              </span>
              <div
                className={`max-w-xs lg:max-w-md px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-primary-700 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.message}
              </div>
              <span className="text-[10px] text-gray-300 mt-0.5 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <textarea
          className="input flex-1 resize-none leading-relaxed"
          rows={2}
          placeholder="Type a message… (Enter to send)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          aria-label="Chat message input"
        />
        <button
          onClick={send}
          disabled={!input.trim() || !connected}
          className="btn-primary self-end flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
