import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import { Event as EventType, LegacyEvent } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface EventDetailsProps {
    events: LegacyEvent[];
    onRegister: (event: EventType) => Promise<boolean>;
    balance: number;
}

const EventDetailsPage: React.FC<EventDetailsProps> = ({ events, onRegister, balance }) => {
    const { id } = useParams();
    const { t } = useLanguage();
    const event = events.find(e => e.id === id);

    if (!event) {
        return (
             <div>
                <Card><p className="p-8 text-center text-red-600">{t('events.notFound')}</p></Card>
             </div>
        );
    }

    const handleRegisterClick = () => {
        onRegister(event);
    }
    
    const canRegister = !event.isRegistered && balance >= event.fee;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('eventDetails.title')}</h2>
            </div>
            <Card cardTitle={t(`data.events.${event.title}` as TranslationKey)}>
                <div className="p-6">
                    <p><strong>{t('eventDetails.date')}:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                    <p><strong>{t('eventDetails.location')}:</strong> {t(`data.locations.${event.location.toLowerCase()}` as TranslationKey)}</p>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">{t(`data.events.${event.description}` as TranslationKey)}</p>
                     <p className="mt-6 font-bold text-brand-secondary">{t('eventDetails.fees')}: {event.fee.toFixed(2)} {t('wallet.currency')}</p>
                     {!event.isRegistered && balance < event.fee && (
                        <p className="text-red-600 dark:text-red-400 text-sm">
                            {t('wallet.insufficientFundsShort')} <Link to="/wallet" className="font-bold underline">{t('wallet.topUpLink')}</Link>
                        </p>
                     )}
                    <p className="mt-6 text-gray-700 dark:text-gray-300">{t('eventDetails.placeholder')}</p>
                     <div className="mt-8 flex justify-end items-center">
                        {event.isRegistered ? (
                            <p className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg">{t('eventDetails.registered')}</p>
                        ) : (
                            <button 
                                onClick={handleRegisterClick}
                                className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!canRegister}
                            >
                                {t('eventDetails.registerButton')}
                            </button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EventDetailsPage;