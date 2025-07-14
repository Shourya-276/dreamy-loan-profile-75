
import React from "react";
import { Link } from "react-router-dom";

interface NavigationLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ to, icon: Icon, children, isActive = false }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? "bg-brand-purple text-white"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{children}</span>
  </Link>
);

export default NavigationLink;
