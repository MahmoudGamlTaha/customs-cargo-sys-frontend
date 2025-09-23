import React, { useState } from 'react';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';
import { Dispute } from '../types';
import { CloseIcon } from '../components/icons';

const NewDisputeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRegister: (against: string, details: string) => void;
}> = ({ isOpen, onClose, onRegister }) => {
  const { t } = useLanguage();
  const [against, setAgainst] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (against && details) {
      onRegister(against, details);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg" cardTitle={t('disputeResolution.register.button')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <CloseIcon />
          </button>
          <div>
            <label htmlFor="against" className="block text-sm font-bold mb-1">{t('disputeResolution.table.opponent')}</label>
            <input
              type="text"
              id="against"
              value={against}
              onChange={(e) => setAgainst(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              required
            />
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-bold mb-1">{t('disputeDetails.title')}</label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              rows={5}
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800">
              {t('disputeResolution.register.button')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};


interface DisputeResolutionProps {
    disputes: Dispute[];
    onRegisterDispute: (againstUser: string, details: string) => Promise<boolean>;
}

const getStatusInfo = (status: Dispute['status']) => {
    switch(status) {
        case 'in_review': return { key: 'under_review', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
        case 'open': return { key: 'under_review', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }; // Assuming open is like new
        case 'resolved': return { key: 'judgment_issued', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
        case 'closed': return { key: 'judgment_issued', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
        default: return { key: 'under_review', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
    }
};

const DisputeResolution: React.FC<DisputeResolutionProps> = ({ disputes, onRegisterDispute }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <>
            <NewDisputeModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onRegister={(against, details) => onRegisterDispute(against, details)}
            />
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('disputeResolution.title')}</h2>
                </div>
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800"
                    >
                        {t('disputeResolution.register.button')}
                    </button>
                </div>
                <Card cardTitle={t('disputeResolution.table.title')}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="py-2 px-4">{t('disputeResolution.table.caseNo')}</th>
                                    <th className="py-2 px-4">{t('disputeResolution.table.opponent')}</th>
                                    <th className="py-2 px-4">{t('disputeResolution.table.date')}</th>
                                    <th className="py-2 px-4">{t('disputeResolution.table.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disputes?.map((dispute) => {
                                    const statusInfo = getStatusInfo(dispute.status);
                                    return (
                                    <tr 
                                        key={dispute.id} 
                                        className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() => navigate(`/disputes/${dispute.id}`)}
                                    >
                                        <td className="py-3 px-4">{dispute.id}</td>
                                        <td className="py-3 px-4">{dispute.againstUser}</td>
                                        <td className="py-3 px-4">{new Date(dispute.submittedAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusInfo.class}`}>
                                                {t(`disputeResolution.status.${statusInfo.key}` as any)}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default DisputeResolution;