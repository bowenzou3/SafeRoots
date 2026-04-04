import React, { useState } from 'react';
import { ChatWindow } from '../components/Chat/ChatWindow';
import type { ChatRoom } from '../types';
import { Lock, MessageCircle } from 'lucide-react';

interface RoomOption {
  id: ChatRoom;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const ROOMS: RoomOption[] = [
  {
    id: 'general',
    label: 'General',
    emoji: '💬',
    description: 'Open community chat for all',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    id: 'housing',
    label: 'Housing Help',
    emoji: '🏠',
    description: 'Shelter tips and housing resources',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'women',
    label: 'Women',
    emoji: '♀️',
    description: 'Women-only support space',
    color: 'bg-pink-100 text-pink-700',
  },
  {
    id: 'lgbtq',
    label: 'LGBTQ+',
    emoji: '🏳️‍🌈',
    description: 'LGBTQ+ affirming peer support',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    emoji: '🧠',
    description: 'Mental wellness and coping',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'legal',
    label: 'Legal Questions',
    emoji: '⚖️',
    description: 'Rights, legal aid, and guidance',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'domestic-violence',
    label: 'DV Support',
    emoji: '🛡',
    description: 'Domestic violence survivor support',
    color: 'bg-red-100 text-red-700',
  },
];

export default function PeerSupport() {
  const [activeRoom, setActiveRoom] = useState<ChatRoom>('general');
  const currentRoom = ROOMS.find(r => r.id === activeRoom)!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="w-5 h-5 text-primary-700" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">Anonymous Peer Support</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Connect with peers, volunteers, and social workers in a safe, anonymous space.
          No account required — no personal data stored.
        </p>
      </div>

      {/* Privacy banner */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-green-700">
          <strong>Your privacy is protected.</strong> You are automatically assigned a random anonymous
          username. No IP addresses, emails, or personal details are ever stored. Volunteers are
          trained in trauma-informed care.
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 h-[600px]">
        {/* Room selector */}
        <div className="md:col-span-1 flex flex-col gap-2 overflow-y-auto" role="list" aria-label="Chat rooms">
          {ROOMS.map(room => (
            <button
              key={room.id}
              role="listitem"
              onClick={() => setActiveRoom(room.id)}
              aria-pressed={activeRoom === room.id}
              className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                activeRoom === room.id
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-white border border-gray-100 text-gray-700 hover:border-primary-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span aria-hidden="true">{room.emoji}</span>
                <span className="font-medium text-sm">{room.label}</span>
              </div>
              <p className={`text-xs leading-snug ${
                activeRoom === room.id ? 'text-white/70' : 'text-gray-400'
              }`}>
                {room.description}
              </p>
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="md:col-span-3 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
            <span className="text-lg" aria-hidden="true">{currentRoom.emoji}</span>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">{currentRoom.label}</h2>
              <p className="text-xs text-gray-400">{currentRoom.description}</p>
            </div>
            <span className={`ml-auto tag ${currentRoom.color}`}>Room active</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatWindow key={activeRoom} room={activeRoom} />
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-gray-400 text-center max-w-2xl mx-auto">
        This is a peer support service and is not a substitute for professional mental health treatment.
        If you are in immediate danger, please call 911 or the National DV Hotline: 1-800-799-7233.
      </p>
    </div>
  );
}
