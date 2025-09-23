import React from 'react';
import Card from '../components/Card';
import { DownloadIcon, PrintIcon, OfficialLogoIcon } from '../components/icons';
import { useParams } from 'react-router-dom';
import { Course, MemberProfile } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface CourseCertificatePageProps {
    courses: Course[];
    profile: MemberProfile;
}

const CourseCertificatePage: React.FC<CourseCertificatePageProps> = ({ courses, profile }) => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const course = courses.find(c => c.id === id);
    const handlePrint = () => window.print();

    if (!course) {
        return (
             <div>
                <Card><p className="p-8 text-center text-red-600">{t('certs.notFound')}</p></Card>
             </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4 print:hidden">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">{t('certs.course.title')}</h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base"><DownloadIcon /><span>{t('certs.download')}</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base"><PrintIcon /><span>{t('certs.print')}</span></button>
                </div>
            </div>
            <div className="print:hidden">
            </div>

            <Card className="max-w-4xl mx-auto p-0 !bg-white">
                <div className="p-4 sm:p-8 md:p-10 border-8 border-brand-secondary bg-white text-center text-gray-900" 
                    style={{ fontFamily: language === 'ar' ? "'Cairo', sans-serif" : "'Roboto', sans-serif" }}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                    <OfficialLogoIcon className="h-20 sm:h-24 mx-auto mb-4" />
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4">{t('certs.membership.unionName')}</p>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">{t('certs.course.certTitle')}</h1>
                    <p className="text-base sm:text-lg mb-8">{t('certs.course.certSubtitle')}</p>
                    <p className="text-base sm:text-lg mb-4">{t('certs.course.attestation_1')}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary my-4">{language === 'ar' ? profile.nameAr : profile.nameEn}</p>
                    <p className="text-base sm:text-lg mb-4">{t('certs.course.attestation_2')}</p>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-secondary my-4">{t(`data.courses.${course.title}` as TranslationKey)}</h2>
                    <div className="flex flex-col sm:flex-row justify-around items-center gap-8 sm:gap-0 mt-12 pt-8 border-t border-gray-200">
                        <div className="text-center">
                            <p className="font-bold text-sm sm:text-base">{course.instructor}</p>
                            <p className="text-xs sm:text-sm border-t-2 border-gray-800 mt-2 pt-2">{t('certs.course.instructor')}</p>
                        </div>
                        <div className="text-center">
                             <p className="font-bold text-sm sm:text-base">{t('certs.course.trainingCenterHead')}</p>
                            <p className="text-xs sm:text-sm border-t-2 border-gray-800 mt-2 pt-2">{t('certs.eSignature')}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CourseCertificatePage;