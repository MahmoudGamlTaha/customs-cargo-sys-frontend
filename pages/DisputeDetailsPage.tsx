
import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { Dispute } from '../types';

interface DisputeDetailsPageProps {
    disputes: Dispute[];
}

const DisputeDetailsPage: React.FC<DisputeDetailsPageProps> = ({ disputes }) => {
    const { id } = useParams();
    const { t } = useLanguage();
    const dispute = disputes.find(d => d.id === id);

    if (!dispute) {
         return (
            <div>
                <Card><p className="p-8 text-center text-red-600">Dispute not found.</p></Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('disputeDetails.title')}</h2>
            </div>
            <Card cardTitle={`${t('disputeDetails.cardTitle')} #${id}`}>
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300">{t('disputeDetails.placeholder', {id: id!})}</p>
                    <div className="mt-4 space-y-2">
                        <p><strong>Details:</strong> {dispute.details}</p>
                        <p><strong>Submitted By:</strong> {dispute.submittedBy}</p>
                        <p><strong>Against:</strong> {dispute.againstUser}</p>
                        <p><strong>Status:</strong> {dispute.status}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DisputeDetailsPage;
