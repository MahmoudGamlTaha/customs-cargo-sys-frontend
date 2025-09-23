import React from "react";

// Extend HTMLAttributes to allow passing standard HTML props like 'id'
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardTitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isClicked?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  cardTitle,
  children,
  className = "",
  actions,
  isClicked = false,
  onClick,
  ...rest
}) => {
  return (
    <div
      {...rest}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md transition-shadow duration-300 
        ${isClicked ? "cursor-pointer hover:shadow-lg" : ""}
        ${className}`}
    >
      <div className="p-4 sm:p-6">
        {cardTitle && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
              {cardTitle}
            </h3>
          </div>
        )}
        <div>{children}</div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default Card;
