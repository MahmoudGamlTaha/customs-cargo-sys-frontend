
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { MembershipRequest } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface MembershipReviewPageProps {
    requests: MembershipRequest[];
    onReview: (requestId: string, decision: 'approved' | 'rejected' | 'on_hold') => void;
}

const MembershipReviewPage: React.FC<MembershipReviewPageProps> = ({ requests, onReview }) => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const request = requests.find(req => req.id === id);

    if (!request) {
        return (
            <div>
                <Card><p className="p-8 text-center text-red-600">{t('review.membership.notFound')}</p></Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('review.membership.title')}</h2>
            </div>
            <Card cardTitle={`${t('review.membership.detailsTitle')} #${id}`}>
                <div className="space-y-4 p-4">
                    <p><strong>{t('review.membership.companyName')}:</strong> {language === 'ar' ? request.companyNameAr : request.companyNameEn}</p>
                    <p><strong>{t('review.membership.applicantName')}:</strong> {language === 'ar' ? request.applicantNameAr : request.applicantNameEn}</p>
                    <p><strong>{t('review.membership.submissionDate')}:</strong> {request.date}</p>
                    <p><strong>{t('review.membership.currentStatus')}:</strong> {t(`status.${request.status}` as TranslationKey)}</p>
                    <div className="pt-4 mt-4 border-t dark:border-gray-700">
                        <h4 className="font-bold mb-2">{t('review.membership.attachedDocs')}:</h4>
                        <ul>
                            <li><a href="#" className="text-brand-primary hover:underline">{t('review.membership.crDoc')}</a></li>
                            <li><a href="#" className="text-brand-primary hover:underline">{t('review.membership.moaDoc')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
                    <button onClick={() => onReview(request.id, 'rejected')} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">{t('review.actions.reject')}</button>
                    <button onClick={() => onReview(request.id, 'on_hold')} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">{t('review.actions.hold')}</button>
                    <button onClick={() => onReview(request.id, 'approved')} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">{t('review.actions.approve')}</button>
                </div>
            </Card>
        </div>
    );
};

export default MembershipReviewPage;
