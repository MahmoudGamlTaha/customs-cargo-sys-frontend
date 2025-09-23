import React from 'react';
import Card from '../../components/Card';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminSettingsPage: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('adminPages.settings.title')}</h2>
            </div>

            <Card cardTitle={t('adminPages.settings.general.title')}>
                <div className="p-6 space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        {t('adminPages.settings.general.description')}
                    </p>
                    <div className="border-t pt-4 dark:border-gray-700">
                        <h4 className="font-semibold text-lg mb-2">{t('adminPages.settings.general.futureSettingsTitle')}</h4>
                        <ul className="list-disc ltr:list-inside rtl:list-outside rtl:mr-4 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>{t('adminPages.settings.general.item1')}</li>
                            <li>{t('adminPages.settings.general.item2')}</li>
                            <li>{t('adminPages.settings.general.item3')}</li>
                            <li>{t('adminPages.settings.general.item4')}</li>
                            <li>{t('adminPages.settings.general.item5')}</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminSettingsPage;