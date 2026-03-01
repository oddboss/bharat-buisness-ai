import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { RightPanel } from './components/RightPanel';
import { Dashboard } from './components/Dashboard';
import { Message } from './types';
import { generateBusinessInsightStream } from './services/geminiService';

export default function App() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activePage, setActivePage] = useState('Chat Intelligence');
  
  const [moduleMessages, setModuleMessages] = useState<Record<string, Message[]>>({
    'Chat Intelligence': [{ id: '1', role: 'assistant', content: 'Welcome to BharatBusinessGPT – India’s AI Business Intelligence & Strategy Operating System. How can I assist you today?' }],
    'Competitive Analysis': [{ id: '1', role: 'assistant', content: 'Welcome to Competitive Analysis. Which competitors would you like to analyze?' }],
    'Financial Forecasting': [{ id: '1', role: 'assistant', content: 'Welcome to Financial Forecasting. Please provide your historical data or assumptions.' }],
    'Strategy Simulator': [{ id: '1', role: 'assistant', content: 'Welcome to Strategy Simulator. What scenario would you like to simulate?' }],
    'Agent Builder': [{ id: '1', role: 'assistant', content: 'Welcome to Agent Builder. What kind of specialized agent do you want to create?' }],
    'Data Connectors': [{ id: '1', role: 'assistant', content: 'Welcome to Data Connectors. Which data source would you like to integrate?' }],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const messages = moduleMessages[activePage] || [];

  const handleSendMessage = async (content: string) => {
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content };
    const assistantMessageId = (Date.now() + 1).toString();
    
    setModuleMessages(prev => ({
      ...prev,
      [activePage]: [...(prev[activePage] || []), newUserMessage, { id: assistantMessageId, role: 'assistant', content: '' }]
    }));
    
    setIsGenerating(true);

    try {
      await generateBusinessInsightStream(content, activePage, (chunkText) => {
        setModuleMessages(prev => {
          const currentMessages = prev[activePage] || [];
          const updatedMessages = currentMessages.map(msg => {
            if (msg.id === assistantMessageId) {
              return { ...msg, content: msg.content + chunkText };
            }
            return msg;
          });
          return { ...prev, [activePage]: updatedMessages };
        });
      });
    } catch (error) {
      setModuleMessages(prev => {
        const currentMessages = prev[activePage] || [];
        const updatedMessages = currentMessages.map(msg => {
          if (msg.id === assistantMessageId) {
            return { ...msg, content: 'Error: Unable to connect to the intelligence engine. Please check your API key and connection.' };
          }
          return msg;
        });
        return { ...prev, [activePage]: updatedMessages };
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f0f0f] text-gray-200 font-sans overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex flex-col flex-1 min-w-0 relative">
        <TopNav toggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)} />
        
        {activePage === 'Dashboard' ? (
          <Dashboard />
        ) : (
          <>
            <ChatArea messages={messages} isGenerating={isGenerating} />
            <InputArea onSendMessage={handleSendMessage} isGenerating={isGenerating} />
          </>
        )}
      </div>
      {isRightPanelOpen && activePage !== 'Dashboard' && <RightPanel onClose={() => setIsRightPanelOpen(false)} />}
    </div>
  );
}
