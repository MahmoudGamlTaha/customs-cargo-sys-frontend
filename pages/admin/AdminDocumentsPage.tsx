import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, TranslationKey } from '../../contexts/LanguageContext';
import { getAllRequests } from '../../services/requestService';
import { DocumentRequest, RequestStatus, UserRole } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import Modal from '../../components/Modal';
import Card from '../../components/Card';
import { getCurrentUser } from "../../services/authService";

const getStatusClass = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.ISSUED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case RequestStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case RequestStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case RequestStatus.APPROVED: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

export const AdminDocumentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t: getTranslation } = useLanguage();
    const [requests, setRequests] = useState<DocumentRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
    const [currentUser, setCurrentUser] = useState<{role?: UserRole, accessToken?: string} | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
        
        // Redirect if not admin
        if (user?.role !== UserRole.Admin) {
            navigate('/login');
        }
    }, [navigate]);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = getCurrentUser();
            if (!user || !user.accessToken) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            const response = await getAllRequests();

            if (response.success && response.data?.requests) {
                setRequests(response.data.requests as DocumentRequest[]);
            } else {
                setError(response.message || 'Failed to fetch requests');
            }
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('An error occurred while fetching requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);
    
    const handleRowClick = (request: DocumentRequest) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    const filterOptions = [
        { value: RequestStatus.ISSUED, label: getTranslation('status.OnHold', 'On Hold') },
        { value: RequestStatus.PAID, label: getTranslation('status.Paid', 'Paid') },
        { value: RequestStatus.APPROVED, label: getTranslation('status.Approved', 'Approved') },
        { value: RequestStatus.REJECTED, label: getTranslation('status.Rejected', 'Rejected') },
        { value: 'all', label: getTranslation('staffPages.common.all', 'All') },
    ];

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {getTranslation('adminPages.documents.title', 'All Document Requests')}
                </h1>
                <div className="w-16"></div>
            </div>

            <Card>
                <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {filterOptions?.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
                            <p className="mt-2">{getTranslation('adminPages.common.loading', 'Loading...')}</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">
                            <p>{error}</p>
                            <button 
                                onClick={fetchRequests}
                                className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark"
                            >
                                {getTranslation('adminPages.common.retry', 'Retry')}
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{getTranslation('adminPages.table.id', 'ID')}</th>
                                        <th scope="col" className="px-6 py-3">{getTranslation('adminPages.table.serialNumber', 'Serial #')}</th>
                                        <th scope="col" className="px-6 py-3">{getTranslation('adminPages.table.title', 'Title')}</th>
                                        <th scope="col" className="px-6 py-3">{getTranslation('adminPages.table.serviceType', 'Service Type')}</th>
                                        <th scope="col" className="px-6 py-3">{getTranslation('adminPages.table.status', 'Status')}</th>
                                        <th scope="col" className="px-6 py-3">{getTranslation('adminPages.table.createdAt', 'Created At')}</th>
                                        <th scope="col" className="px-6 py-3">{getTranslation('adminPages.table.createdBy', 'Created By')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests?.length > 0 ? (
                                        filteredRequests?.map(request => (
                                            <tr key={request.id} onClick={() => handleRowClick(request)} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b dark:border-gray-700">
                                                <td className="px-6 py-4 font-mono text-gray-900 dark:text-gray-200">{request.id}</td>
                                                <td className="px-6 py-4 font-mono text-gray-900 dark:text-gray-200">{request.serialNumber}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{request.title}</td>
                                                <td className="px-6 py-4">{request.serviceType}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusClass(request.status)}`}>
                                                        {getTranslation(`status.${request.status}` as TranslationKey, request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{formatDate(request.createdAt)}</td>
                                                <td className="px-6 py-4">{request.createdBy || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8">{getTranslation('adminPages.table.noRequests', 'No document requests found.')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Request Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                }}
                title={getTranslation('adminPages.modal.requestDetails', 'Request Details')}
                size="5xl"
            >
                {selectedRequest && (
                    <div className="p-1 bg-gray-50 dark:bg-gray-900/50 max-h-[80vh] overflow-y-auto">
                        {/* Status */}
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{getTranslation('adminPages.table.status', 'Status')}:</span>
                                <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusClass(selectedRequest.status)}`}>
                                    {getTranslation(`status.${selectedRequest.status}` as TranslationKey, selectedRequest.status)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Client Information */}
                                {selectedRequest.details?.[0] && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-green-100 text-green-600 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getTranslation('adminPages.forms.clientInfo', 'Client Information')}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.clientName', 'Client Name')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].client_name || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.companyName', 'Company Name')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].company_name || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.companyNameEn', 'Company Name (English)')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].company_name_en || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.commercialNumber', 'Commercial Number')}:</strong><span className="text-gray-800 dark:text-gray-200 font-mono">{selectedRequest.details[0].commercial_number || '-'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                {selectedRequest.details?.[0] && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getTranslation('adminPages.forms.contactInfo', 'Contact Information')}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.address', 'Address')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].address || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.phoneNumber', 'Phone Number')}:</strong><span className="text-gray-800 dark:text-gray-200 font-mono">{selectedRequest.details[0].phone_number || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.mobileNumber', 'Mobile Number')}:</strong><span className="text-gray-800 dark:text-gray-200 font-mono">{selectedRequest.details[0].mobile_number || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.email', 'Email')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].email || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.identityNumber', 'Identity Number')}:</strong><span className="text-gray-800 dark:text-gray-200 font-mono">{selectedRequest.details[0].identity_number || '-'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Request Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getTranslation('adminPages.forms.requestInfo', 'Request Information')}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.title', 'Title')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.title || '-'}</span>
                                        <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.description', 'Description')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.description || '-'}</span>
                                        <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.serialNumber', 'Serial Number')}:</strong><span className="text-gray-800 dark:text-gray-200 font-mono">{selectedRequest.serialNumber || '-'}</span>
                                        <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.requestType', 'Request Type')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.serviceType || '-'}</span>
                                    </div>
                                </div>

                                {/* Shipment Information */}
                                {selectedRequest.details?.[0] && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10" /></svg></div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getTranslation('adminPages.forms.shipmentInfo', 'Shipment Information')}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.transferDetail', 'Transfer Detail')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].transfer_detail || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.signs', 'Signs')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].signs || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.numberOfParcels', 'Number of Parcels')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].number_of_parcel || '0'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.weight', 'Weight')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].weight || '-'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Invoice Information */}
                                {selectedRequest.details?.[0] && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-red-100 text-red-600 rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getTranslation('adminPages.forms.invoiceInfo', 'Invoice Information')}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.invoiceNumber', 'Invoice Number')}:</strong><span className="text-gray-800 dark:text-gray-200 font-mono">{selectedRequest.details[0].invoice_number || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.invoiceDate', 'Invoice Date')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].invoice_date || '-'}</span>
                                            <strong className="text-gray-500 dark:text-gray-400">{getTranslation('adminPages.forms.activityType', 'Activity Type')}:</strong><span className="text-gray-800 dark:text-gray-200">{selectedRequest.details[0].activity_type || '-'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDocumentsPage;
