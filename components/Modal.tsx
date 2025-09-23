import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | React.ReactNode;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    showCloseButton?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    isLoading,
    onClose,
    title,
    children,
    size = '2xl',
    showCloseButton = true,
    className = '',
    headerClassName = '',
    contentClassName = ''
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => {
                !isLoading && onClose()
            }}>

            </div>

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className={`
                    relative bg-white dark:bg-gray-800 rounded-lg w-full overflow-hidden shadow-xl transform transition-all
                    ${size === 'sm' ? 'max-w-sm' :
                      size === 'md' ? 'max-w-md' :
                      size === 'lg' ? 'max-w-lg' :
                      size === 'xl' ? 'max-w-xl' :
                      size === '2xl' ? 'max-w-2xl' :
                      size === '3xl' ? 'max-w-3xl' :
                      size === '4xl' ? 'max-w-4xl' :
                      size === '5xl' ? 'max-w-5xl' :
                      size === '6xl' ? 'max-w-6xl' :
                      size === '7xl' ? 'max-w-7xl' :
                      'max-w-full mx-4'}
                    ${className}
                `}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                                aria-label="Close modal"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className={`max-h-[80vh] relative overflow-y-auto ${contentClassName}`}>
                        <div className="p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
