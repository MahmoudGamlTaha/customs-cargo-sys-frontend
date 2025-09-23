
import React, { useState, useEffect } from 'react';
import { UserRole, MemberProfile, Membership } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  userRole: UserRole;
  onLogout: () => void;
  children: React.ReactNode;
  memberProfile: MemberProfile;
  membership: Membership | null;
}

const Layout: React.FC<LayoutProps> = ({ userRole, onLogout, children, memberProfile, membership }) => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { language } = useLanguage();

  const isRTL = language === 'ar';
  const sidebarPositionClass = isRTL ? 'right-0' : 'left-0';
  const mobileSidebarTransform = isRTL 
    ? (isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full')
    : (isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full');

  const mainContentMarginClass = isSidebarCollapsed ? 'lg:mr-16' : 'lg:mr-56';
  const mainContentMarginClassLtr = isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56';
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="flex h-full">
          <Sidebar
            userRole={userRole}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            sidebarPositionClass={sidebarPositionClass}
            mobileSidebarTransform={mobileSidebarTransform}
            membership={membership}
          />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isRTL ? mainContentMarginClass : mainContentMarginClassLtr}`}>
            <Header 
              onLogout={onLogout} 
              onMenuClick={() => setMobileSidebarOpen(true)}
              userName={isRTL ? memberProfile.nameAr : memberProfile.nameEn}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
              <div className="container mx-auto p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </main>
            <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
