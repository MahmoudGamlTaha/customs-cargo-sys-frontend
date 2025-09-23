
import React from 'react';
import Card from '../components/Card';
import { QrCodeIcon, DownloadIcon, PrintIcon, OfficialSealIcon, OfficialLogoIcon } from '../components/icons';
import { MemberProfile } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface MembershipCertificatePageProps {
    profile: MemberProfile;
}

const MembershipCertificatePage: React.FC<MembershipCertificatePageProps> = ({ profile }) => {
  const { t, language } = useLanguage();
  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex justify-between items-center mb-4 print:hidden">
         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">{t('certs.membership.title')}</h2>
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
            className="p-4 sm:p-6 md:p-10 border-8 border-brand-primary bg-white text-gray-900 relative overflow-hidden" 
            style={{ fontFamily: language === 'ar' ? "'Cairo', sans-serif" : "'Roboto', sans-serif" }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <OfficialLogoIcon className="w-2/3 h-auto object-contain opacity-10" />
            </div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <OfficialLogoIcon className="h-16 sm:h-20 md:h-24 mx-auto mb-4" />
                    <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">{t('certs.membership.unionName')}</h1>
                    <h2 className="text-md sm:text-lg md:text-2xl font-semibold text-brand-secondary mt-2">{t('certs.membership.certTitle')}</h2>
                    <p className="text-sm sm:text-base md:text-lg">{t('certs.membership.certSubtitle')}</p>
                </div>

                <div className="text-right leading-relaxed sm:leading-loose text-sm sm:text-base md:text-lg">
                    <p>{t('certs.membership.attestation_1')}</p>
                    <p className="font-bold text-base sm:text-lg md:text-xl my-2 text-brand-primary">{language === 'ar' ? profile.companyNameAr : profile.companyNameEn}</p>
                    <p>{t('certs.membership.attestation_2')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 my-6 sm:my-8 text-right text-sm sm:text-base border-t border-b border-gray-200 py-4">
                    <div><strong className="font-semibold text-gray-800">{t('certs.membership.memberId')}:</strong> {profile.id}</div>
                    <div><strong className="font-semibold text-gray-800">{t('certs.membership.crNo')}:</strong> {profile.commercialRegistryNo || 'N/A'}</div>
                    <div><strong className="font-semibold text-gray-800">{t('certs.membership.grade')}:</strong> {profile.membershipGrade ? t(`data.grades.${profile.membershipGrade}` as TranslationKey) : 'N/A'}</div>
                    <div><strong className="font-semibold text-gray-800">{t('certs.membership.activityType')}:</strong> {t('certs.membership.activityTypeValue')}</div>
                    <div><strong className="font-semibold text-gray-800">{t('certs.membership.issueDate')}:</strong> {new Date().getFullYear()}-01-01</div>
                    <div><strong className="font-semibold text-gray-800">{t('certs.membership.expiryDate')}:</strong> {profile.expiryDate ? new Date(profile.expiryDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 mt-8 sm:mt-12">
                    <div className="text-center">
                        <QrCodeIcon className="w-16 h-16 sm:w-24 sm:h-24" />
                        <p className="text-xs mt-1 text-gray-600">{t('certs.verify')}</p>
                    </div>
                    <div className="text-center">
                        <OfficialSealIcon className="w-16 h-16 sm:w-24 sm:h-24 text-brand-secondary opacity-80"/>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-base sm:text-lg" style={{fontFamily: "'Brush Script MT', cursive"}}>A. Ali</p>
                        <p className="font-bold border-t-2 border-gray-800 pt-1 text-sm sm:text-base">{t('certs.chamberPresident')}</p>
                        <p className="italic text-gray-500 text-xs sm:text-sm">{t('certs.eSignature')}</p>
                    </div>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default MembershipCertificatePage;
