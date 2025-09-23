import React from "react";
import { NavLink } from "react-router-dom";
import { UserRole, Membership } from "../types";
import {
  DashboardIcon,
  UsersIcon,
  DocumentIcon,
  PaymentIcon,
  DisputeIcon,
  EventsIcon,
  SupportIcon,
  ElearningIcon,
  ProfileIcon,
  ReportsIcon,
  B2BIcon,
  CloseIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  SettingsIcon,
  OfficialLogoIcon,
  SidebarLogoIcon,
  PlayCircleIcon,
  BuildingOfficeIcon,
  RolesIcon,
} from "./icons";
import { useLanguage, TranslationKey } from "../contexts/LanguageContext";

interface SidebarProps {
  userRole: UserRole;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  sidebarPositionClass: string;
  mobileSidebarTransform: string;
  membership: Membership | null;
}

type NavLinkItem = {
  to: string;
  labelKey: TranslationKey;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type NavHeaderItem = {
  to: string; // Used as key
  labelKey: TranslationKey;
};

type NavItemType = NavLinkItem | NavHeaderItem;

const staticMemberLinks: NavItemType[] = [
  { to: "/dashboard", labelKey: "sidebar.dashboard", icon: <DashboardIcon /> },
  {
    to: "/apply-membership",
    labelKey: "sidebar.applyMembership",
    icon: <UsersIcon />,
  },
  {
    to: "/document-services",
    labelKey: "sidebar.documentServices",
    icon: <DocumentIcon />,
  },
  { to: "/wallet", labelKey: "sidebar.wallet", icon: <PaymentIcon /> },
  {
    to: "/disputes",
    labelKey: "sidebar.disputeResolution",
    icon: <DisputeIcon />,
  },
  { to: "/events", labelKey: "sidebar.events", icon: <EventsIcon /> },
  { to: "/support", labelKey: "sidebar.support", icon: <SupportIcon /> },
  // { to: '/user-guide', labelKey: 'sidebar.userGuide', icon: <PlayCircleIcon /> }, // Hidden
  { to: "/elearning", labelKey: "sidebar.elearning", icon: <ElearningIcon /> },
  {
    to: "/b2b-networking",
    labelKey: "sidebar.b2bNetworking",
    icon: <B2BIcon />,
  },
  { to: "/profile", labelKey: "sidebar.profile", icon: <ProfileIcon /> },
];

const staffLinks: NavItemType[] = [
  { to: "/dashboard", labelKey: "sidebar.dashboard", icon: <DashboardIcon /> },
  { to: "staff_header", labelKey: "sidebar.managementAndOperations" },
  {
    to: "/staff/documents",
    labelKey: "sidebar.documentRequests",
    icon: <DocumentIcon />,
  },
  { to: "profile_header", labelKey: "sidebar.account" },
  { to: "/profile", labelKey: "sidebar.profile", icon: <ProfileIcon /> },
  // { to: '/user-guide', labelKey: 'sidebar.userGuide', icon: <PlayCircleIcon /> }, // Hidden
];

const accountantLinks: NavItemType[] = [
  { to: "/dashboard", labelKey: "sidebar.dashboard", icon: <DashboardIcon /> },
  { to: "staff_header", labelKey: "sidebar.managementAndOperations" },
  {
    to: "/staff/documents",
    labelKey: "sidebar.documentRequests",
    icon: <DocumentIcon />,
  },
  { to: "profile_header", labelKey: "sidebar.account" },
  { to: "/profile", labelKey: "sidebar.profile", icon: <ProfileIcon /> },
  // { to: '/user-guide', labelKey: 'sidebar.userGuide', icon: <PlayCircleIcon /> }, // Hidden
];

const auditorLinks: NavItemType[] = [
  { to: "/dashboard", labelKey: "sidebar.dashboard", icon: <DashboardIcon /> },
  { to: "staff_header", labelKey: "sidebar.managementAndOperations" },
  {
    to: "/staff/documents",
    labelKey: "sidebar.documentRequests",
    icon: <DocumentIcon />,
  },
  { to: "profile_header", labelKey: "sidebar.account" },
  { to: "/profile", labelKey: "sidebar.profile", icon: <ProfileIcon /> },
  // { to: '/user-guide', labelKey: 'sidebar.userGuide', icon: <PlayCircleIcon /> }, // Hidden
];
4;
const adminLinks: NavItemType[] = [
  { to: "/dashboard", labelKey: "sidebar.dashboard", icon: <DashboardIcon /> },
  { to: "admin_header", labelKey: "sidebar.systemManagement" },
  { to: "/admin/roles", labelKey: "sidebar.manageRoles", icon: <RolesIcon /> },
  { to: "/admin/users", labelKey: "sidebar.manageUsers", icon: <UsersIcon /> },
  {
    to: "/admin/branches",
    labelKey: "sidebar.manageBranches",
    icon: <BuildingOfficeIcon />,
  },
  // { to: '/admin/certificate-types', labelKey: 'sidebar.certificateTypes', icon: <DocumentIcon /> },
  // { to: '/admin/finances', labelKey: 'sidebar.financialReports', icon: <PaymentIcon /> },
  // { to: '/bi-reports', labelKey: 'sidebar.biReports', icon: <ReportsIcon /> },
  // { to: '/admin/settings', labelKey: 'sidebar.systemSettings', icon: <SettingsIcon /> },
  { to: "staff_header", labelKey: "sidebar.staffSupervision" },
  // { to: '/staff/memberships', labelKey: 'sidebar.membershipRequests', icon: <UsersIcon /> },
  {
    to: "/staff/documents",
    labelKey: "sidebar.documentRequests",
    icon: <DocumentIcon />,
  },
  {
    to: "/admin/inquiries",
    labelKey: "sidebar.inquiryLog",
    icon: <DocumentIcon />,
  },
  // { to: '/staff/wallet', labelKey: 'sidebar.confirmPayments', icon: <PaymentIcon /> },
  { to: "profile_header", labelKey: "sidebar.account" },
  { to: "/profile", labelKey: "sidebar.profile", icon: <ProfileIcon /> },
  // { to: '/user-guide', labelKey: 'sidebar.userGuide', icon: <PlayCircleIcon /> }, // Hidden
];

const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  sidebarPositionClass,
  mobileSidebarTransform,
  membership,
}) => {
  console.log("Sidebar userRole:", userRole);
  const { t, language } = useLanguage();

  // Add custom scrollbar styles
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #d1d5db #374151;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #e5e7eb;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  let links: NavItemType[] = [];

  if (userRole === UserRole.Member) {
    const membershipStatus = membership?.status;
    links = staticMemberLinks
      ?.map((link) => {
        if (link.to === "/apply-membership") {
          if (membershipStatus === "approved") {
            return null; // Hide the link if approved
          }
          if (
            membershipStatus === "pending" ||
            membershipStatus === "on_hold"
          ) {
            return {
              ...link,
              labelKey: "sidebar.membershipPending",
              disabled: true,
            };
          }
          if (membershipStatus === "rejected") {
            return { ...link, labelKey: "sidebar.reapplyMembership" };
          }
        }
        return link;
      })
      .filter((link): link is NavItemType => link !== null);
  } else if (userRole === UserRole.Staff || userRole === UserRole.BranchAdmin) {
    links = staffLinks;
  } else if (userRole === UserRole.Accountant) {
    links = accountantLinks;
  } else if (userRole === UserRole.Auditor) {
    links = auditorLinks;
  } else if (userRole === UserRole.Admin) {
    links = adminLinks;
  }

  const NavItem: React.FC<{ item: NavItemType }> = ({ item }) => {
    const label = t(item.labelKey);
    if ("icon" in item) {
      // This is a link
      const linkClasses = `flex items-center py-2 my-0.5 transition-colors duration-200 transform rounded-lg ${
        isCollapsed ? "justify-center px-2" : "px-3"
      }`;

      if (item.disabled) {
        return (
          <div
            title={isCollapsed ? label : undefined}
            className={`${linkClasses} text-gray-500 cursor-not-allowed`}
          >
            {item.icon}
            <span
              className={`mx-3 font-medium whitespace-nowrap overflow-hidden ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              {label}
            </span>
          </div>
        );
      }

      return (
        <NavLink
          to={item.to}
          title={isCollapsed ? label : undefined}
          className={({ isActive }) =>
            `${linkClasses} ${
              isActive
                ? "bg-brand-primary text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`
          }
          onClick={() => setIsMobileOpen(false)}
        >
          {item.icon}
          <span
            className={`mx-3 font-medium whitespace-nowrap overflow-hidden ${
              isCollapsed ? "lg:hidden" : ""
            }`}
          >
            {label}
          </span>
        </NavLink>
      );
    }
    // This is a header
    return (
      <h3
        className={`px-3 mt-4 mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase ${
          isCollapsed ? "lg:hidden" : ""
        }`}
      >
        {label}
      </h3>
    );
  };

  const sidebarContainerClasses = `
    bg-gray-800 text-white dark:bg-gray-700/95 flex flex-col justify-between transition-all duration-300 ease-in-out backdrop-blur-sm
    fixed inset-y-0 ${sidebarPositionClass} z-30
    transform lg:transform-none
    ${mobileSidebarTransform}
    ${isCollapsed ? "w-16" : "w-56"}
  `;

  return (
    <>
      <div className={sidebarContainerClasses}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 h-[60px] border-b border-gray-700 flex-shrink-0">
            <div
              className={`overflow-hidden ${isCollapsed ? "lg:hidden" : ""}`}
            >
              <SidebarLogoIcon className="h-10 w-auto" />
            </div>
            <button
              className="text-gray-400 hover:text-white lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto mt-2 px-2 pb-4 custom-scrollbar">
            {links?.map((link) => (
              <NavItem key={link.to} item={link} />
            ))}
          </nav>
        </div>

        {/* --- Desktop toggle button --- */}
        <div className="hidden lg:flex justify-center items-center p-4 border-t border-gray-700 dark:border-gray-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
            aria-label={t(isCollapsed ? "sidebar.expand" : "sidebar.collapse")}
          >
            {isCollapsed ? (
              language === "ar" ? (
                <ChevronDoubleLeftIcon />
              ) : (
                <ChevronDoubleRightIcon />
              )
            ) : language === "ar" ? (
              <ChevronDoubleRightIcon />
            ) : (
              <ChevronDoubleLeftIcon />
            )}
          </button>
        </div>
      </div>

      {/* --- Mobile Overlay --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
