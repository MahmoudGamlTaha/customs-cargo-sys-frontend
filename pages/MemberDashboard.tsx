
import React from 'react';
import Card from '../components/Card';
import { DocumentIcon, EventsIcon, PaymentIcon, UserPhotoPlaceholderIcon, QrCodeIcon, OfficialLogoIcon, XCircleIcon } from '../components/icons';
import { Link, useNavigate } from 'react-router-dom';
import { DocumentRequest, RequestStatus, MemberProfile, Invoice, InvoiceStatus, Event as EventType } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';
import { getFullBranchTitle } from '../utils/getBranchName';

const getStatusClass = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case RequestStatus.APPROVED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case RequestStatus.ISSUED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case RequestStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case RequestStatus.ON_HOLD: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case RequestStatus.PAID: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

interface MemberDashboardProps {
    memberProfile: MemberProfile;
    documentRequests: DocumentRequest[];
    invoices: Invoice[];
    events: EventType[];
}

const ActiveMembershipCard: React.FC<{ profile: MemberProfile }> = ({ profile }) => {
    const { t, language } = useLanguage();
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden font-sans flex flex-col sm:flex-row text-gray-800 dark:text-white h-full">
            <div className="w-full sm:w-1/3 bg-gray-50 dark:bg-gray-100 p-4 flex flex-row sm:flex-col justify-around sm:justify-center items-center gap-4 sm:gap-2">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-300 overflow-hidden border-2 border-gray-300 dark:border-gray-400 shadow-inner flex-shrink-0">
                    <UserPhotoPlaceholderIcon className="text-gray-400 dark:text-gray-500 w-full h-full" />
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <QrCodeIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-800 dark:text-black" />
                    <OfficialLogoIcon className="w-20 sm:w-24 h-auto" />
                </div>
            </div>

            <div className="w-full sm:w-2/3 bg-gradient-to-br from-blue-400 to-blue-600 p-6 flex flex-col justify-center items-center ltr:sm:items-start rtl:sm:items-end text-center ltr:sm:text-left rtl:sm:text-right relative">
                 <div className="hidden sm:block absolute top-0 ltr:right-full rtl:left-full h-full w-16 bg-gray-50 dark:bg-gray-100" style={{ clipPath: 'ellipse(50% 100% at 100% 50%)' }}></div>
                 
                 <div className="relative z-10 w-full">
                    <h2 className="text-lg sm:text-xl font-bold whitespace-nowrap">{t('memberDashboard.membershipCard.title')}</h2>
                    <p className="text-xs sm:text-sm opacity-80 whitespace-nowrap">{t('memberDashboard.membershipCard.subtitle')}</p>

                    <h3 className="text-3xl sm:text-4xl font-bold leading-tight">{language === 'ar' ? profile.nameAr : profile.nameEn}</h3>
                    <p className="text-base sm:text-lg opacity-90 whitespace-nowrap">{profile.title ? t(`data.jobTitles.${profile.title}` as TranslationKey) : ''}</p>
                 </div>
            </div>
        </div>
    );
};

const MembershipStatusCard: React.FC<{ profile: MemberProfile }> = ({ profile }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const renderCard = (
        title: string, 
        text: string, 
        icon: React.ReactNode, 
        colorClass: string, 
        button?: { label: string, onClick: () => void }
    ) => (
        <Card className={`h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br ${colorClass}`}>
            <div className="w-16 h-16 mb-4 rounded-full bg-white/30 flex items-center justify-center text-white">{icon}</div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-white/90">{text}</p>
            {button && (
                <button onClick={button.onClick} className="mt-4 px-6 py-2 bg-white text-brand-primary font-bold rounded-lg shadow-md hover:bg-gray-100">
                    {button.label}
                </button>
            )}
        </Card>
    );

    switch (profile.membershipStatus) {
        case 'Pending':
            return renderCard(
                t('memberDashboard.membershipStatusCard.pendingTitle'),
                t('memberDashboard.membershipStatusCard.pendingText'),
                <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                'from-yellow-400 to-yellow-600'
            );
        case 'rejected':
            return renderCard(
                t('memberDashboard.membershipStatusCard.rejectedTitle'),
                t('memberDashboard.membershipStatusCard.rejectedText'),
                <XCircleIcon />,
                'from-red-400 to-red-600',
                { label: t('memberDashboard.membershipStatusCard.rejectedButton'), onClick: () => navigate('/apply-membership') }
            );
        case 'Inactive':
            return renderCard(
                t('memberDashboard.membershipStatusCard.inactiveTitle'),
                t('memberDashboard.membershipStatusCard.inactiveText'),
                <DocumentIcon />,
                'from-gray-400 to-gray-600',
                { label: t('memberDashboard.membershipStatusCard.inactiveButton'), onClick: () => navigate('/apply-membership') }
            );
        default: // Active
            return <ActiveMembershipCard profile={profile} />;
    }
};


const MemberDashboard: React.FC<MemberDashboardProps> = ({ memberProfile, documentRequests, invoices, events }) => {
    const { t } = useLanguage();
    const completedRequests = documentRequests.filter(r => r.status === RequestStatus.COMPLETED)?.length;
    const inProgressRequests = documentRequests.filter(r => [RequestStatus.APPROVED, RequestStatus.ISSUED].includes(r.status))?.length;
    const pendingInvoices = invoices.filter(i => i.status === InvoiceStatus.Pending)?.length;
    
    const getCertificateLink = (req: DocumentRequest) => {
        if (req.status !== RequestStatus.COMPLETED) return null;
        let path;
        switch(req.serviceType) {
            case 'origin':
                path = `/origin-certificate/${req.id}`;
                break;
            case 'chamber_enrollment':
                path = `/chamber-enrollment-certificate/${req.id}`;
                break;
            default:
                return null;
        }
        return (
            <Link to={path} className={`px-2 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${getStatusClass(req.status)} hover:underline`}>
                {t(`status.${req.status}` as TranslationKey)} ({t('memberDashboard.latestRequests.viewCertificate')})
            </Link>
        );
    };

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">{getFullBranchTitle('member')}</h2>
            
            <div className="flex flex-col xl:flex-row gap-6 mb-6">
                <div className="xl:w-1/2">
                    <MembershipStatusCard profile={memberProfile} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 xl:w-1/2">
                    <Card>
                        <div className="flex items-center ltr:space-x-4 rtl:space-x-reverse h-full">
                            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300 flex-shrink-0"><DocumentIcon /></div>
                            <div>
                                <h4 className="text-sm sm:text-base text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('memberDashboard.completedRequests')}</h4>
                                <p className="text-2xl sm:text-3xl font-bold">{completedRequests}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center ltr:space-x-4 rtl:space-x-reverse h-full">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-600 dark:text-yellow-300 flex-shrink-0"><DocumentIcon /></div>
                            <div>
                                <h4 className="text-sm sm:text-base text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('memberDashboard.inProgressRequests')}</h4>
                                <p className="text-2xl sm:text-3xl font-bold">{inProgressRequests}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <Card cardTitle={t('memberDashboard.latestRequests.title')}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="py-2 px-4 whitespace-nowrap">{t('memberDashboard.latestRequests.serviceType')}</th>
                                        <th className="py-2 px-4 whitespace-nowrap">{t('memberDashboard.latestRequests.date')}</th>
                                        <th className="py-2 px-4 whitespace-nowrap">{t('memberDashboard.latestRequests.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documentRequests?.length > 0 ? documentRequests.slice(0, 5)?.map(req => (
                                        <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="py-3 px-4 whitespace-nowrap">{t(`data.serviceTypes.${req.serviceType}` as TranslationKey)}</td>
                                            <td className="py-3 px-4 whitespace-nowrap">{req.date}</td>
                                            <td className="py-3 px-4">
                                                {getCertificateLink(req) ?? (
                                                    <span className={`px-2 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${getStatusClass(req.status)}`}>
                                                        {t(`status.${req.status}` as TranslationKey)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4">{t('memberDashboard.latestRequests.noRequests')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div className="lg:w-full lg:max-w-sm flex flex-col gap-6">
                    <Card cardTitle={t('memberDashboard.quickLinks.title')}>
                        <div className="flex flex-col space-y-3">
                            <Link to="/document-services" className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                                <DocumentIcon /> <span className="ltr:ml-3 rtl:mr-3 font-semibold whitespace-nowrap">{t('memberDashboard.quickLinks.requestDocument')}</span>
                            </Link>
                             <Link to="/wallet" className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                                <PaymentIcon /> <span className="ltr:ml-3 rtl:mr-3 font-semibold whitespace-nowrap">{t('memberDashboard.quickLinks.manageWallet')}</span>
                            </Link>
                             <Link to="/events" className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                                <EventsIcon /> <span className="ltr:ml-3 rtl:mr-3 font-semibold whitespace-nowrap">{t('memberDashboard.quickLinks.registerEvent')}</span>
                            </Link>
                        </div>
                    </Card>
                    <Card cardTitle={t('memberDashboard.pendingInvoices.title')}>
                        <p className="text-2xl font-bold">{pendingInvoices} <span className="text-base font-normal whitespace-nowrap">{t('memberDashboard.pendingInvoices.invoices')}</span></p>
                         <Link to="/wallet" className="block text-center mt-2 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 whitespace-nowrap">
                            {t('memberDashboard.pendingInvoices.goToWallet')}
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
