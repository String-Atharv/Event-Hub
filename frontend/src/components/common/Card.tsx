import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div
      className={`bg-white dark:bg-netflix-dark rounded-lg shadow-md p-4 sm:p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
