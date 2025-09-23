
import React from 'react';
import Card from '../../components/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage, TranslationKey } from '../../contexts/LanguageContext';
import { Payment } from '../../types';

const revenueByServiceData = [
    { name: 'membership_fees', value: 450000 },
    { name: 'origin_certificates', value: 320000 },
    { name: 'attestations', value: 210000 },
    { name: 'events', value: 180000 },
    { name: 'training', value: 150000 },
];

const monthlyRevenueData = [
    { month: 'january', revenue: 110000 },
    { month: 'february', revenue: 130000 },
    { month: 'march', revenue: 180000 },
    { month: 'april', revenue: 160000 },
    { month: 'may', revenue: 210000 },
    { month: 'june', revenue: 250000 },
];

interface AdminFinancialsPageProps {
    payments: Payment[];
}

const AdminFinancialsPage: React.FC<AdminFinancialsPageProps> = ({ payments }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const tickColor = theme === 'dark' ? '#A0AEC0' : '#374151';
    const gridColor = theme === 'dark' ? '#4A5568' : '#E2E8F0';
    const tooltipStyle = {
        backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
        borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0'
    };

    const translatedRevenueData = revenueByServiceData?.map(item => ({
        ...item,
        name: t(`adminPages.financials.revenueByService.services.${item.name}` as TranslationKey)
    }));
    
    const translatedMonthlyData = monthlyRevenueData?.map(item => ({
        ...item,
        month: t(`data.months.${item.month}` as TranslationKey)
    }));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('adminPages.financials.title')}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card cardTitle={t('adminPages.financials.revenueByService.title')}>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={translatedRevenueData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis type="number" stroke={tickColor} />
                                <YAxis type="category" dataKey="name" width={120} stroke={tickColor} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme === 'dark' ? '#4A5568' : '#f3f4f6' }} />
                                <Legend wrapperStyle={{ color: tickColor }}/>
                                <Bar dataKey="value" name={t('adminPages.financials.revenueByService.revenue')} fill="#007A3D" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card cardTitle={t('adminPages.financials.monthlyRevenue.title')}>
                     <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={translatedMonthlyData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                                <XAxis dataKey="month" stroke={tickColor}/>
                                <YAxis stroke={tickColor}/>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ color: tickColor }}/>
                                <Line type="monotone" dataKey="revenue" name={t('adminPages.financials.monthlyRevenue.revenue')} stroke="#D4AF37" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="mt-6">
                <Card cardTitle={t('adminPages.financials.fullLedger.title')}>
                    <p className="p-4 text-gray-600 dark:text-gray-400">{t('adminPages.financials.fullLedger.placeholder')}</p>
                </Card>
            </div>
        </div>
    );
};

export default AdminFinancialsPage;
