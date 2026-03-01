import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import Markdown from 'react-markdown';

export function ChatArea({ messages, isGenerating }: { messages: Message[], isGenerating: boolean }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32 scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-emerald-500" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed",
                msg.role === 'user'
                  ? "bg-[#2f2f2f] text-gray-100"
                  : "bg-transparent text-gray-300"
              )}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <div className="markdown-body">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="px-5 py-3.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
