import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface DevelopmentBadgeProps {
  className?: string;
}

const DevelopmentBadge: React.FC<DevelopmentBadgeProps> = ({ className = "" }) => {
  const { t } = useLanguage();
  
  return (
    <div className={`inline-flex gap-2 items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ${className}`}>
      <div className="w-2 h-2 bg-orange-500 rounded-full mr-1.5 animate-pulse"></div>
      {t('adminDashboard.navigation.underDevelopment')}
    </div>
  );
};

export default DevelopmentBadge;
