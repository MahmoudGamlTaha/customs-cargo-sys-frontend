import React, { useState } from 'react';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { UsersIcon, DashboardIcon, PaymentIcon, DocumentIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownLeftIcon, ArrowUpRightIcon, UserPhotoPlaceholderIcon, CheckCircleIcon } from '../components/icons';

const MockUIContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="p-4 sm:p-5 h-full w-full bg-gray-100 dark:bg-gray-900 font-sans text-sm scale-[0.8] sm:scale-[0.9] md:scale-100 origin-top-left">
        {children}
    </div>
);

const GuideLoginUI: React.FC = () => {
    const { t } = useLanguage();
    return (
        <MockUIContainer>
            <div className="w-full max-w-xs mx-auto mt-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-center mb-4">{t('login.title')}</h2>
                    <div className="mb-3">
                        <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-1">{t('login.emailLabel')}</label>
                        <div className="shadow-sm appearance-none border rounded w-full py-2 px-3 bg-gray-50 dark:bg-gray-700"></div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-1">{t('login.passwordLabel')}</label>
                        <div className="shadow-sm appearance-none border rounded w-full py-2 px-3 bg-gray-50 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-9 bg-brand-primary hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                        {t('login.loginButton')}
                    </div>
                </div>
            </div>
        </MockUIContainer>
    );
};

const GuideDashboardUI: React.FC = () => {
    const { t } = useLanguage();
    return (
        <MockUIContainer>
             <h2 className="text-2xl font-bold mb-4">{t('memberDashboard.title')}</h2>
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md flex">
                    <div className="w-1/3 bg-gray-50 dark:bg-gray-700 p-2 flex flex-col items-center justify-center rounded-l-lg">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center"><UserPhotoPlaceholderIcon className="w-8 h-8 text-gray-400" /></div>
                    </div>
                    <div className="w-2/3 bg-gradient-to-r from-blue-400 to-blue-600 p-3 flex flex-col justify-center rounded-r-lg">
                        <h3 className="text-white font-bold text-base">{t('data.companies.modern_building')}</h3>
                        <p className="text-white/80 text-xs">{t('memberDashboard.membershipCard.title')}</p>
                    </div>
                </div>
                <div className="w-full sm:w-1/2 grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full text-green-600"><CheckCircleIcon /></div>
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">{t('memberDashboard.completedRequests')}</h4>
                            <p className="font-bold text-lg">5</p>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md flex items-center gap-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-600"><DocumentIcon /></div>
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">{t('memberDashboard.inProgressRequests')}</h4>
                            <p className="font-bold text-lg">2</p>
                        </div>
                    </div>
                </div>
             </div>
        </MockUIContainer>
    );
}

const GuideWalletUI: React.FC = () => {
    const { t } = useLanguage();
    return (
         <MockUIContainer>
            <h2 className="text-2xl font-bold mb-4">{t('wallet.title')}</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{t('wallet.currentBalance')}</h3>
                <p className="text-3xl font-bold text-brand-primary">1575.50 <span className="text-xl">{t('wallet.currency')}</span></p>
            </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-2">{t('wallet.historyTitle')}</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-2">
                            <ArrowDownLeftIcon />
                            <div>
                                <p className="font-semibold">{t('wallet.transactionTypes.top-up')}</p>
                                <p className="text-gray-500">Bank Transfer</p>
                            </div>
                        </div>
                        <p className="font-mono font-bold text-green-600">+2000.00</p>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-2">
                            <ArrowUpRightIcon />
                            <div>
                                <p className="font-semibold">{t('wallet.transactionTypes.payment')}</p>
                                <p className="text-gray-500">{t('data.serviceTypes.origin')}</p>
                            </div>
                        </div>
                        <p className="font-mono font-bold text-red-600">-150.00</p>
                    </div>
                </div>
            </div>
        </MockUIContainer>
    );
}

const GuideServicesUI: React.FC = () => {
    const { t } = useLanguage();
    return (
        <MockUIContainer>
            <h2 className="text-2xl font-bold mb-4">{t('documentServices.title')}</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-2">{t('documentServices.newRequest.title')}</h3>
                <div className="space-y-3">
                     <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('documentServices.newRequest.selectService')}</label>
                        <div className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-right">
                           {t('data.serviceTypes.origin')}
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-600">
                          <div>
                            <p className="font-bold">{t('documentServices.newRequest.fees')}: <span className="text-brand-primary">150.00 {t('wallet.currency')}</span></p>
                          </div>
                          <div className="px-4 py-2 bg-brand-primary text-white font-bold rounded-lg text-xs">
                              {t('documentServices.newRequest.submitButton')}
                          </div>
                      </div>
                </div>
            </div>
        </MockUIContainer>
    )
}

const GuideAIChatUI: React.FC = () => {
    const { t } = useLanguage();
    return (
        <MockUIContainer>
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-bold">{t('aiChat.title')}</div>
                <div className="flex-1 p-3 space-y-3 text-xs">
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-6 h-6 rounded-full bg-brand-secondary flex-shrink-0"></div>
                        <div className="max-w-xs px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            <p>{t('aiChat.initialMessage').substring(0,45)}...</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 justify-end">
                        <div className="max-w-xs px-3 py-1.5 rounded-xl bg-brand-primary text-white">
                            <p>كيف أطلب شهادة منشأ؟</p>
                        </div>
                    </div>
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <div className="flex-1 p-1.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-400 text-xs">
                        {t('aiChat.placeholder')}
                    </div>
                    <div className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs">
                        {t('aiChat.send')}
                    </div>
                </div>
            </div>
        </MockUIContainer>
    );
};


const guideSteps = [
    {
        icon: <UsersIcon />,
        titleKey: 'userGuide.steps.step1.title',
        descriptionKey: 'userGuide.steps.step1.description',
        uiComponent: <GuideLoginUI />
    },
    {
        icon: <DashboardIcon />,
        titleKey: 'userGuide.steps.step2.title',
        descriptionKey: 'userGuide.steps.step2.description',
        uiComponent: <GuideDashboardUI />
    },
    {
        icon: <PaymentIcon />,
        titleKey: 'userGuide.steps.step3.title',
        descriptionKey: 'userGuide.steps.step3.description',
        uiComponent: <GuideWalletUI />
    },
    {
        icon: <DocumentIcon />,
        titleKey: 'userGuide.steps.step4.title',
        descriptionKey: 'userGuide.steps.step4.description',
        uiComponent: <GuideServicesUI />
    },
    {
        icon: <SparklesIcon />,
        titleKey: 'userGuide.steps.step5.title',
        descriptionKey: 'userGuide.steps.step5.description',
        uiComponent: <GuideAIChatUI />
    }
];


const UserGuidePage: React.FC = () => {
    const { t, language } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);

    const handlePrev = () => {
        setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentStep((prev) => (prev < guideSteps?.length - 1 ? prev + 1 : prev));
    };

    const currentGuideStep = guideSteps[currentStep];

    const PrevButtonContent = () => (
        <>
            {language === 'ar' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            <span>{t('userGuide.previous')}</span>
        </>
    );

    const NextButtonContent = () => (
        <>
            <span>{t('userGuide.next')}</span>
            {language === 'ar' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </>
    );
    
    const AnimatedInterface = ({ children }: { children: React.ReactNode }) => (
        <div className="aspect-video w-full rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-2 px-1">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className={`relative w-full h-[calc(100%-1.25rem)] rounded-md bg-white dark:bg-gray-900 overflow-hidden`}>
                 {children}
                 <div className="animated-cursor"></div>
            </div>
        </div>
    );


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('userGuide.title')}</h2>
            </div>

            <Card>
                <div className="p-4 sm:p-6 flex flex-col" style={{ minHeight: '65vh' }}>
                    <div key={currentStep} className="flex-grow flex flex-col md:flex-row items-center gap-8 animate-fade-in">
                        <div className="w-full md:w-1/2 md:order-2">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary">
                                    {currentGuideStep.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t(currentGuideStep.titleKey as any)}</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t(currentGuideStep.descriptionKey as any)}
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 md:order-1">
                            <AnimatedInterface>{currentGuideStep.uiComponent}</AnimatedInterface>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 order-2 sm:order-1">
                            {guideSteps?.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        currentStep === index ? 'bg-brand-primary w-6' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to step ${index + 1}`}
                                />
                            ))}
                        </div>

                        <div className={`flex items-center gap-4 order-1 sm:order-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PrevButtonContent />
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentStep === guideSteps?.length - 1}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <NextButtonContent />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UserGuidePage;