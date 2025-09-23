
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { DocumentRequest, CertificateOfOriginData, UserRole, RequestStatus } from '../../types';
import { useLanguage, TranslationKey } from '../../contexts/LanguageContext';
import { getRequestById, approveRequest, rejectRequest, holdRequest } from '../../services/requestService';
import { getCurrentUser } from '../../services/authService';
import toast from 'react-hot-toast';

const StaffDocumentReviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getTranslation } = useLanguage();
    const [request, setRequest] = useState<DocumentRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<{role?: UserRole, accessToken?: string} | null>(null);
    
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);

        if (id && user?.accessToken) {
            getRequestById(id, user.accessToken)
                .then(response => {
                    if (response.success && response.data) {
                        setRequest(response.data);
                    } else {
                        setError(response.message || 'Failed to fetch request details.');
                    }
                })
                .catch(err => {
                    setError('An error occurred while fetching the request.');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        } else {
            setError('Request ID is missing or user is not authenticated.');
            setLoading(false);
        }
    }, [id]);

    const handleDecision = async (decision: 'approved' | 'rejected' | 'on_hold') => {
        if (!id || !currentUser?.accessToken) return;

        try {
            let response;
            if (decision === 'approved') {
                response = await approveRequest(id, currentUser.accessToken);
            } else if (decision === 'rejected') {
                // For now, using a generic reason. A modal could be implemented for this.
                response = await rejectRequest(id, 'Rejected by staff', currentUser.accessToken);
            } else { // on_hold
                response = await holdRequest(id, currentUser.accessToken);
            }

            if (response.success) {
                navigate('/staff/documents');
            } else {
                toast.error(`Failed to update status: ${response.message}`);
            }
        } catch (error) {
            toast.error('An error occurred.');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="text-center p-8">{getTranslation('staffPages.common.loading', 'Loading...')}</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-600">{error}</div>;
    }

    if (!request) {
        return (
            <div>
                <Card><p className="p-8 text-center text-red-600">{getTranslation('staffPages.membership.notFound')}</p></Card>
            </div>
        );
    }

    const OriginDetails: React.FC<{data: CertificateOfOriginData}> = ({ data }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(data)?.map(([key, value]) => (
                 <div key={key} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                     <p className="font-semibold text-gray-600 dark:text-gray-400">{getTranslation(`documentServices.certOfOrigin.${key}` as TranslationKey)}</p>
                     <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{value}</p>
                 </div>
            ))}
        </div>
    );
    
    const renderRequestDetails = () => {
        // Show request details regardless of service type
        const details = request.details?.[0] || {};
        
        return (
            <div className="space-y-6">
                {/* Main Request Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">{getTranslation('staffPages.forms.requestInfo')}</h3>
                        <div className="space-y-3">
                            <p><strong>{getTranslation('staffPages.forms.title')}:</strong> {request.title}</p>
                            <p><strong>{getTranslation('staffPages.forms.description')}:</strong> {request.description}</p>
                            <p><strong>{getTranslation('staffPages.forms.serialNumber')}:</strong> {request.serialNumber}</p>
                            <p><strong>{getTranslation('staffPages.forms.fee')}:</strong> {request.fee}</p>
                        </div>
                    </div>
                    
                    {/* Request Details */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">{getTranslation('staffPages.forms.clientInfo')}</h3>
                        <div className="space-y-3">
                            <p><strong>{getTranslation('staffPages.forms.clientName')}:</strong> {details.client_name}</p>
                            <p><strong>{getTranslation('staffPages.forms.companyName')}:</strong> {details.company_name || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.companyNameEn')}:</strong> {details.company_name_en || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.commercialNumber')}:</strong> {details.commercial_number || '-'}</p>
                        </div>
                    </div>
                </div>
                
                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">{getTranslation('staffPages.forms.contactInfo')}</h3>
                        <div className="space-y-3">
                            <p><strong>{getTranslation('staffPages.forms.address')}:</strong> {details.address || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.phoneNumber')}:</strong> {details.phone_number || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.mobileNumber')}:</strong> {details.mobile_number || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.email')}:</strong> {details.email || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.identityNumber')}:</strong> {details.identity_number || '-'}</p>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">{getTranslation('staffPages.forms.shipmentInfo')}</h3>
                        <div className="space-y-3">
                            <p><strong>{getTranslation('staffPages.forms.transferDetail')}:</strong> {details.transfer_detail || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.signs')}:</strong> {details.signs || '-'}</p>
                            <p><strong>{getTranslation('staffPages.forms.numberOfParcels')}:</strong> {details.number_of_parcel}</p>
                            <p><strong>{getTranslation('staffPages.forms.weight')}:</strong> {details.weight}</p>
                            <p><strong>{getTranslation('staffPages.forms.netWeight')}:</strong> {details.net_weight}</p>
                        </div>
                    </div>
                </div>
                
                {/* Invoice Information */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">{getTranslation('staffPages.forms.invoiceInfo')}</h3>
                    <div className="space-y-3">
                        <p><strong>{getTranslation('staffPages.forms.invoiceNumber')}:</strong> {details.invoice_number || '-'}</p>
                        <p><strong>{getTranslation('staffPages.forms.invoiceDate')}:</strong> {details.invoice_date || '-'}</p>
                        <p><strong>{getTranslation('staffPages.forms.activityType')}:</strong> {details.activity_type || '-'}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{getTranslation('staffPages.forms.title')}</h2>
            </div>
            <Card cardTitle={`${getTranslation('staffPages.forms.detailsTitle')} #${id}`}>
                <div className="space-y-4 p-4">
                    <p><strong>{getTranslation('staffPages.documents.table.serviceType')}:</strong> {request.request_type_name || request.serviceType}</p>
                    <p><strong>{getTranslation('adminPages.users.table.name')}:</strong> User ID: {request.userId}</p>
                    <p><strong>{getTranslation('staffPages.membership.submissionDate')}:</strong> {request.date}</p>
                    <p><strong>{getTranslation('staffPages.membership.currentStatus')}:</strong> {getTranslation(`status.${request.status}` as TranslationKey)}</p>
                    
                    <div className="pt-4 mt-4 border-t dark:border-gray-700">
                        <h4 className="font-bold mb-2">{getTranslation('staffPages.forms.requestContent')}:</h4>
                        {renderRequestDetails()}
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
                    {/* Hold button visible to all roles */}
                    <button onClick={() => handleDecision('on_hold')} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">{getTranslation('staffPages.actions.hold')}</button>
                    
                    {/* Approve/Reject buttons only visible to users with Auditor role */}
                    {currentUser?.role === UserRole.Auditor && (
                        <>
                            <button onClick={() => handleDecision('rejected')} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">{getTranslation('staffPages.actions.reject')}</button>
                            <button onClick={() => handleDecision('approved')} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">{getTranslation('staffPages.actions.approve')}</button>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default StaffDocumentReviewPage;
