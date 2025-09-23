import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { OfficialLogoIcon, UsersIcon, DocumentIcon, PaymentIcon, EventsIcon } from '../components/icons';

const AnimatedPlatformDemo: React.FC = () => {
    const iconBaseClasses = "absolute w-12 h-12 sm:w-16 sm:h-16 p-3 sm:p-4 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/50 flex items-center justify-center transition-transform hover:scale-110";

    return (
        <div className="relative w-full aspect-[4/3] sm:aspect-video max-w-lg mx-auto my-8">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl shadow-2xl transform -rotate-3"></div>
            <div className="relative w-full h-full bg-gray-200/50 dark:bg-gray-900/50 rounded-2xl shadow-inner backdrop-blur-lg overflow-hidden">
                {/* Floating Icons */}
                <div className={`${iconBaseClasses} top-[10%] left-[15%] text-blue-500`}><UsersIcon /></div>
                <div className={`${iconBaseClasses} top-[20%] right-[10%] text-green-500`}><DocumentIcon /></div>
                <div className={`${iconBaseClasses} bottom-[25%] left-[25%] text-yellow-500`}><PaymentIcon /></div>
                <div className={`${iconBaseClasses} bottom-[15%] right-[20%] text-purple-500`}><EventsIcon /></div>

                {/* Animated Cursor */}
                <div className="animated-cursor"></div>
            </div>
        </div>
    );
};


const WelcomeScreen: React.FC = () => {
    const [isAgreed, setIsAgreed] = useState(false);
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const languages = [
      { code: 'ar', name: 'العربية', flag: 'AR' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    const currentLanguage = languages.find(lang => lang.code === language);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsLanguageDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleContinue = () => {
        if (isAgreed) {
            navigate('/login');
        }
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-gray-800 dark:text-gray-200">
            <div className="absolute top-4 ltr:right-4 rtl:left-4" ref={dropdownRef}>
              <button 
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center font-bold text-lg text-brand-primary hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-400 px-3 py-1 rounded-md"
                aria-label={t('header.toggleLanguage')}
              >
                <span className="text-lg mr-1">{currentLanguage?.flag}</span>
                <span className="text-sm font-medium">{currentLanguage?.name}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  {languages?.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'ar' | 'en' | 'fr');
                        setIsLanguageDropdownOpen(false);
                      }}
                      disabled={lang.code === language}
                      className={`w-full flex items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        lang.code === language 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-lg mr-3">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {lang.code === language && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="w-full max-w-3xl text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
                    <OfficialLogoIcon className="h-16 sm:h-20" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary dark:text-blue-300">{t('welcomeScreen.title')}</h1>
                </div>

                <AnimatedPlatformDemo />

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl mx-auto">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {t('welcomeScreen.disclaimer')}
                    </p>
                    
                    <div className="flex items-center justify-center mb-6">
                        <input
                            type="checkbox"
                            id="agree"
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <label htmlFor="agree" className="ltr:ml-2 rtl:mr-2 block text-sm text-gray-900 dark:text-gray-300">
                           {t('welcomeScreen.agreeCheckbox')}
                        </label>
                    </div>

                    {isAgreed && (
                        <button
                            onClick={handleContinue}
                            className="w-full bg-brand-primary hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-opacity duration-300"
                        >
                           {t('welcomeScreen.continueButton')}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default WelcomeScreen;