
import React from 'react';
import Card from '../components/Card';
import { Wallet, WalletTransaction, WalletTransactionType } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface WalletPageProps {
    wallet: Wallet | undefined;
    transactions: WalletTransaction[];
}

const getTransactionTypeClass = (type: WalletTransactionType) => {
    switch (type) {
        case WalletTransactionType.Charge:
        case WalletTransactionType.TransferIn:
            return 'text-green-600 dark:text-green-400';
        case WalletTransactionType.Payment:
        case WalletTransactionType.TransferOut:
            return 'text-red-600 dark:text-red-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

const getTransactionSign = (type: WalletTransactionType) => {
    switch (type) {
        case WalletTransactionType.Charge:
        case WalletTransactionType.TransferIn:
            return '+';
        case WalletTransactionType.Payment:
        case WalletTransactionType.TransferOut:
            return '-';
        default:
            return '';
    }
}

const WalletPage: React.FC<WalletPageProps> = ({ wallet, transactions }) => {
    const { t } = useLanguage();

    if (!wallet) {
        return (
            <div>
                <Card><p className="p-8 text-center text-red-600 dark:text-red-400">Wallet not found.</p></Card>
            </div>
        );
    }
    
    const sortedTransactions = [...transactions]?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('wallet.title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card cardTitle={t('wallet.currentBalance')} className="md:col-span-1">
                    <p className="text-4xl font-bold text-brand-primary dark:text-blue-300">
                        {wallet.balance.toFixed(2)}
                        <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400 ml-2">{t('wallet.currency')}</span>
                    </p>
                </Card>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                     <Link to="/top-up" className="block">
                        <Card className="h-full flex items-center justify-center text-center bg-green-500 text-white hover:bg-green-600 transition-colors">
                            <div className="p-2 sm:p-4">
                                <h3 className="text-lg sm:text-xl font-bold">{t('wallet.topUpButton')}</h3>
                            </div>
                        </Card>
                    </Link>
                     <Link to="/transfer" className="block">
                        <Card className="h-full flex items-center justify-center text-center bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                             <div className="p-2 sm:p-4">
                                <h3 className="text-lg sm:text-xl font-bold">{t('wallet.transferButton')}</h3>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>

            <Card cardTitle={t('wallet.historyTitle')}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="py-2 px-4 whitespace-nowrap">{t('wallet.table.date')}</th>
                                <th className="py-2 px-4 whitespace-nowrap">{t('wallet.table.type')}</th>
                                <th className="py-2 px-4 whitespace-nowrap">{t('wallet.table.description')}</th>
                                <th className="py-2 px-4 whitespace-nowrap">{t('wallet.table.amount')}</th>
                                <th className="py-2 px-4 whitespace-nowrap">{t('wallet.table.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTransactions?.length > 0 ? sortedTransactions?.map(tx => (
                                <tr key={tx.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-3 px-4 whitespace-nowrap">{new Date(tx.date).toLocaleString()}</td>
                                    <td className="py-3 px-4 whitespace-nowrap font-semibold">{t(`wallet.transactionTypes.${tx.type.replace('_','-')}` as TranslationKey)}</td>
                                    <td className="py-3 px-4">{tx.description}</td>
                                    <td className={`py-3 px-4 whitespace-nowrap font-mono font-bold ${getTransactionTypeClass(tx.type)}`}>
                                        {getTransactionSign(tx.type)} {tx.amount.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            tx.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {t(`wallet.transactionStatuses.${tx.status}` as TranslationKey)}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center py-8">{t('wallet.noTransactions')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

        </div>
    );
};

export default WalletPage;
