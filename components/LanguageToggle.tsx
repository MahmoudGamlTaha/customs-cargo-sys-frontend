import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageToggleProps {
  position?: 'fixed' | 'absolute' | 'relative';
  top?: string;
  left?: string;
  right?: string;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  position = 'fixed',
  top = '20px',
  left,
  right,
  zIndex = 1000,
  className = '',
  style = {}
}) => {
  const { language, setLanguage } = useLanguage();
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

  // Determine position based on language
  const getPosition = () => {
    if (left !== undefined) return { left };
    if (right !== undefined) return { right };
    return language === 'ar' ? { left: '20px' } : { right: '20px' };
  };

  const containerStyle: React.CSSProperties = {
    position,
    top,
    zIndex,
    ...getPosition(),
    ...style
  };

  return (
    <div 
      ref={dropdownRef}
      data-language-button
      className={`language-toggle ${className}`}
      style={{
        ...containerStyle,
        pointerEvents: "auto", // Enable interactions for this component
      }}
    >
      <button 
        data-language-button
        onClick={() => {
          console.log('Language toggle button clicked - toggling dropdown');
          setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
        }}
        onMouseDown={() => console.log('Language toggle mouse down')}
        onMouseUp={() => console.log('Language toggle mouse up')}
        style={{
          pointerEvents: "auto", // Enable interactions for this button
          display: "flex",
          alignItems: "center",
          padding: "10px 15px",
          backgroundColor: "white",
          color: "#1976d2",
          border: "2px solid #1976d2",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          transition: "all 0.3s",
          fontFamily: "'Arial', sans-serif",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#1976d2";
          e.currentTarget.style.color = "white";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.color = "#1976d2";
        }}
      >
        <span style={{ fontSize: "16px", marginRight: "8px" }}>{currentLanguage?.flag}</span>
        <span style={{ marginRight: "8px" }}>{currentLanguage?.name}</span>
        <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isLanguageDropdownOpen && (
        <div
          data-language-dropdown
          style={{
            position: "absolute",
            top: "100%",
            [language === 'ar' ? 'left' : 'right']: "0",
            marginTop: "5px",
            width: "200px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #e0e0e0",
            zIndex: zIndex + 1,
            pointerEvents: "auto", // Enable interactions for dropdown
          }}
        >
          {languages?.map((lang) => (
            <button
              key={lang.code}
              data-language-dropdown
              onClick={() => {
                console.log('Language option clicked:', lang.code, '- changing language');
                setLanguage(lang.code as 'ar' | 'en' | 'fr');
                setIsLanguageDropdownOpen(false);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: language === lang.code ? "#f0f8ff" : "transparent",
                color: language === lang.code ? "#1976d2" : "#333",
                border: "none",
                textAlign: "center",
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "'Arial', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                pointerEvents: "auto", // Enable interactions for this button
              }}
              onMouseOver={(e) => {
                if (language !== lang.code) {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }
              }}
              onMouseOut={(e) => {
                if (language !== lang.code) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "16px", marginRight: "10px" }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
