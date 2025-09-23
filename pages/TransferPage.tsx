import React, { useState } from 'react';
import Card from '../components/Card';
import { User } from '../types';
import CustomSelect from '../components/CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface TransferPageProps {
    onTransfer: (toUserId: string, amount: number, notes: string) => Promise<boolean>;
    users: User[];
    balance: number;
}

const TransferPage: React.FC<TransferPageProps> = ({ onTransfer, users, balance }) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [toUserId, setToUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    
    const userOptions = users?.map(user => ({
        value: user.id,
        label: language === 'ar' ? user.nameAr : user.nameEn
    }));
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (toUserId && numericAmount > 0) {
            const success = await onTransfer(toUserId, numericAmount, notes);
            if(success) {
                navigate('/wallet');
            }
        }
    };
    
    const numericAmount = parseFloat(amount) || 0;
    const isFormValid = toUserId && numericAmount > 0 && balance >= numericAmount;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('wallet.transfer.title')}</h2>
            </div>

            <Card cardTitle={t('wallet.transfer.subtitle')}>
                <form className="p-4 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wallet.transfer.recipientLabel')}</label>
                        <CustomSelect
                            options={userOptions}
                            value={toUserId}
                            onChange={setToUserId}
                            placeholder={t('wallet.transfer.selectUserPlaceholder')}
                        />
                    </div>
                    <div>
                         <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wallet.transfer.amountLabel')}</label>
                         <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-brand-primary focus:border-brand-primary"
                            required
                            min="0.01"
                            step="0.01"
                         />
                         {numericAmount > balance && (
                            <p className="text-red-500 text-sm mt-1">{t('wallet.insufficientFunds')}</p>
                         )}
                    </div>
                     <div>
                         <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wallet.transfer.notesLabel')}</label>
                         <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="..."
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-brand-primary focus:border-brand-primary"
                         />
                    </div>
                    <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                        <button 
                            type="submit"
                            disabled={!isFormValid}
                            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {t('wallet.transfer.confirmButton')}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default TransferPage;
