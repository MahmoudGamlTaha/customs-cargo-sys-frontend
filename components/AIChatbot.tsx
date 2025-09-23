import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToAI, startOrUpdateChat } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  text: string;
  isUser: boolean;
}

const AIChatbot: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { text: t('aiChat.initialMessage'), isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startOrUpdateChat(language);
  }, [language]);
  
  useEffect(() => {
    // Reset initial message when language changes
    setMessages([{ text: t('aiChat.initialMessage'), isUser: false }]);
  }, [t, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let fullResponse = '';
    setMessages(prev => [...prev, { text: '', isUser: false }]);

    await sendMessageToAI(input, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessageIndex = newMessages?.length - 1;
            if(newMessages[lastMessageIndex] && !newMessages[lastMessageIndex].isUser) {
                newMessages[lastMessageIndex].text = fullResponse;
            }
            return newMessages;
        });
    }, language);

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[450px] sm:h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200">{t('aiChat.title')}</div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages?.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            {!msg.isUser && <div className="w-8 h-8 rounded-full bg-brand-secondary flex-shrink-0"></div>}
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.isUser ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }} className={language === 'ar' ? 'text-right' : 'text-left'}>{msg.text || '...'}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('aiChat.placeholder')}
          className="flex-1 p-2 border rounded-lg focus:ring-brand-primary focus:border-brand-primary bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="ltr:ml-2 rtl:mr-2 px-4 py-2 bg-brand-primary text-white rounded-lg disabled:bg-gray-400">
          {isLoading ? t('aiChat.sending') : t('aiChat.send')}
        </button>
      </div>
    </div>
  );
};

export default AIChatbot;