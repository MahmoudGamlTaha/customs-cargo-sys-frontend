
import React from 'react';
import Card from '../components/Card';
import { Dispute } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { getFullBranchTitle } from '../utils/getBranchName';

interface ArbitratorDashboardProps {
    disputes: Dispute[];
}

const ArbitratorDashboard: React.FC<ArbitratorDashboardProps> = ({ disputes }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const textAlign = language === 'ar' ? 'text-right' : 'text-left';
    const headerAlign = language === 'ar' ? 'rtl:text-right ltr:text-left' : 'ltr:text-left rtl:text-right';

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">{getFullBranchTitle('arbitrator')}</h2>
            <Card cardTitle={t('arbitratorDashboard.cardTitle')}>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className={`py-2 px-4 ${headerAlign}`}>{t('arbitratorDashboard.table.caseNo')}</th>
                                <th className={`py-2 px-4 ${headerAlign}`}>{t('arbitratorDashboard.table.submittedBy')}</th>
                                <th className={`py-2 px-4 ${headerAlign}`}>{t('arbitratorDashboard.table.against')}</th>
                                <th className={`py-2 px-4 ${headerAlign}`}>{t('arbitratorDashboard.table.submittedAt')}</th>
                                <th className={`py-2 px-4 ${headerAlign}`}>{t('arbitratorDashboard.table.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disputes?.length > 0 ? disputes?.map((dispute) => (
                                <tr 
                                    key={dispute.id} 
                                    className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={() => navigate(`/disputes/${dispute.id}`)}
                                >
                                    <td className={`py-3 px-4 ${textAlign}`}>{dispute.id}</td>
                                    <td className={`py-3 px-4 ${textAlign}`}>{dispute.submittedBy}</td>
                                    <td className={`py-3 px-4 ${textAlign}`}>{dispute.againstUser}</td>
                                    <td className={`py-3 px-4 ${textAlign}`}>{new Date(dispute.submittedAt).toLocaleDateString()}</td>
                                    <td className={`py-3 px-4 ${textAlign}`}>
                                        <span className={`px-2 py-1 rounded-full text-sm font-semibold capitalize bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>
                                            {dispute.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8">{t('arbitratorDashboard.noDisputes')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ArbitratorDashboard;
