
import React from 'react';
import Card from '../components/Card';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Membership } from '../types';
import { CheckCircleIcon, XCircleIcon } from '../components/icons';

interface MembershipApplicationProps {
    onApply: () => Promise<boolean>;
    balance: number;
    membership: Membership | null;
}

const ApplicationForm: React.FC<Omit<MembershipApplicationProps, 'membership'>> = ({ onApply, balance }) => {
    const { t } = useLanguage();
    const membershipFee = 250;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onApply();
    };

    const InputField: React.FC<{ label: string, id: string, type?: string, placeholder?: string }> = ({ label, id, type = "text", placeholder }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input type={type} id={id} placeholder={placeholder} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" required/>
        </div>
    );

    const hasSufficientFunds = balance >= membershipFee;

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="border-b pb-6 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('membershipApplication.sections.businessInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <InputField label={t('membershipApplication.fields.companyNameAr')} id="company-name-ar" />
                    <InputField label={t('membershipApplication.fields.companyNameEn')} id="company-name-en" />
                    <InputField label={t('membershipApplication.fields.crNumber')} id="cr-number" />
                    <InputField label={t('membershipApplication.fields.businessType')} id="business-type" />
                    <InputField label={t('membershipApplication.fields.address')} id="address" />
                    <InputField label={t('membershipApplication.fields.phone')} id="phone" type="tel" />
                </div>
            </div>
            
            <div className="border-b pb-6 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('membershipApplication.sections.ownerInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <InputField label={t('membershipApplication.fields.ownerName')} id="owner-name" />
                    <InputField label={t('membershipApplication.fields.ownerId')} id="owner-id" />
                    <InputField label={t('membershipApplication.fields.ownerEmail')} id="owner-email" type="email" />
                     <InputField label={t('membershipApplication.fields.ownerMobile')} id="owner-mobile" type="tel" />
                </div>
            </div>

             <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('membershipApplication.sections.uploadDocs')}</h3>
                <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-brand-primary cursor-pointer hover:underline">{t('membershipApplication.upload.click')}</span> {t('membershipApplication.upload.orDrag')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{t('membershipApplication.upload.fileTypes')}</p>
                </div>
                 <ul className="mt-4 list-disc ltr:list-inside rtl:list-outside rtl:mr-4 text-gray-600 dark:text-gray-400">
                     <li>{t('membershipApplication.docs.cr')}</li>
                     <li>{t('membershipApplication.docs.moa')}</li>
                     <li>{t('membershipApplication.docs.ownerIdProof')}</li>
                 </ul>
            </div>

            <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
                <div>
                    <p className="font-bold text-lg">{t('documentServices.newRequest.fees')}: <span className="text-brand-primary">{membershipFee.toFixed(2)} {t('wallet.currency')}</span></p>
                    {!hasSufficientFunds && (
                        <p className="text-red-600 dark:text-red-400 text-sm">
                            {t('wallet.insufficientFundsShort')} <Link to="/top-up" className="font-bold underline">{t('wallet.topUpLink')}</Link>
                        </p>
                    )}
                </div>
                <button type="submit" className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!hasSufficientFunds}>
                    {t('membershipApplication.submitButton')}
                </button>
            </div>
        </form>
    );
};

const StatusView: React.FC<{title: string, message: string, children?: React.ReactNode, icon: React.ReactNode, iconClass: string}> = ({title, message, children, icon, iconClass}) => (
    <div className="text-center py-12">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${iconClass}`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold mt-4 text-gray-800 dark:text-gray-200">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">{message}</p>
        {children && <div className="mt-6">{children}</div>}
    </div>
);


const MembershipApplication: React.FC<MembershipApplicationProps> = (props) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { membership, onApply, balance } = props;
    const status = membership?.status;

    let content;

    switch (status) {
        case 'pending':
        case 'on_hold':
            content = <StatusView 
                title={t('membershipApplication.status.pendingTitle')} 
                message={t('membershipApplication.status.pendingMessage')} 
                icon={<svg className="w-8 h-8 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                iconClass="bg-yellow-100 dark:bg-yellow-900"
            />;
            break;
        case 'approved':
            content = <StatusView 
                title={t('membershipApplication.status.approvedTitle')} 
                message={t('membershipApplication.status.approvedMessage')} 
                icon={<CheckCircleIcon />}
                iconClass="bg-green-100 dark:bg-green-900"
            >
                <button onClick={() => navigate('/membership-certificate')} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-800">
                    {t('membershipApplication.status.viewCertificate')}
                </button>
            </StatusView>;
            break;
        case 'rejected':
            content = <div>
                <StatusView 
                    title={t('membershipApplication.status.rejectedTitle')} 
                    message={t('membershipApplication.status.rejectedMessage')}
                    icon={<XCircleIcon />}
                    iconClass="bg-red-100 dark:bg-red-900"
                />
                <hr className="my-6 dark:border-gray-700"/>
                <ApplicationForm onApply={onApply} balance={balance} />
            </div>
            break;
        default: // no membership record
            content = <div>
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('membershipApplication.status.inactiveTitle')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-lg mx-auto">{t('membershipApplication.status.inactiveMessage')}</p>
                </div>
                <ApplicationForm onApply={onApply} balance={balance} />
            </div>;
            break;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('membershipApplication.title')}</h2>
            </div>
            <Card>
                {content}
            </Card>
        </div>
    );
};

export default MembershipApplication;