import { Paperclip, Send, Mic } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function InputArea({ 
  onSendMessage, 
  isGenerating,
  tier,
  setTier
}: { 
  onSendMessage: (msg: string) => void, 
  isGenerating: boolean,
  tier: string,
  setTier: (tier: string) => void
}) {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onSendMessage(`I have uploaded a file: ${data.filename}. Please analyze it.`);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.start();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent pt-10 pb-6 px-4 md:px-8">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex gap-2 mb-3">
          {["basic", "advanced", "deep_research"].map((m) => (
            <button
              key={m}
              onClick={() => setTier(m)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
                tier === m 
                  ? "bg-emerald-500 text-black" 
                  : "bg-[#222] text-gray-300 hover:bg-[#333]"
              )}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative flex items-end gap-2 bg-[#212121] border border-white/10 rounded-2xl p-2 shadow-xl focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv,.xlsx,.pdf"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isGenerating}
            className={cn(
              "p-2 rounded-xl transition-colors shrink-0",
              isUploading ? "text-emerald-500 animate-pulse" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Analyze Tally report, compare competitor, forecast growth..."
            className="w-full max-h-[200px] bg-transparent text-gray-100 placeholder:text-gray-500 resize-none outline-none py-2.5 px-1 text-[15px] leading-relaxed"
            rows={1}
            disabled={isGenerating || isUploading}
          />
          
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={startVoice}
              className="p-2 text-gray-400 hover:text-gray-200 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating || isUploading}
              className={cn(
                "p-2 rounded-xl transition-all flex items-center justify-center",
                input.trim() && !isGenerating && !isUploading
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">BharatMind can make mistakes. Verify critical financial data.</p>
        </div>
      </div>
    </div>
  );
}
