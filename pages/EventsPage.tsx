import React from 'react';
import Card from '../components/Card';
import { CalendarDaysIcon } from '../components/icons';
import { Link } from 'react-router-dom';
import { LegacyEvent } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface EventsPageProps {
    events: LegacyEvent[];
}

const EventsPage: React.FC<EventsPageProps> = ({ events }) => {
    const { t } = useLanguage();
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('events.title')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events?.map(event => (
                    <Link to={`/events/${event.id}`} key={event.id} className="block hover:shadow-2xl transition-shadow duration-300 rounded-xl">
                        <Card className="flex flex-col h-full w-full !shadow-none">
                            <div className="h-48 w-full bg-brand-primary text-white flex items-center justify-center rounded-t-xl">
                                <CalendarDaysIcon />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-brand-primary">{t(`data.events.${event.title}` as TranslationKey)}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(event.startDate).toLocaleDateString()} - {t(`data.locations.${event.location.toLowerCase()}` as TranslationKey)}</p>
                                <p className="mt-4 text-gray-700 dark:text-gray-300 flex-1">{t(`data.events.${event.description}` as TranslationKey)}</p>
                                <div className="mt-4">
                                    <button className="w-full bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
                                        {t('events.detailsButton')}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default EventsPage;