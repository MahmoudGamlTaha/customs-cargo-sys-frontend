import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import { BuildingOfficeIcon } from '../components/icons';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

const CompanyProfilePage: React.FC = () => {
    const { id } = useParams();
    const { t } = useLanguage();

    // In a real app, you'd fetch company data based on ID.
    // Here we'll just use a mock key.
    const companyNameKey = 'data.companies.modern_building';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('companyProfile.title')}</h2>
            </div>
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                           <BuildingOfficeIcon />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{t(companyNameKey as TranslationKey)}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{t('companyProfile.mockSector')}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-gray-700 dark:text-gray-300">{t('companyProfile.placeholder', {id: id!})}</p>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="px-6 py-2 bg-brand-secondary text-white font-bold rounded-lg hover:bg-green-700">{t('companyProfile.sendMessage')}</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CompanyProfilePage;