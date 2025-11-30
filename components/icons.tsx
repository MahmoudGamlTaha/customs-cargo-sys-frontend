import React from "react";

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 1.5,
};

// New Official Logo
export const OfficialLogoIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <img
    src={import.meta.env.VITE_LOGO_PATH}
    alt="Libya Chambers Digital Hub Logo"
    className={className}
  />
);

// White logo for sidebar
export const SidebarLogoIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <img
    src="/gray_customs_long_600x134.png"
    alt="Libya Chambers Digital Hub Logo"
    className={className}
  />
);

export const MessageIcon = () => (
  <svg
    {...iconProps}
    className="w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

export const DashboardIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);

export const UsersIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.241.252-.477.388-.702zM16.5 7.5c0-4.142-3.358-7.5-7.5-7.5S1.5 3.358 1.5 7.5 4.858 15 9 15s7.5-3.358 7.5-7.5z"
    />
  </svg>
);

export const RolesIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {/* Group of users */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.121 17.804A6 6 0 0112 15a6 6 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
    {/* Shield to represent role/protection */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 7.5l-3 1.5-3-1.5-3 1.5v3c0 3.75 2.25 6.75 6 8.25 3.75-1.5 6-4.5 6-8.25v-3l-3-1.5z"
    />
  </svg>
);

export const DocumentIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

export const PaymentIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-5.25H21m-3 2.25H21m-3 2.25H21M4.5 2.25a2.25 2.25 0 00-2.25 2.25v15A2.25 2.25 0 004.5 21.75h15a2.25 2.25 0 002.25-2.25V4.5A2.25 2.25 0 0019.5 2.25h-15z"
    />
  </svg>
);

export const DisputeIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.148 1.867.973 1.867 2.013v4.25c0 1.04-.83 1.865-1.867 2.013A22.5 22.5 0 0112 21.75c-1.148 0-2.278-.08-3.383-.237-1.037-.148-1.867-.973-1.867-2.013v-4.25c0-1.04.83-1.865 1.867-2.013A22.5 22.5 0 0112 12.75z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 12.75c0 .23.02.457.058.681a8.318 8.318 0 004.384 4.384c.224.038.45.058.681.058s.457-.02.681-.058a8.318 8.318 0 004.384-4.384c.038-.224.058-.45.058-.681s-.02-.457-.058-.681a8.318 8.318 0 00-4.384-4.384A8.353 8.353 0 0015 7.5c-2.21 0-4.21.895-5.657 2.343A8.353 8.353 0 007.5 15c0 .23.02.457.058.681a8.318 8.318 0 004.384 4.384c.224.038.45.058.681.058s.457-.02.681-.058a8.318 8.318 0 004.384-4.384c.038-.224.058-.45.058-.681z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 12.75c2.21 0 4.21.895 5.657 2.343"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3.75L20.25 20.25"
    />
  </svg>
);

export const EventsIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z"
    />
  </svg>
);

export const SupportIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
    />
  </svg>
);

export const ElearningIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 14l9-5-9-5-9 5 9 5zm0 0v5.5"
    />
  </svg>
);

export const ProfileIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

export const ReportsIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125-1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125-1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
);

export const B2BIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.228a4.5 4.5 0 00-1.242 7.23 4.5 4.5 0 007.23-1.242M10.5 10.5h.008v.008h-.008V10.5zm.356 2.456l-2.172-2.172m2.172 2.172l2.172-2.172M12 6.75A4.5 4.5 0 117.5 11.25a4.5 4.5 0 014.5-4.5z"
    />
  </svg>
);

export const LogoutIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
    />
  </svg>
);

export const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 6h16M4 12h16m-7 6h7"
    />
  </svg>
);

export const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const BackArrowIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
    />
  </svg>
);

export const QrCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-24 h-24 text-gray-800 dark:text-gray-300"}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 4.5v1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5m6 0v1.5m0-1.5h1.5m0 0h1.5m-1.5 0h-1.5m1.5 0v-1.5m0 9v1.5m0-1.5h-1.5m0 0h-1.5m1.5 0h1.5m-1.5 0v1.5m-6-1.5v1.5m0-1.5h1.5m-1.5 0h-1.5m6-1.5v-1.5m0 0v-1.5m0 1.5h1.5m-1.5 0h-1.5m6 0v-1.5m-1.5 0h1.5m0 0v-1.5m0 1.5h1.5m0 0h1.5m-1.5 0h-1.5M4.5 15v1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5m6-1.5v-1.5m1.5 0v1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5m6 0v-1.5m0 1.5h1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5m1.5 0h1.5m-1.5 0v-1.5M15 4.5v1.5m0-1.5h1.5m-1.5 0h-1.5m-1.5 0v-1.5m0 0h-1.5m6 1.5v1.5m0 0v1.5m0-1.5h-1.5m1.5 0h-1.5m-3-1.5v1.5m0-1.5h-1.5m1.5 0v-1.5M9 9h6v6H9V9z"
    />
  </svg>
);

export const DownloadIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

export const PrintIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
    />
  </svg>
);

export const ChevronDoubleRightIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
    />
  </svg>
);

export const ChevronDoubleLeftIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.75 4.5l-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
    />
  </svg>
);

export const IdCardChipIcon = () => (
  <svg
    className="w-12 h-12"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="64" height="64" rx="10" fill="url(#paint0_linear_11_80)" />
    <path
      d="M22.3999 32H41.5999"
      stroke="#D4AF37"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M32 22.4001L32 41.6001"
      stroke="#D4AF37"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M22.3999 22.4001H27.1999"
      stroke="#D4AF37"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M36.7999 22.4001H41.5999"
      stroke="#D4AF37"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M22.3999 41.6001H27.1999"
      stroke="#D4AF37"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M36.7999 41.6001H41.5999"
      stroke="#D4AF37"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect
      x="27.2"
      y="27.2"
      width="9.6"
      height="9.6"
      stroke="#D4AF3T"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_11_80"
        x1="0"
        y1="0"
        x2="64"
        y2="64"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2D3748" />
        <stop offset="1" stopColor="#1A202C" />
      </linearGradient>
    </defs>
  </svg>
);

export const SunIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export const MoonIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  </svg>
);

export const CheckCircleIcon = ({className}:{className: string}) => (
  <svg
    {...iconProps}
    className={className ? className : "w-6 h-6 text-green-500 hover:text-green-700"}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const XCircleIcon = () => (
  <svg
    {...iconProps}
    className="w-6 h-6 text-red-500 hover:text-red-700"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const PauseCircleIcon = () => (
  <svg
    {...iconProps}
    className="w-6 h-6 text-purple-500 hover:text-purple-700"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const CreditCardIcon = () => (
  <svg
    {...iconProps}
    className="w-12 h-12 text-brand-primary"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-5.25H21m-3 2.25H21m-3 2.25H21M4.5 2.25a2.25 2.25 0 00-2.25 2.25v15A2.25 2.25 0 004.5 21.75h15a2.25 2.25 0 002.25-2.25V4.5A2.25 2.25 0 0019.5 2.25h-15z"
    />
  </svg>
);

export const BankIcon = () => (
  <svg
    {...iconProps}
    className="w-12 h-12 text-brand-primary"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
    />
  </svg>
);

export const PaymentServiceIcon = () => (
  <svg
    {...iconProps}
    className="w-12 h-12 text-brand-primary"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6" />
  </svg>
);

export const CalendarDaysIcon = () => (
  <svg
    className="w-24 h-24"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export const BuildingOfficeIcon = () => (
  <svg
    {...iconProps}
    className="w-6 h-6 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 21h19.5m-18-18h16.5M5.25 3v18m13.5-18v18M9 6.75h6.75M9 12h6.75m-6.75 5.25h6.75M5.25 6h.008v.008H5.25V6zm.75 0h.008v.008H6V6zm.75 0h.008v.008H6.75V6zm.75 0h.008v.008H7.5V6zm.75 0h.008v.008H8.25V6zm.75 0h.008v.008H9V6zm6.75 0h.008v.008h-.008V6zm.75 0h.008v.008h-.008V6zm.75 0h.008v.008h-.008V6zm.75 0h.008v.008h-.008V6z"
    />
  </svg>
);

export const OfficialSealIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={
      className ||
      "w-24 h-24 text-brand-secondary dark:text-yellow-300 opacity-80"
    }
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="0.5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 18.27l5.37 3.33-1.44-6.24 4.8-4.2H15.4L12 5.27 8.6 11.16H3.24l4.8 4.2-1.44 6.24L12 18.27z" />
  </svg>
);

export const ChevronDownIcon = () => (
  <svg
    {...iconProps}
    className="w-5 h-5 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

export const CheckIcon = () => (
  <svg
    {...iconProps}
    className="w-5 h-5 text-brand-primary"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

export const SettingsIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.34 3.94a1.25 1.25 0 0 1 1.16-.69h1a1.25 1.25 0 0 1 1.16.69l.28.56a1.25 1.25 0 0 0 1.2 1.2l.57.1a1.25 1.25 0 0 1 1.07 1.57l-.14.6a1.25 1.25 0 0 0 0 1.34l.14.6a1.25 1.25 0 0 1-1.07 1.57l-.57.1a1.25 1.25 0 0 0-1.2 1.2l-.28.56a1.25 1.25 0 0 1-1.16-.69h-1a1.25 1.25 0 0 1-1.16-.69l-.28-.56a1.25 1.25 0 0 0-1.2-1.2l-.57-.1a1.25 1.25 0 0 1-1.07-1.57l.14-.6a1.25 1.25 0 0 0 0-1.34l-.14-.6a1.25 1.25 0 0 1 1.07-1.57l.57-.1a1.25 1.25 0 0 0 1.2-1.2l.28.56zM12 15.75a3.75 3.75 0 1 0 0-7.5a3.75 3.75 0 0 0 0 7.5z"
    />
  </svg>
);

export const UserPhotoPlaceholderIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const PlayCircleIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
    />
  </svg>
);

export const SparklesIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.502 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456l1.178.398-1.178.398a3.375 3.375 0 00-2.456 2.456z"
    />
  </svg>
);

export const ChevronLeftIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

export const ChevronRightIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

export const ArrowDownLeftIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 4.5l-15 15m0 0v-11.25m0 11.25h11.25"
    />
  </svg>
);

export const ArrowUpRightIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
    />
  </svg>
);

export const WarningIcon = ({ className }: { className: string }) => (
  <svg
    {...iconProps}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
    />
  </svg>
);

export const ArrowLeftIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

export const ArrowRightIcon = () => (
  <svg
    {...iconProps}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);
