

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Chamber } from '../types';
import CustomSelect from '../components/CustomSelect';
import { OfficialLogoIcon, CloseIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/Card';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (fullName: string, email: string, phone: string, chamberId: string, password: string) => Promise<boolean>;
  chambers: Chamber[];
}

// const SignupModal: React.FC<{
//   isOpen: boolean;
//   onClose: () => void;
//   onSignup: (fullName: string, email: string, phone: string, chamberId: string, password: string) => Promise<boolean>;
//   chambers: Chamber[];
// }> = ({ isOpen, onClose, onSignup, chambers }) => {
//     const { t } = useLanguage();
//     const [fullName, setFullName] = useState('');
//     const [email, setEmail] = useState('');
//     const [phone, setPhone] = useState('');
//     const [chamberId, setChamberId] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);
//         const success = await onSignup(fullName, email, phone, chamberId, password);
//         setLoading(false);
//         if (success) {
//             onClose();
//         } else {
//             setError(t('login.signupError'));
//         }
//     };

//     if (!isOpen) return null;

//     const chamberOptions = chambers?.map(c => ({ value: c.id, label: c.name }));

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <Card className="w-full max-w-md" cardTitle={t('login.createAccount')}>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
//                         <CloseIcon />
//                     </button>
//                     {error && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
//                     <div>
//                         <label className="block text-sm font-bold mb-1">{t('userProfile.accountInfo.fullName')}</label>
//                         <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 border rounded" required disabled={loading} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-bold mb-1">{t('login.emailLabel')}</label>
//                         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required disabled={loading} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-bold mb-1">{t('login.passwordLabel')}</label>
//                         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required minLength={6} disabled={loading} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-bold mb-1">{t('userProfile.accountInfo.phone')}</label>
//                         <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" required disabled={loading} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-bold mb-1">{t('adminDashboard.chambersStats.chamber')}</label>
//                         <CustomSelect options={chamberOptions} value={chamberId} onChange={setChamberId} placeholder="Select a chamber" />
//                     </div>
//                     <div className="flex gap-3">
//                         <button 
//                             type="button" 
//                             onClick={onClose}
//                             className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 disabled:bg-gray-300" 
//                             disabled={loading}
//                         >
//                             {t('login.cancel')}
//                         </button>
//                         <button 
//                             type="submit" 
//                             className="flex-1 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 disabled:bg-gray-400" 
//                             disabled={loading}
//                         >
//                             {loading ? t('login.sending') : t('login.createAccount')}
//                         </button>
//                     </div>
//                 </form>
//             </Card>
//         </div>
//     );
// };
// Here is the signup modal -> to be hidden for now


const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignup, chambers }) => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState('');
  const [isSignupOpen, setSignupOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await onLogin(email, password);
    setLoading(false);
    if (!success) {
      setError(t('login.invalidCredentials'));
    }
  };
  

  
  const handleForgotPassword = () => {
    setForgotPasswordStatus('sending');
    setTimeout(() => {
        setForgotPasswordStatus('linkSent');
        setTimeout(() => {
            setForgotPasswordStatus('');
        }, 2000);
    }, 1000);
  };
  
  const getForgotPasswordText = () => {
    if (forgotPasswordStatus === 'sending') return t('login.sending');
    if (forgotPasswordStatus === 'linkSent') return t('login.linkSent');
    return t('login.forgotPassword');
  };


  return (
    <>
    {/* <SignupModal isOpen={isSignupOpen} onClose={() => setSignupOpen(false)} onSignup={onSignup} chambers={chambers} /> */}
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
       <div className="text-center mb-8">
            <OfficialLogoIcon className="h-16 sm:h-20 mx-auto dark:invert"/>
        </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 relative">
        <div className="absolute top-4 ltr:right-4 rtl:left-4" ref={dropdownRef}>
          <button 
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="flex items-center font-bold text-lg text-brand-primary hover:text-brand-primary-hover dark:text-brand-primary-light dark:hover:text-brand-primary px-3 py-1 rounded-md"
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
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">{t('login.title')}</h2>
        <form onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              {t('login.emailLabel')}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-brand-primary"
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              {t('login.passwordLabel')}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-brand-primary"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-3 mb-6">
            <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400" type="submit" disabled={loading}>
              {loading ? t('login.sending') : t('login.loginButton')}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/public/certificate/')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
            >
              {t('login.certificateValidation')}
            </button>
          </div>
          {/* <div className="text-center">
              <button type="button" onClick={handleForgotPassword} className="inline-block align-baseline font-bold text-sm text-brand-primary hover:text-brand-primary-hover disabled:text-gray-500" disabled={!!forgotPasswordStatus}>
              {getForgotPasswordText()}
            </button>
            <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
             <button type="button" onClick={() => setSignupOpen(true)} className="inline-block align-baseline font-bold text-sm text-brand-primary hover:text-brand-primary-hover">
              {t('login.createAccount')}
            </button>
          </div> */}
        </form>
        {/* <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold">{t('login.loginAs')}</p>
            <p>member@demo.com | staff@demo.com</p>
            <p>admin@company.com | pending@demo.com</p>
            <p className="mt-1">Password: <strong>password</strong></p>
        </div> */}
      </div>
    </div>
    </>
  );
};

export default LoginPage;
