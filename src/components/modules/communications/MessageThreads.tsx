'use client';

import React, { useState } from 'react';
import { MessageThread, ThreadMessage } from '@/types';
import { Icons } from '../../icons';

interface MessageThreadsProps {
  threads: MessageThread[];
  messages: ThreadMessage[];
  selectedThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  onSendMessage: (threadId: string, content: string) => void;
  className?: string;
}

export function MessageThreads({ 
  threads, 
  messages, 
  selectedThreadId, 
  onThreadSelect, 
  onSendMessage,
  className = "" 
}: MessageThreadsProps) {
  const [newMessage, setNewMessage] = useState('');

  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const threadMessages = messages.filter(m => m.threadId === selectedThreadId);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSendMessage = () => {
    if (!selectedThreadId || !newMessage.trim()) return;
    
    onSendMessage(selectedThreadId, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Thread List */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        </div>
        
        <div className="overflow-y-auto h-full">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No message threads found</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onThreadSelect(thread.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-100 ${
                  selectedThreadId === thread.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${!thread.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {thread.title}
                      </p>
                      {!thread.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">
                      {thread.participants.length} participant{thread.participants.length !== 1 ? 's' : ''}
                    </p>
                    
                    {thread.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {thread.lastMessage}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(thread.lastActivity)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">{selectedThread.title}</h3>
              <p className="text-sm text-gray-500">
                {selectedThread.participants.join(', ')}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {threadMessages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>No messages in this thread</p>
                </div>
              ) : (
                threadMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {message.sender.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{message.sender}</p>
                        <p className="text-xs text-gray-500">{formatTime(message.timestamp)}</p>
                      </div>
                      
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs text-blue-600">
                              <Icons.Office size={12} />
                              <span>{attachment}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Icons.ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Icons.Communications size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Select a thread to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageThreads;
