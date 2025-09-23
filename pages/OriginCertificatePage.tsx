
import React from 'react';
import Card from '../components/Card';
import { QrCodeIcon, DownloadIcon, PrintIcon, OfficialLogoIcon } from '../components/icons';
import { useParams } from 'react-router-dom';
import { DocumentRequest, MemberProfile, CertificateOfOriginData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface OriginCertificatePageProps {
  documentRequests: DocumentRequest[];
  profile: MemberProfile;
}

const OriginCertificatePage: React.FC<OriginCertificatePageProps> = ({ documentRequests, profile }) => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const request = documentRequests.find(req => req.id === id);
  const handlePrint = () => window.print();

  let certificateData: CertificateOfOriginData | undefined;

  if (request && request.certificateData) {
      if (typeof request.certificateData === 'string') {
          try {
              certificateData = JSON.parse(request.certificateData);
          } catch (e) {
              console.error("Failed to parse certificateData", e);
          }
      } else {
          certificateData = request.certificateData;
      }
  }


  if (!request || !certificateData) {
      return (
        <div>
          <Card>
            <p className="p-8 text-center text-red-600 dark:text-red-400">{t('certs.notFound')}</p>
          </Card>
        </div>
      );
  }

  const CertBox: React.FC<{ num: number, titleKey: string, children: React.ReactNode, colSpan?: number }> = ({ num, titleKey, children, colSpan = 1 }) => (
    <div className={`border border-gray-400 p-2 min-h-[60px] sm:min-h-[80px] md:col-span-${colSpan}`}>
      <p className="text-xs sm:text-sm font-bold text-gray-600">({num}) {t(titleKey as any)}</p>
      <div className="mt-1 text-sm sm:text-base font-semibold whitespace-pre-wrap">{children}</div>
    </div>
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-4 print:hidden">
         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">{t('certs.origin.title')}</h2>
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
      <Card className="max-w-4xl mx-auto p-0 !bg-white">
        <div className="p-2 sm:p-4 md:p-6 border-[6px] border-double border-brand-secondary bg-white text-gray-900" 
             style={{ fontFamily: language === 'ar' ? "'Cairo', sans-serif" : "'Roboto', sans-serif" }}
             dir="ltr"
        >
            <div className="flex justify-between items-center mb-4">
                <div className="text-left text-xs sm:text-sm">
                    <p>Certificate No.</p>
                    <p className="font-bold font-mono">{request.id}-CO</p>
                </div>
                <div className="text-center">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold">{t('certs.origin.countryNameAr')}</h1>
                    <p className="text-xs sm:text-sm">{t('certs.origin.countryNameEn')}</p>
                </div>
                 <OfficialLogoIcon className="h-12 sm:h-16" />
            </div>

            <div className="text-center mb-4">
                 <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 underline">{t('certs.origin.certTitleAr')}</h2>
                 <p className="text-base sm:text-lg font-semibold">{t('certs.origin.certTitleEn')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t-2 border-l-2 border-r-2 border-black">
                <CertBox num={1} titleKey="certs.origin.exporter">{language === 'ar' ? profile.companyNameAr : profile.companyNameEn}\nTripoli, Libya</CertBox>
                <CertBox num={2} titleKey="certs.origin.consignee">{certificateData.consignee}</CertBox>
                <CertBox num={3} titleKey="certs.origin.countryOfOrigin">Libya - ليبيا</CertBox>
                <CertBox num={4} titleKey="certs.origin.transportDetails">{certificateData.transportDetails}</CertBox>
            </div>

            <div className="border-t-2 border-l-2 border-r-2 border-black overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm min-w-[640px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-b-2 border-r border-black p-2 font-semibold w-1/4">(5) {t('certs.origin.marksAndNumbers')}</th>
                            <th className="border-b-2 border-r border-black p-2 font-semibold w-1/2">(6) {t('certs.origin.packagesAndDescription')}</th>
                            <th className="border-b-2 border-r border-black p-2 font-semibold w-1/8">(7) {t('certs.origin.grossWeight')}</th>
                            <th className="border-b-2 border-black p-2 font-semibold w-1/8">(8) {t('certs.origin.netWeight')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="align-top">
                            <td className="border-r border-black p-2 h-32">{certificateData.marksAndNumbers}</td>
                            <td className="border-r border-black p-2">
                                <p className="font-bold">{certificateData.numberOfPackages}</p>
                                <p>{certificateData.goodsDescription}</p>
                            </td>
                            <td className="border-r border-black p-2">{certificateData.grossWeight}</td>
                            <td className="p-2">{certificateData.netWeight}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black border-t-0">
                 <CertBox num={9} titleKey="certs.origin.invoiceDetails">
                    No: {certificateData.invoiceNumber}
                    <br/>
                    Date: {certificateData.invoiceDate}
                 </CertBox>
                 <CertBox num={10} titleKey="certs.origin.chamberCertification">
                    {t('certs.origin.chamberAttestation')}
                 </CertBox>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end mt-6">
                <div className="text-center">
                    <QrCodeIcon className="w-16 h-16 sm:w-24 sm:h-24 mx-auto"/>
                </div>
                <div className="text-center">
                     <p className="font-bold text-base sm:text-lg border-b-2 border-gray-400 pb-2 mb-2">{t('certs.origin.chamberSeal')}</p>
                     <p className="italic text-gray-500 text-xs sm:text-sm">{t('certs.eSignature')}</p>
                     <p className="mt-2 text-sm font-mono">{request.date}</p>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default OriginCertificatePage;
