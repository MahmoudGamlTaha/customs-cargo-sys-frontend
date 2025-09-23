
import React, { useState } from 'react';
import Card from '../../components/Card';
import { WalletTransaction, WalletTransactionType, User } from '../../types';
import { useLanguage, TranslationKey } from '../../contexts/LanguageContext';
import { StandardTable, TableColumn, TableAction } from '../../components/StandardTable';

interface StaffWalletPageProps {
    transactions: WalletTransaction[];
    onConfirmTopUp: (transactionId: string) => void;
    users: User[];
}

const StaffWalletPage: React.FC<StaffWalletPageProps> = ({ transactions, onConfirmTopUp, users }) => {
    const { t, language } = useLanguage();
    
    const topUpsToConfirm = transactions.filter(tx => tx.type === WalletTransactionType.Charge && tx.status === 'Pending');

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return userId;
        return language === 'ar' ? user.nameAr : user.nameEn;
    };

    // Define table columns configuration
    const columns: TableColumn<WalletTransaction>[] = [
      {
        key: 'id',
        header: 'Transaction ID',
        translationKey: 'staffPages.wallet.table.transactionId',
        render: (item) => (
          <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {item.id}
          </div>
        ),
      },
      {
        key: 'user',
        header: 'User',
        translationKey: 'staffPages.wallet.table.user',
        render: (item) => (
          <div className="py-3 px-4 font-semibold text-center">
            {getUserName(item.userId)}
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        translationKey: 'staffPages.wallet.table.amount',
        render: (item) => (
          <div className="py-3 px-4 font-mono text-center">
            {item.amount.toFixed(2)}
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        translationKey: 'staffPages.wallet.table.date',
        render: (item) => (
          <div className="py-3 px-4 text-center">
            {new Date(item.date).toLocaleString()}
          </div>
        ),
      },
    ];

    // Define table actions
    const actions: TableAction<WalletTransaction>[] = [
      {
        key: 'confirm',
        label: 'Confirm',
        translationKey: 'staffPages.wallet.confirm',
        onClick: (item) => onConfirmTopUp(item.id),
        className: 'px-4 py-1 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700',
        condition: () => true,
      },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('staffPages.wallet.title')}</h2>
            </div>

            <Card cardTitle={t('staffPages.wallet.cardTitle')}>
                <StandardTable
                    data={topUpsToConfirm}
                    columns={columns}
                    actions={actions}
                    emptyTextTranslationKey="staffPages.wallet.noTopUps"
                    emptyText="No top-ups to confirm"
                    className="overflow-x-auto"
                    tableClassName="w-full"
                    headerClassName="text-md text-center text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 py-3 px-4"
                    rowClassName="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    showActionsColumn={true}
                    actionsColumnHeader="Actions"
                    actionsColumnClassName="py-3 px-4 text-center"
                    actionsContainerClassName="flex justify-center"
                    actionButtonClassName="inline-flex items-center"
                    loadingSpinnerClassName="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
                    emptyStateClassName="text-center py-8"
                    errorStateClassName="text-center py-8 text-red-500"
                    tableWrapperClassName="overflow-x-auto"
                />
            </Card>
        </div>
    );
};

export default StaffWalletPage;
