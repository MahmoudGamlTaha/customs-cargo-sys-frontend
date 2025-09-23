
import React, { useState } from 'react';
import Card from '../../components/Card';
import { MembershipRequest, RequestStatus } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useLanguage, TranslationKey } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/dateUtils';
import { StandardTable, TableColumn } from '../../components/StandardTable';

const getStatusClass = (status: string) => {
    switch (status) {
        case RequestStatus.ISSUED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case RequestStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case RequestStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case RequestStatus.APPROVED: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case RequestStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case RequestStatus.ON_HOLD: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

// Using formatDate from utils/dateUtils.ts

interface StaffMembershipsPageProps {
    requests: MembershipRequest[];
}

const StaffMembershipsPage: React.FC<StaffMembershipsPageProps> = ({ requests }) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<RequestStatus | 'all'>('all');

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    // Define table columns configuration
    const columns: TableColumn<MembershipRequest>[] = [
      {
        key: 'id',
        header: 'Request ID',
        translationKey: 'staffPages.memberships.table.requestId',
        render: (item) => (
          <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {item.id}
          </div>
        ),
      },
      {
        key: 'serialNumber',
        header: 'Serial Number',
        translationKey: 'staffPages.memberships.table.serialNumber',
        render: (item) => (
          <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            -
          </div>
        ),
      },
      {
        key: 'companyName',
        header: 'Company Name',
        translationKey: 'staffPages.memberships.table.companyName',
        render: (item) => (
          <div className="py-3 px-4 font-semibold text-center">
            {language === 'ar' ? item.companyNameAr : item.companyNameEn}
          </div>
        ),
      },
      {
        key: 'applicant',
        header: 'Applicant',
        translationKey: 'staffPages.memberships.table.applicant',
        render: (item) => (
          <div className="py-3 px-4 text-center">
            {language === 'ar' ? item.applicantNameAr : item.applicantNameEn}
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        translationKey: 'staffPages.memberships.table.date',
        render: (item) => (
          <div className="py-3 px-4 text-center">
            {formatDate(item.date)}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        translationKey: 'staffPages.memberships.table.status',
        render: (item) => (
          <div className="py-3 px-4 text-center">
            <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusClass(item.status)}`}>
              {t(`status.${item.status}` as TranslationKey)}
            </span>
          </div>
        ),
      },
    ];
    
    const filterOptions = [
        { value: 'all', label: t('staffPages.common.all') },
        { value: RequestStatus.ISSUED, label: t('status.New') },
        { value: RequestStatus.PAID, label: t('status.InProgress') },
        { value: RequestStatus.ON_HOLD, label: t('status.OnHold') },
        { value: RequestStatus.APPROVED, label: t('status.Approved') },
        { value: RequestStatus.REJECTED, label: t('status.Rejected') },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('staffPages.memberships.title')}</h2>
            </div>

            <Card>
                 <div className="p-4 border-b dark:border-gray-700 flex flex-wrap items-center gap-4">
                    <label htmlFor="statusFilter" className="font-semibold">{t('staffPages.common.filterByStatus')}:</label>
                    <select
                        id="statusFilter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as RequestStatus | 'all')}
                        className="p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                    >
                        {filterOptions?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <StandardTable
                    data={filteredRequests}
                    columns={columns}
                    onRowClick={(item) => navigate(`/review/membership/${item.id}`)}
                    emptyTextTranslationKey="staffPages.common.noRequests"
                    emptyText="No membership requests found"
                    className="overflow-x-auto"
                    tableClassName="w-full"
                    headerClassName="text-md text-center text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 py-3 px-4"
                    rowClassName="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    showActionsColumn={false}
                    loadingSpinnerClassName="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
                    emptyStateClassName="text-center py-8"
                    errorStateClassName="text-center py-8 text-red-500"
                    tableWrapperClassName="overflow-x-auto"
                />
            </Card>
        </div>
    );
};

export default StaffMembershipsPage;
