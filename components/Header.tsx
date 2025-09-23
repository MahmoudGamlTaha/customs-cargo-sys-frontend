import React, { useState, useMemo, useRef, useEffect } from "react";
import { LogoutIcon, ProfileIcon, MenuIcon, SunIcon, MoonIcon } from "./icons";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { MemberProfile } from "@/types";
import { getCurrentUser } from "@/services/authService";
import { GetAllRoles, Role } from "@/services/userService";
import { dataProcessor } from "@/utils/DataProcessor";

interface HeaderProps {
  onLogout: () => void;
  onMenuClick: () => void;
  userName: string;
}

const Header: React.FC<HeaderProps> = ({
  onLogout,
  memberProfile,
  onMenuClick,
  userName,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "ar", name: "العربية", flag: "AR" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);
  console.log(memberProfile, "Membererrr");
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRoleName = useMemo(() => {
    const roleCode = getCurrentUser()?.role;

    // Convert branch_admin to port_manager using DataProcessor
    const processedRoleCode =
      dataProcessor.convertBranchAdminToPortManager(roleCode);

    if (language === "ar") {
      return (
        (roles || [])?.find((res) => res?.code === processedRoleCode)
          ?.name_ar || processedRoleCode
      );
    } else {
      return (
        (roles || [])?.find((res) => res?.code === processedRoleCode)
          ?.name_en || processedRoleCode
      );
    }
  }, [roles, getCurrentUser]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await GetAllRoles();
        if (result.success) {
          setRoles(result.data.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  console.log(getRoleName, "getRoleName");

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700 shrink-0 transition-all duration-300 ease-in-out">
      <div className="flex items-center">
        {/* <button onClick={onMenuClick} className="text-gray-500 focus:outline-none lg:hidden dark:text-gray-400">
          <MenuIcon />
        </button>
        <div className="relative mx-2 hidden md:block">
          <span className="absolute inset-y-0 ltr:left-0 rtl:right-0 flex items-center ltr:pl-3 rtl:pr-3">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <input className="w-48 lg:w-64 py-2 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" type="text" placeholder={t('header.search')} />
        </div> */}
      </div>

      <div className="flex items-center">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={t("header.toggleTheme")}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="flex items-center p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none mx-1"
            aria-label={t("header.toggleLanguage")}
          >
            <span className="text-lg mr-1">{currentLanguage?.flag}</span>
            <span className="text-sm font-medium hidden sm:block">
              {currentLanguage?.name}
            </span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isLanguageDropdownOpen && (
            <div className="absolute right-0 mt-2 w-30 bg-white text-center dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              {languages?.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as "ar" | "en" | "fr");
                    setIsLanguageDropdownOpen(false);
                  }}
                  disabled={lang.code === language}
                  className={`w-full flex items-center px-4 py-2 text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    lang.code === language
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-lg mr-3">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {lang.code === language && (
                    <svg
                      className="w-4 h-4 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center ltr:border-l rtl:border-r border-gray-200 dark:border-gray-700 ltr:pl-4 rtl:pr-4 ltr:ml-4 rtl:mr-4 gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-600 text-white dark:bg-gray-700">
            <ProfileIcon />
          </div>
          <div className="hidden sm:block text-right">
            <p className="font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm">
              {t("header.welcome", { name: userName })}
            </p>
            <p className=" text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm">
              {getRoleName || "" || t("roles.member")}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex ltr:flex-row-reverse items-center mx-2 sm:mx-4 px-3 py-2 text-sm  hover:text-white bg-orange-600 text-white  focus:outline-none focus:ring-2 focus:ring-red-300  dark:hover:text-white dark:hover:bg-red-600 rounded-lg transition-all duration-200 border border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-400"
        >
          <div className="ltr:rotate-180">
            <LogoutIcon />
          </div>

          <span className="hidden sm:inline-block ltr:ml-1 rtl:mr-1 whitespace-nowrap font-medium">
            {t("header.logout")}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
