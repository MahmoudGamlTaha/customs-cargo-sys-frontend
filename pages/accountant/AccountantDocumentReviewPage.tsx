import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import { DocumentRequest, CertificateOfOriginData, RequestStatus } from '../../types';
import { useLanguage, TranslationKey } from '../../contexts/LanguageContext';

interface AccountantDocumentReviewPageProps {
  requests: DocumentRequest[];
  onReview: (requestId: string, decision: 'approved' | 'rejected', comments?: string) => void;
}

const AccountantDocumentReviewPage: React.FC<AccountantDocumentReviewPageProps> = ({ requests, onReview }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [comments, setComments] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null);
  
  const request = requests.find(req => req.id === id);

  // Check if there's a suggested action from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    
    if (action === 'approve') {
      setPendingDecision('approved');
      setShowConfirmation(true);
    } else if (action === 'reject') {
      setPendingDecision('rejected');
      setShowConfirmation(true);
    }
  }, [location.search]);

  // Helper function to get translation with better fallback
  const getTranslation = (key: string, fallback: string): string => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  const handleDecision = (decision: 'approved' | 'rejected') => {
    setPendingDecision(decision);
    setShowConfirmation(true);
  };

  const confirmDecision = () => {
    if (request && pendingDecision) {
      onReview(request.id, pendingDecision, comments);
      navigate('/accountant/documents');
    }
  };

  const cancelDecision = () => {
    setPendingDecision(null);
    setShowConfirmation(false);
  };

  if (!request) {
    return (
      <div>
        <Card>
          <p className="p-8 text-center text-red-600">
            {getTranslation('accountantPages.review.notFound', 'Document request not found')}
          </p>
        </Card>
      </div>
    );
  }

  // Render certificate of origin details if available
  const OriginDetails: React.FC<{data: CertificateOfOriginData}> = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {Object.entries(data)?.map(([key, value]) => (
        <div key={key} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="font-semibold text-gray-600 dark:text-gray-400">
            {getTranslation(`documentServices.certOfOrigin.${key}` as TranslationKey, key)}
          </p>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{value}</p>
        </div>
      ))}
    </div>
  );
  
  // Render financial information if available
  const FinancialDetails: React.FC = () => (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-600 dark:text-gray-400">
            {getTranslation('accountantPages.review.fee', 'Service Fee')}
          </h4>
          <p className="text-2xl font-bold">{request.fee || '0'} USD</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-600 dark:text-gray-400">
            {getTranslation('accountantPages.review.paymentStatus', 'Payment Status')}
          </h4>
          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
            request.status === RequestStatus.PendingPayment 
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
          }`}>
            {request.status === RequestStatus.PendingPayment 
              ? getTranslation('status.PendingPayment', 'Pending Payment')
              : getTranslation('accountantPages.review.paid', 'Paid')}
          </span>
        </div>
      </div>
      
      <hr className="border-gray-300 dark:border-gray-600" />
      
      <div>
        <h4 className="font-semibold text-gray-600 dark:text-gray-400">
          {getTranslation('accountantPages.review.paymentDetails', 'Payment Details')}
        </h4>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span>{getTranslation('accountantPages.review.serviceFee', 'Service Fee')}</span>
            <span className="font-semibold">{request.fee || '0'} USD</span>
          </div>
          <div className="flex justify-between">
            <span>{getTranslation('accountantPages.review.tax', 'Tax')}</span>
            <span className="font-semibold">0.00 USD</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>{getTranslation('accountantPages.review.total', 'Total')}</span>
            <span>{request.fee || '0'} USD</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different request details based on service type
  const renderRequestDetails = () => {
    switch(request.serviceType) {
      case 'origin':
        return request.certificateData ? <OriginDetails data={request.certificateData} /> : 
          <p>{getTranslation('accountantPages.review.noDetails', 'No details available for this request.')}</p>;
      
      case 'chamber_enrollment':
      case 'document_auth':
      case 'other':
        return (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg">
            <p>{getTranslation('accountantPages.review.otherNote', 'This request may have additional documents attached.')}</p>
            {request.notes && (
              <div className="mt-4">
                <h4 className="font-semibold">{getTranslation('accountantPages.review.notes', 'Notes')}</h4>
                <p className="whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return <p>{getTranslation('accountantPages.review.noDetails', 'No details available for this request.')}</p>;
    }
  };

  return (
    <div>      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {getTranslation('accountantPages.review.title', 'Financial Review')}          
        </h2>        
      </div>
      
      <Card cardTitle={`${getTranslation('accountantPages.review.detailsTitle', 'Request Details')} #${id}`}>
        <div className="space-y-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>{getTranslation('accountantPages.review.serviceType', 'Service Type')}:</strong> 
                {request.request_type_name || request.serviceType}
              </p>
              <p><strong>{getTranslation('accountantPages.review.clientName', 'Client')}:</strong> User ID: {request.userId}</p>
              <p><strong>{getTranslation('accountantPages.review.submissionDate', 'Submission Date')}:</strong> {request.date}</p>
            </div>
            <div>
              <p><strong>{getTranslation('accountantPages.review.currentStatus', 'Current Status')}:</strong> 
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  getStatusClass(request.status)
                }`}>
                  {getTranslation(`status.${request.status}` as TranslationKey, request.status)}
                </span>
              </p>
              <p><strong>{getTranslation('accountantPages.review.fee', 'Fee')}:</strong> {request.fee || '0'} USD</p>
            </div>
          </div>
          
          <hr className="border-gray-200 dark:border-gray-700" />
          
          <div>
            <h4 className="font-bold mb-2">
              {getTranslation('accountantPages.review.requestContent', 'Request Content')}:
            </h4>
            {renderRequestDetails()}
          </div>
          
          <hr className="border-gray-200 dark:border-gray-700" />
          
          <FinancialDetails />
          
          {/* Show confirmation dialog if needed */}
          {showConfirmation ? (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <h4 className="font-bold text-lg mb-3">
                {pendingDecision === 'approved' 
                  ? getTranslation('accountantPages.review.confirmApprove', 'Confirm Approval') 
                  : getTranslation('accountantPages.review.confirmReject', 'Confirm Rejection')}
              </h4>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  {getTranslation('accountantPages.review.addComments', 'Add Comments (Optional)')}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                  rows={3}
                  placeholder={getTranslation('accountantPages.review.commentsPlaceholder', 'Enter any comments about this decision...')}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={cancelDecision}
                  className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {getTranslation('accountantPages.review.cancel', 'Cancel')}
                </button>
                <button 
                  onClick={confirmDecision}
                  className={`px-4 py-2 text-white rounded-md ${
                    pendingDecision === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {pendingDecision === 'approved' 
                    ? getTranslation('accountantPages.review.approveBtn', 'Approve Request') 
                    : getTranslation('accountantPages.review.rejectBtn', 'Reject Request')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <button 
                onClick={() => handleDecision('rejected')} 
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
              >
                {getTranslation('accountantPages.review.reject', 'Reject')}
              </button>
              <button 
                onClick={() => handleDecision('approved')} 
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
              >
                {getTranslation('accountantPages.review.actions.approve', 'Approve')}
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Function to get status classes
const getStatusClass = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.ISSUED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case RequestStatus.APPROVED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case RequestStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case RequestStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case RequestStatus.ON_HOLD: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case RequestStatus.PENDING_PAYMENT: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export default AccountantDocumentReviewPage;
