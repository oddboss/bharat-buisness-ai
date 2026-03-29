import { Paperclip, Send, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function InputArea({ 
  onSendMessage, 
  isGenerating,
  tier,
  setTier
}: { 
  onSendMessage: (msg: string, dataContext?: any) => void, 
  isGenerating: boolean,
  tier: string,
  setTier: (tier: string) => void
}) {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<'listening' | 'processing' | 'executing'>('listening');
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

  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      setIsVoiceMode(true);
      setVoiceState('listening');
      // Simulate voice recognition
      setTimeout(() => {
        setVoiceState('processing');
        setTimeout(() => {
          setVoiceState('executing');
          setTimeout(() => {
            setIsVoiceMode(false);
            onSendMessage("Show me my sales trend for the last 30 days and suggest a growth strategy.");
          }, 1500);
        }, 1500);
      }, 3000);
    } else {
      setIsVoiceMode(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.error) {
        onSendMessage(`Error uploading files: ${data.error}`);
      } else {
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        onSendMessage(`I have uploaded ${files.length} files (${fileNames}). Please analyze this data and provide a business growth report.`, data.dataContext);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      onSendMessage('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Glowing Orb */}
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full orb-animation" />
              <div className="absolute inset-4 bg-emerald-500/40 rounded-full orb-animation" style={{ animationDelay: '1s' }} />
              <div className="absolute inset-8 bg-emerald-500/60 rounded-full orb-animation" style={{ animationDelay: '2s' }} />
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                  <Mic className="w-10 h-10 text-black" />
                </div>
                <p className="text-xl font-bold tracking-widest uppercase text-emerald-400 animate-pulse">
                  {voiceState}...
                </p>
              </div>

              {/* Wave Animation */}
              <div className="absolute bottom-[-100px] flex items-end gap-1 h-20">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-emerald-500/50 rounded-full wave-bar"
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setIsVoiceMode(false)}
              className="mt-32 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-medium transition-all"
            >
              Cancel Voice Mode
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent pt-10 pb-6 px-4 md:px-8">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
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
          </div>
          <div className={cn(
            "relative flex items-end gap-2 bg-white/[0.03] backdrop-blur-2xl border rounded-2xl p-2 shadow-2xl transition-all",
            "border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20"
          )}>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".csv,.xlsx,.pdf"
              multiple
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
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Analyze Tally report, compare competitor, forecast growth..."
              className={cn(
                "w-full max-h-[200px] bg-transparent placeholder:text-gray-500 resize-none outline-none py-2.5 px-1 text-[15px] leading-relaxed",
                "text-gray-100 glass-input"
              )}
              rows={1}
            />
            
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={toggleVoiceMode}
                disabled={isGenerating || isUploading}
                className={cn(
                  "p-2 rounded-xl transition-all flex items-center justify-center",
                  isVoiceMode ? "bg-red-500 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                {isVoiceMode ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => isGenerating ? window.location.reload() : handleSend()}
                disabled={(!input.trim() && !isGenerating) || isUploading}
                className={cn(
                  "p-2 rounded-xl transition-all flex items-center justify-center",
                  isGenerating 
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    : (input.trim() && !isUploading
                      ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                      : "bg-white/5 text-gray-500 cursor-not-allowed")
                )}
              >
                {isGenerating ? <div className="w-3 h-3 bg-current rounded-sm" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">BharatMind AI — India's Personal Business OS</p>
          </div>
        </div>
      </div>
    </>
  );
}
