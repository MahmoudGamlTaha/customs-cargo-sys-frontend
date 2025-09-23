import React, { useState } from 'react';
import Card from '../components/Card';
import AIChatbot from '../components/AIChatbot';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';
import { SupportTicket } from '../types';
import { CloseIcon } from '../components/icons';

const NewTicketModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title) {
      onSubmit(title);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg" cardTitle={t('support.otherOptions.submitTicket')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <CloseIcon />
          </button>
          <div>
            <label htmlFor="title" className="block text-sm font-bold mb-1">{t('support.newTicket.ticketSubject')}</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800">
              {t('support.otherOptions.submitTicket')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface SupportPageProps {
  supportTickets: SupportTicket[];
  onSubmitTicket: (title: string) => Promise<boolean>;
}

const SupportPage: React.FC<SupportPageProps> = ({ supportTickets, onSubmitTicket }) => {
  const { t } = useLanguage();
  const [isModalOpen, setModalOpen] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState('');
  const [kbStatus, setKbStatus] = useState('');
  
  const handleAction = (setStatus: React.Dispatch<React.SetStateAction<string>>) => {
      setStatus('loading');
      setTimeout(() => {
          setStatus('done');
           setTimeout(() => {
              setStatus('');
          }, 2000);
      }, 1000);
  };
  
  const getButtonText = (status: string, initialKey: TranslationKey, loadingKey: TranslationKey, doneKey: TranslationKey) => {
    if (status === 'loading') return t(loadingKey);
    if (status === 'done') return t(doneKey);
    return t(initialKey);
  };
  
  const getStatusClass = (status: SupportTicket['status']) => {
    switch (status) {
        case 'open': return 'text-blue-600 dark:text-blue-400';
        case 'in_review': return 'text-yellow-600 dark:text-yellow-400';
        case 'solved': return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <>
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(title) => onSubmitTicket(title)}
      />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('support.title')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
              <AIChatbot />
          </div>
          <div className="space-y-6">
              <Card cardTitle={t('support.otherOptions.title')}>
                   <div className="flex flex-col space-y-3">
                      <button 
                          onClick={() => setModalOpen(true)} 
                          className="text-right w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold disabled:opacity-70"
                      >
                         {t('support.otherOptions.submitTicket')}
                      </button>
                      <button 
                          onClick={() => handleAction(setConsultationStatus)} 
                          className="text-right w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold disabled:opacity-70"
                          disabled={!!consultationStatus}
                      >
                         {getButtonText(consultationStatus, 'support.otherOptions.requestConsultation', 'support.otherOptions.loading', 'support.otherOptions.done')}
                      </button>
                      <button 
                          onClick={() => handleAction(setKbStatus)} 
                          className="text-right w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold disabled:opacity-70"
                          disabled={!!kbStatus}
                      >
                         {getButtonText(kbStatus, 'support.otherOptions.browseKb', 'support.otherOptions.loading', 'support.otherOptions.done')}
                      </button>
                  </div>
              </Card>
              <Card cardTitle={t('support.trackTickets.title')}>
                   <div className="space-y-2">
                      {supportTickets?.map(ticket => (
                       <div key={ticket.id} className="p-3 border dark:border-gray-700 rounded-md">
                          <p className="font-semibold">{ticket.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t('support.trackTickets.status')}: 
                              <span className={`font-bold ${getStatusClass(ticket.status)}`}>
                                  {t(`support.trackTickets.status_${ticket.status.replace('_', '')}` as TranslationKey)}
                              </span>
                          </p>
                      </div>
                      ))}
                   </div>
              </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;