
import React, { useState } from 'react';
import Card from '../components/Card';
import { RequestStatus, DocumentRequest, CertificateOfOriginData, CertificateType } from '../types';
import { Link } from 'react-router-dom';
import CustomSelect from '../components/CustomSelect';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';


const getStatusClass = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case RequestStatus.APPROVED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case RequestStatus.ISSUED: return 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light';
        case RequestStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

interface DocumentServicesProps {
    documentRequests: DocumentRequest[];
    onRequestCertificate: (serviceTypeKey: CertificateType, translatedServiceType: string, fee: number, notes: string) => Promise<boolean>;
    balance: number;
}

const DocumentServices: React.FC<DocumentServicesProps> = ({ documentRequests, onRequestCertificate, balance }) => {
  const { t } = useLanguage();
  const [serviceTypeKey, setServiceTypeKey] = useState<CertificateType | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [certificateData, setCertificateData] = useState<CertificateOfOriginData>({
    consignee: '',
    transportDetails: '',
    marksAndNumbers: '',
    numberOfPackages: '',
    goodsDescription: '',
    grossWeight: '',
    netWeight: '',
    invoiceNumber: '',
    invoiceDate: '',
  });

  const handleCertDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCertificateData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const serviceOptions = [
      { key: "origin" as CertificateType, fee: 150 },
      { key: "chamber_enrollment" as CertificateType, fee: 75 },
      { key: "document_auth" as CertificateType, fee: 50 },
      { key: "other" as CertificateType, fee: 25 },
  ];
  
  const selectOptions = serviceOptions?.map(opt => ({
      value: opt.key,
      label: `${t(`data.serviceTypes.${opt.key}` as TranslationKey)} (${opt.fee} ${t('wallet.currency')})`
  }));
  
  const selectedService = serviceOptions.find(s => s.key === serviceTypeKey);
  const isCertificateOfOrigin = serviceTypeKey === 'origin';

  const isFormValid = () => {
    if (!selectedService) return false;
    if(balance < selectedService.fee) return false;
    if (isCertificateOfOrigin) {
        return Object.values(certificateData).every(val => val.trim() !== '');
    }
    return true; // For other services, only service selection is needed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !selectedService) {
        return;
    }
    
    const requestNotes = isCertificateOfOrigin ? JSON.stringify(certificateData) : notes;
    const translatedServiceType = t(`data.serviceTypes.${selectedService.key}` as TranslationKey);
    const success = await onRequestCertificate(selectedService.key, translatedServiceType, selectedService.fee, requestNotes);

    if(success) {
        setServiceTypeKey('');
        setNotes('');
        setCertificateData({consignee:'', transportDetails:'', marksAndNumbers:'', numberOfPackages:'', goodsDescription:'', grossWeight:'', netWeight:'', invoiceNumber:'', invoiceDate:''});
    }
  };

  const CertInputField = ({ name, label, required = true }: { name: keyof CertificateOfOriginData, label: string, required?: boolean }) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input 
          type="text" 
          name={name} 
          value={certificateData[name]} 
          onChange={handleCertDataChange} 
          className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-brand-primary focus:border-brand-primary" 
          required={required} 
        />
      </div>
  );

  const getCertificateLink = (req: DocumentRequest) => {
      if (req.status !== RequestStatus.ISSUED) return null;
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
          <Link to={path} className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800 hover:bg-green-300 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800">
              {t('documentServices.trackRequests.viewCertificate')}
          </Link>
      );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('documentServices.title')}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card cardTitle={t('documentServices.newRequest.title')}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="service-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('documentServices.newRequest.selectService')}</label>
                        <CustomSelect
                            options={selectOptions}
                            value={serviceTypeKey}
                            onChange={(val) => setServiceTypeKey(val as CertificateType)}
                            placeholder={`-- ${t('documentServices.newRequest.choose')} --`}
                        />
                    </div>
                    
                    {isCertificateOfOrigin && (
                        <div className="p-4 border rounded-lg dark:border-gray-700 space-y-4">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{t('documentServices.certOfOrigin.title')}</h3>
                            
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('documentServices.certOfOrigin.consignee')}</label>
                                  <textarea name="consignee" value={certificateData.consignee} onChange={handleCertDataChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" rows={2} required></textarea>
                               </div>

                                <CertInputField name="transportDetails" label={t('documentServices.certOfOrigin.transportDetails')} />
                                <CertInputField name="marksAndNumbers" label={t('documentServices.certOfOrigin.marksAndNumbers')} />
                                <CertInputField name="numberOfPackages" label={t('documentServices.certOfOrigin.packages')} />
                               
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('documentServices.certOfOrigin.goodsDescription')}</label>
                                    <textarea name="goodsDescription" value={certificateData.goodsDescription} onChange={handleCertDataChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" rows={3} required></textarea>
                                </div>
                                
                                <CertInputField name="grossWeight" label={t('documentServices.certOfOrigin.grossWeight')} />
                                <CertInputField name="netWeight" label={t('documentServices.certOfOrigin.netWeight')} />
                                
                                <div className="md:col-span-2 border-t pt-4 dark:border-gray-600">
                                   <div className="grid grid-cols-2 gap-4">
                                      <CertInputField name="invoiceNumber" label={t('documentServices.certOfOrigin.invoiceNumber')} />
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('documentServices.certOfOrigin.invoiceDate')}</label>
                                        <input type="date" name="invoiceDate" value={certificateData.invoiceDate} onChange={handleCertDataChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" required />
                                      </div>
                                   </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isCertificateOfOrigin && serviceTypeKey && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('documentServices.newRequest.uploadFiles')}</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-brand-primary hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>{t('documentServices.newRequest.chooseFile')}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                                        </label>
                                        <p className="px-1">{t('documentServices.newRequest.orDrag')}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{t('documentServices.newRequest.fileTypes')}</p>
                                    {file && <p className="text-sm text-green-600 dark:text-green-400 mt-2">{file.name}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {selectedService && (
                      <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                          <div>
                            <p className="font-bold text-lg">{t('documentServices.newRequest.fees')}: <span className="text-brand-primary">{selectedService.fee.toFixed(2)} {t('wallet.currency')}</span></p>
                            {balance < selectedService.fee && (
                                <p className="text-red-600 dark:text-red-400 text-sm">
                                    {t('wallet.insufficientFundsShort')} <Link to="/wallet" className="font-bold underline">{t('wallet.topUpLink')}</Link>
                                </p>
                            )}
                          </div>
                          <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!isFormValid()}>
                              {t('documentServices.newRequest.submitButton')}
                          </button>
                      </div>
                    )}
                </form>
            </Card>
        </div>
        <div>
            <Card cardTitle={t('documentServices.trackRequests.title')}>
                <div className="space-y-4">
                    {documentRequests?.map(req => (
                        <div key={req.id} className="p-3 border dark:border-gray-700 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">{t(`data.serviceTypes.${req.serviceType}` as TranslationKey)}</h4>
                                {getCertificateLink(req) ?? (
                                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>{t(`status.${req.status}` as TranslationKey)}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('documentServices.trackRequests.requestId')}: {req.id}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('documentServices.trackRequests.date')}: {req.date}</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                                <div className="bg-brand-primary h-2.5 rounded-full" style={{width: req.status === RequestStatus.Completed ? '100%' : (req.status === RequestStatus.InProgress ? '50%' : (req.status === RequestStatus.New ? '25%' : '10%'))}}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentServices;
