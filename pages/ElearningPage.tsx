import React, { useState } from 'react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

interface ElearningPageProps {
    courses: Course[];
    onContinueCourse: (courseId: string) => void;
}

const CourseCard: React.FC<{ course: Course, onContinue: (id: string) => void }> = ({ course, onContinue }) => {
    const { t } = useLanguage();
    const [status, setStatus] = useState('');
    
    const handleContinue = () => {
        onContinue(course.id);
        setStatus('loading');
        setTimeout(() => {
            setStatus('');
        }, 500); // Shorter timeout for better UX
    }
    
    const getButtonText = () => {
        if (status === 'loading') return t('elearning.course.loading');
        return t('elearning.course.continue');
    }

    return (
        <Card>
            <h4 className="font-bold text-brand-primary">{t(`data.courses.${course.title}` as TranslationKey)}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('elearning.course.instructor')}: {course.instructor}</p>
            <div className="mt-4">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">{t('elearning.course.progress')}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-brand-secondary h-2.5 rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                </div>
            </div>
             {course.progress === 100 ? (
                <Link to={`/course-certificate/${course.id}`} className="block text-center mt-4 w-full bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
                    {t('elearning.course.viewCertificate')}
                </Link>
             ) : (
                <button 
                    onClick={handleContinue}
                    className="mt-4 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-70"
                    disabled={!!status}
                >
                    {getButtonText()}
                </button>
             )}
        </Card>
    )
}

const ElearningPage: React.FC<ElearningPageProps> = ({ courses, onContinueCourse }) => {
    const { t } = useLanguage();
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('elearning.title')}</h2>
            </div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">{t('elearning.myCourses')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses?.map(course => <CourseCard key={course.id} course={course} onContinue={onContinueCourse} />)}
                </div>
            </div>

             <div>
                <h3 className="text-xl font-semibold mb-3">{t('elearning.availableCourses')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('elearning.noNewCourses')}</p>
            </div>
        </div>
    );
};

export default ElearningPage;