import React, { useCallback, useEffect, useState } from 'react';
import Card from '../components/Card';
import { UsersIcon, DocumentIcon, PaymentIcon, ReportsIcon } from '../components/icons';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { GetRequestsCount, getAllRequests } from '@/services/requestService';
import { getToken } from '@/utils/getToken';
import { getFullBranchTitle } from '../utils/getBranchName';

// Add custom keyframe animation
const style = document.createElement('style');
style.textContent = `
  @keyframes green-pulse {
    0% { color: rgb(34, 197, 94); } /* green-500 */
    50% { color: rgb(74, 222, 128); } /* green-400 */
    100% { color: rgb(34, 197, 94); } /* green-500 */
  }
  .animate-green-pulse {
    animation: green-pulse 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

interface StaffDashboardProps {
    membershipRequestsCount: number;
    documentRequestsCount: number;
    paymentsToConfirmCount: number;
}

const StatCard: React.FC<{ title: string, count: number, linkTo: string, icon: React.ReactNode, cta: string, isLoading?: boolean, showAnimation?: boolean }> = ({ title, count, linkTo, icon, cta, isLoading = false, showAnimation = false }) => (
    <Link to={linkTo} className="block h-full">
        <Card className="h-full">
            <div className="flex flex-col items-center justify-center text-center h-full p-4">
                <div className="p-3 sm:p-4 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary-light rounded-full mb-4">
                    {icon}
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
                {isLoading ? (
                    <div className="flex items-center justify-center my-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    </div>
                ) : (
                    <p className="text-2xl sm:text-3xl font-bold my-4 animate-green-pulse">
                        {count}
                    </p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{cta}</p>
            </div>
        </Card>
    </Link>
);


const StaffDashboard: React.FC<StaffDashboardProps> = ({ membershipRequestsCount, documentRequestsCount, paymentsToConfirmCount }) => {
    const [reqCount, setReqCount] = useState<number>(0);
    const [issuedCount, setIssuedCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showCountAnimation, setShowCountAnimation] = useState<boolean>(false);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const { t } = useLanguage();

    const getrequestCounts = useCallback(async () => {
        const result = await GetRequestsCount();
        if (result.success) {
            setReqCount(result.data?.data?.total);
        }
    }, [])

    const getIssuedRequestsCount = useCallback(async () => {
        try {
            // Only show loading on initial load
            if (isInitialLoad) {
                setIsLoading(true);
            }
            
            const token = getToken();
            if (!token) {
                console.error('No token available');
                if (isInitialLoad) {
                    setIsLoading(false);
                }
                return;
            }
            
            const result = await getAllRequests();
            if (result.success && result.data?.requests) {
                // Filter requests with status "ISSUED"
                const issuedRequests = result.data.requests.filter((request: any) => 
                    request.status === 'ISSUED'
                );
                setIssuedCount(issuedRequests?.length);
                
                // Show animation for 3 seconds
                setShowCountAnimation(true);
                setTimeout(() => {
                    setShowCountAnimation(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Error fetching issued requests:', error);
        } finally {
            if (isInitialLoad) {
                setIsLoading(false);
                setIsInitialLoad(false);
            }
        }
    }, [isInitialLoad])

    useEffect(() => {
        // Initial load - fetch data once
        getrequestCounts();
        getIssuedRequestsCount();
        
        // Start continuous animation immediately after initial load
        const startAnimation = () => {
            setShowCountAnimation(true);
        };
        
        // Start animation after initial load
        setTimeout(startAnimation, 1000);
        
        // No cleanup needed - animation runs continuously
    }, [getrequestCounts, getIssuedRequestsCount])


    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">{getFullBranchTitle('staff')}</h2>
            <p className="mb-6 text-base sm:text-lg text-gray-600 dark:text-gray-400">{t('staffDashboard.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <StatCard
                    title={t('staffDashboard.cards.documentRequests')}
                    count={issuedCount || "--"}
                    linkTo="/staff/documents"
                    icon={<DocumentIcon />}
                    cta={t('staffDashboard.cards.cta')}
                    isLoading={isLoading}
                    showAnimation={showCountAnimation}
                />

            </div>

            {/*  className="mt-8">
            <Card cardTitle={t('staffDashboard.quickActions.title')}>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                     <Link to="/bi-reports" className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                        <ReportsIcon/>
                        <span>{t('staffDashboard.quickActions.viewReports')}</span>
                    </Link>
                     <Link to="/admin/users" className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                        <UsersIcon/>
                        <span>{t('staffDashboard.quickActions.findMember')}</span>
                    </Link>
                     <Link to="/staff/client-documents" className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                        <DocumentIcon/>
                        <span>{t('staffDashboard.quickActions.createClientDocument') || 'Create Client Document'}</span>
                    </Link>
                </div>
            </Card>
        </div>
    */}

        </div>
    );
};

export default StaffDashboard;