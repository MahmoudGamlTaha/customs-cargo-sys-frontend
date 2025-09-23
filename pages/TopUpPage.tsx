import React, { useState } from 'react';
import Card from '../components/Card';
import { CreditCardIcon, BankIcon, PaymentServiceIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

interface TopUpPageProps {
    onTopUp: (amount: number, method: string) => void;
}

const TopUpPage: React.FC<TopUpPageProps> = ({ onTopUp }) => {
    const { t } = useLanguage();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const handlePayment = () => {
        const numericAmount = parseFloat(amount);
        if (numericAmount > 0 && selectedMethod) {
            onTopUp(numericAmount, selectedMethod);
        }
    };

    const PaymentMethodCard: React.FC<{ method: string, title: string, icon: React.ReactNode }> = ({ method, title, icon }) => (
        <div 
            className={`border-2 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center h-full ${selectedMethod === method ? 'border-brand-primary shadow-lg scale-105' : 'border-gray-200 dark:border-gray-700'}`}
            onClick={() => setSelectedMethod(method)}
        >
            {icon}
            <p className="mt-2 font-semibold whitespace-nowrap">{title}</p>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('wallet.topUpPage.title')}</h2>
            </div>
            
            <Card cardTitle={t('wallet.topUpPage.subtitle')}>
                <div className="p-4 space-y-6">
                    <div>
                         <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wallet.topUpPage.amountLabel')}</label>
                         <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-brand-primary focus:border-brand-primary"
                         />
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('wallet.topUpPage.methodTitle')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <PaymentMethodCard method="card" title={t('wallet.topUpPage.card')} icon={<CreditCardIcon />} />
                            <PaymentMethodCard method="sadad" title={t('wallet.topUpPage.sadad')} icon={<PaymentServiceIcon />} />
                            <PaymentMethodCard method="transfer" title={t('wallet.topUpPage.transfer')} icon={<BankIcon />} />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handlePayment} 
                            className="px-6 sm:px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            disabled={!selectedMethod || !(parseFloat(amount) > 0)}
                        >
                            {t('wallet.topUpPage.confirmButton')}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TopUpPage;