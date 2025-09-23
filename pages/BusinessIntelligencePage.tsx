import React from 'react';
import Card from '../components/Card';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

const marketData = [
    { month: 'january', 'import': 4000, 'export': 2400 },
    { month: 'february', 'import': 3000, 'export': 1398 },
    { month: 'march', 'import': 2000, 'export': 9800 },
    { month: 'april', 'import': 2780, 'export': 3908 },
    { month: 'may', 'import': 1890, 'export': 4800 },
    { month: 'june', 'import': 2390, 'export': 3800 },
];

const activityData = [
  { name: 'general_trading', count: 450 },
  { name: 'contracting', count: 320 },
  { name: 'oil_services', count: 210 },
  { name: 'it', count: 180 },
  { name: 'foodstuff', count: 150 },
  { name: 'other', count: 310 },
];

const BusinessIntelligencePage: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const tickColor = theme === 'dark' ? '#A0AEC0' : '#374151';
    const gridColor = theme === 'dark' ? '#4A5568' : '#E2E8F0';
    const tooltipStyle = {
        backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
        borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0'
    };
    
    const translatedMarketData = marketData?.map(item => ({
        ...item,
        month: t(`data.months.${item.month}` as TranslationKey)
    }));

    const translatedActivityData = activityData?.map(item => ({
        ...item,
        name: t(`data.activityTypes.${item.name}` as TranslationKey)
    }));
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('biReports.title')}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card cardTitle={t('biReports.marketTrends.title')}>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                             <AreaChart data={translatedMarketData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                                <XAxis dataKey="month" stroke={tickColor}/>
                                <YAxis stroke={tickColor}/>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ color: tickColor }}/>
                                <Area type="monotone" dataKey="import" name={t('biReports.marketTrends.import')} stackId="1" stroke="#8884d8" fill="#8884d8" />
                                <Area type="monotone" dataKey="export" name={t('biReports.marketTrends.export')} stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card cardTitle={t('biReports.memberActivity.title')}>
                     <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={translatedActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} stroke={tickColor} />
                                <YAxis stroke={tickColor} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ color: tickColor }} />
                                <Bar dataKey="count" name={t('biReports.memberActivity.companyCount')} fill="var(--brand-primary, #EA580C)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BusinessIntelligencePage;