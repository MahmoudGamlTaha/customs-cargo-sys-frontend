import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface BackButtonProps {
  position?: 'fixed' | 'absolute' | 'relative';
  top?: string;
  left?: string;
  right?: string;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  targetPath?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  position = 'fixed',
  top = '20px',
  left,
  right,
  zIndex = 1000,
  className = '',
  style = {},
  targetPath = '/login'
}) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // Determine position based on language
  const getPosition = () => {
    if (left !== undefined) return { left };
    if (right !== undefined) return { right };
    return language === 'ar' ? { right: '20px' } : { left: '20px' };
  };

  const containerStyle: React.CSSProperties = {
    position,
    top,
    zIndex,
    ...getPosition(),
    ...style
  };

  const handleBackClick = () => {
    navigate(targetPath);
  };

  return (
    <button
      onClick={handleBackClick}
      className={`back-button ${className}`}
      data-back-button="true"
      style={{
        ...containerStyle,
        display: "flex",
        alignItems: "center",
        padding: "10px 15px",
        backgroundColor: "white",
        color: "#dc3545",
        // border: "2px solid #dc3545",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "all 0.3s",
        fontFamily: "'Arial', sans-serif",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#dc3545";
        e.currentTarget.style.color = "white";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "white";
        e.currentTarget.style.color = "#dc3545";
      }}
    >
      <svg 
        style={{ 
          width: "16px", 
          height: "16px", 
          marginRight: language === 'ar' ? "0" : "8px",
          marginLeft: language === 'ar' ? "8px" : "0"
        }} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
        />
      </svg>
      <span>{t('backButton.text')}</span>
    </button>
  );
};

export default BackButton;