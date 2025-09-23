import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 p-2 print:hidden border-t border-gray-300 dark:border-gray-700 shrink-0">
      <div className="container mx-auto text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;