import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { BuildingOfficeIcon, MessageIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

const allCompanies = [
  { id: 1, nameKey: 'modern_building', sectorKey: 'contracting' },
  { id: 2, nameKey: 'web_solutions', sectorKey: 'it' },
  { id: 3, nameKey: 'foodstuff_trading', sectorKey: 'import_export' },
  { id: 4, nameKey: 'advanced_energy', sectorKey: 'oil_services' },
  { id: 5, nameKey: 'industrial_river', sectorKey: 'industrial'},
  { id: 6, nameKey: 'oasis_trading', sectorKey: 'general_trading'},
  { id: 7, nameKey: 'new_horizon', sectorKey: 'it'},
];

const CompanyCard: React.FC<{ company: typeof allCompanies[0] }> = ({ company }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [contactStatus, setContactStatus] = useState('');

    const handleContact = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContactStatus('sending');
        setTimeout(() => {
            setContactStatus('sent');
            setTimeout(() => {
                setContactStatus('');
            }, 2000);
        }, 1000);
    };
    
    const getContactButtonText = () => {
        if(contactStatus === 'sending') return t('b2b.companyCard.sending');
        if(contactStatus === 'sent') return t('b2b.companyCard.sent');
        return t('b2b.companyCard.contact');
    };

    return (
        <div 
            onClick={() => navigate(`/b2b-networking/${company.id}`)}
            className="border dark:border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md hover:border-brand-primary transition-all duration-300 h-full cursor-pointer flex flex-col justify-between"
        >
            <div className="flex items-center">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <BuildingOfficeIcon />
                </div>
                <div className="ltr:ml-4 rtl:mr-4">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{t(`data.companies.${company.nameKey}` as TranslationKey)}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t(`data.sectors.${company.sectorKey}` as TranslationKey)}</p>
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button 
                    onClick={handleContact}
                    className="flex items-center justify-center gap-2 text-sm bg-brand-secondary text-white py-1 px-3 rounded-md hover:bg-green-700 w-full disabled:opacity-70"
                    disabled={!!contactStatus}
                >
                    <MessageIcon />
                    <span>{getContactButtonText()}</span>
                </button>
            </div>
        </div>
    );
};

const B2BNetworkingPage: React.FC = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [sectorFilter, setSectorFilter] = useState('all');

    const filteredCompanies = useMemo(() => {
        return allCompanies.filter(company => {
            const translatedName = t(`data.companies.${company.nameKey}` as TranslationKey);
            const matchesSearch = translatedName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSector = sectorFilter === 'all' || company.sectorKey === sectorFilter;
            return matchesSearch && matchesSector;
        });
    }, [searchTerm, sectorFilter, t]);
    
    const sectorOptions = ['all', 'contracting', 'it', 'import_export', 'oil_services', 'industrial', 'general_trading'];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('b2b.title')}</h2>
            </div>
            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input 
                        type="text" 
                        placeholder={t('b2b.search.placeholder')} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500" 
                    />
                    <select 
                        value={sectorFilter}
                        onChange={e => setSectorFilter(e.target.value)}
                        className="p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                    >
                        {sectorOptions?.map(sector => (
                           <option key={sector} value={sector}>{t(`data.sectors.${sector}` as TranslationKey)}</option> 
                        ))}
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies?.map(company => (
                       <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            </Card>

             <div className="mt-8">
                <Card cardTitle={t('b2b.marketplace.title')}>
                    <p className="text-gray-600 dark:text-gray-400">{t('b2b.marketplace.noOffers')}</p>
                </Card>
            </div>
        </div>
    );
};

export default B2BNetworkingPage;