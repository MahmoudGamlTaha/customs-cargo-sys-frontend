
import React from 'react';
import Card from '../components/Card';
import { DownloadIcon, PrintIcon, OfficialLogoIcon } from '../components/icons';
import { useParams } from 'react-router-dom';
import { DocumentRequest, MemberProfile } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface ChamberEnrollmentCertificatePageProps {
  documentRequests: DocumentRequest[];
  profile: MemberProfile;
}

const ChamberEnrollmentCertificatePage: React.FC<ChamberEnrollmentCertificatePageProps> = ({ documentRequests, profile }) => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const request = documentRequests.find(req => req.id === id);
  const handlePrint = () => window.print();

  if (!request) {
      return (
        <div>
          <Card>
            <p className="p-8 text-center text-red-600 dark:text-red-400">{t('certs.notFound')}</p>
          </Card>
        </div>
      );
  }

  const CertRow: React.FC<{ labelKey: TranslationKey, value: React.ReactNode }> = ({ labelKey, value }) => (
    <div className="flex border-t border-gray-300 py-3">
        <dt className="w-1/3 font-semibold text-gray-700">{t(labelKey)}:</dt>
        <dd className="w-2/3 text-gray-800 font-medium">{value}</dd>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4 print:hidden">
         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">{t('certs.chamberEnrollment.title')}</h2>
         <div className="flex gap-2">
            <button className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base">
                <DownloadIcon /> <span className="hidden sm:inline">{t('certs.download')}</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base">
                <PrintIcon /> <span className="hidden sm:inline">{t('certs.print')}</span>
            </button>
         </div>
      </div>
      <div className="print:hidden mb-4">
      </div>

      <Card className="max-w-4xl mx-auto p-0 !bg-white" id="certificate">
        <div 
            className="p-4 sm:p-6 md:p-10 border-8 border-brand-accent bg-white text-gray-900 relative overflow-hidden" 
            style={{ fontFamily: language === 'ar' ? "'Cairo', sans-serif" : "'Roboto', sans-serif" }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
             <div className="absolute inset-0 flex items-center justify-center z-0">
                <OfficialLogoIcon className="w-2/3 h-auto object-contain opacity-10" />
            </div>

            <div className="relative z-10">
                <div className="text-center mb-10">
                    <OfficialLogoIcon className="h-16 sm:h-20 md:h-24 mx-auto mb-4" />
                    <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">{t('certs.membership.unionName')}</h1>
                    <h2 className="text-md sm:text-lg md:text-2xl font-semibold text-brand-secondary mt-2">{t('certs.chamberEnrollment.certTitle')}</h2>
                </div>

                <div className="text-center text-md sm:text-lg md:text-xl leading-relaxed">
                    <p>{t('certs.chamberEnrollment.attestation_1', { chamberName: profile.chamberName })}</p>
                    
                    <div className="my-6 text-left" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <dl className="bg-gray-50 border border-gray-300 rounded-lg p-4 sm:p-6">
                            <CertRow labelKey="certs.chamberEnrollment.company" value={language === 'ar' ? profile.companyNameAr : profile.companyNameEn} />
                            <CertRow labelKey="certs.chamberEnrollment.crNo" value={profile.commercialRegistryNo || 'N/A'} />
                            <CertRow labelKey="certs.chamberEnrollment.membershipNo" value={profile.id} />
                            <CertRow labelKey="certs.chamberEnrollment.activity" value={t('certs.membership.activityTypeValue')} />
                            <CertRow labelKey="certs.chamberEnrollment.address" value={t('data.locations.tripoli')} />
                        </dl>
                    </div>

                    <p>{t('certs.chamberEnrollment.attestation_2', { year: new Date().getFullYear() })}</p>
                    <p className="mt-6 text-sm italic">{t('certs.chamberEnrollment.attestation_3')}</p>
                </div>
                
                <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-200">
                    <div className="text-center">
                        <p className="font-bold text-sm sm:text-base">A. Salem</p>
                        <p className="border-t-2 border-gray-800 pt-1 text-xs sm:text-sm">{t('certs.chamberEnrollment.generalManager')}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-sm sm:text-base">{new Date(request.date).toLocaleDateString()}</p>
                        <p className="border-t-2 border-gray-800 pt-1 text-xs sm:text-sm">{t('certs.membership.issueDate')}</p>
                    </div>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default ChamberEnrollmentCertificatePage;
