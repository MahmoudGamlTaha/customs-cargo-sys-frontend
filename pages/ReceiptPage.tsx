import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import { Invoice, MemberProfile, InvoiceStatus } from '../types';
import { PrintIcon, OfficialLogoIcon } from '../components/icons';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface ReceiptPageProps {
    invoices: Invoice[];
    profile: MemberProfile;
}

const ReceiptPage: React.FC<ReceiptPageProps> = ({ invoices, profile }) => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const invoice = invoices.find(inv => inv.id === id);

    const handlePrint = () => window.print();

    if (!invoice) {
        return (
            <div>
                <Card><p className="p-8 text-center text-red-600 dark:text-red-400">{t('receipt.notFound')}</p></Card>
            </div>
        );
    }

    const isPaid = invoice.status === InvoiceStatus.Paid;
    const stampTextKey = isPaid ? 'receipt.paidStamp' : 'receipt.pendingStamp';
    const stampColorClass = isPaid
        ? 'text-green-500 opacity-10 dark:text-green-500 dark:opacity-20'
        : 'text-yellow-500 opacity-10 dark:text-yellow-500 dark:opacity-20';


    return (
        <div>
            <div className="flex justify-between items-center mb-4 print:hidden">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">{t('receipt.title')}</h2>
                <div className="flex gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base">
                        <PrintIcon /> <span className="hidden sm:inline">{t('certs.print')}</span>
                    </button>
                    <Link to="/dashboard" className="flex items-center gap-2 text-brand-primary font-semibold hover:underline">
                      <span className="hidden sm:inline">{t('receipt.backToHome')}</span>
                    </Link>
                </div>
            </div>
            
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
            
            <Card className="!bg-white text-gray-900">
                <div className="p-4 sm:p-6 md:p-8 relative print-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <p className={`text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black transform -rotate-15 select-none ${stampColorClass}`}>
                             {t(stampTextKey as TranslationKey)}
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{t('receipt.title')}</h3>
                                <p className="text-gray-500">{t('receipt.subtitle')}</p>
                                <p className="mt-2 text-sm">{t('receipt.receiptNo')}: <span className="font-mono">{invoice.id}</span></p>
                                <p className="text-sm">{t('receipt.paymentDate')}: <span className="font-mono">{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US') : t(`status.${invoice.status}` as TranslationKey)}</span></p>
                            </div>
                            <OfficialLogoIcon className="h-12 sm:h-16 md:h-20 flex-shrink-0"/>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm mb-8 border-t border-b border-gray-200 py-4">
                             <div>
                                <h4 className="font-bold text-gray-600 mb-1">{t('receipt.recipient')}:</h4>
                                <p className="font-semibold text-gray-800">{t('certs.membership.unionName')}</p>
                                <p>{t('data.locations.tripoli')}, {t('receipt.libya')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-600 mb-1">{t('receipt.payer')}:</h4>
                                <p className="font-semibold text-gray-800">{language === 'ar' ? profile.nameAr : profile.nameEn}</p>
                                <p>{language === 'ar' ? profile.companyNameAr : profile.companyNameEn}</p>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full mb-8">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2 text-inherit font-semibold text-gray-600 text-sm sm:text-base whitespace-nowrap">{t('receipt.description')}</th>
                                        <th className="p-2 text-inherit font-semibold text-gray-600 text-sm sm:text-base whitespace-nowrap">{t('receipt.amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-3 text-sm sm:text-base">{invoice.description}</td>
                                        <td className="p-3 font-mono text-inherit text-sm sm:text-base whitespace-nowrap">{invoice.amount.toFixed(2)} LYD</td>
                                    </tr>
                                </tbody>
                                <tfoot className="font-bold">
                                    <tr>
                                        <td className="p-3 text-inherit text-sm sm:text-base whitespace-nowrap">{t('receipt.total')}</td>
                                        <td className="p-3 bg-gray-100 font-mono text-inherit text-sm sm:text-base whitespace-nowrap">{invoice.amount.toFixed(2)} LYD</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="text-center text-xs text-gray-500 mt-12">
                            <p>{t('receipt.eReceipt')}</p>
                            <p>{t('receipt.thankYou')}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReceiptPage;