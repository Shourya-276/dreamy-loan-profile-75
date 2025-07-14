
/**
 * LOAN ADMINISTRATOR LAYOUT COMPONENT
 * 
 * This file defines the main layout wrapper for all Loan Administrator dashboard pages.
 * It provides a consistent navigation structure, header, and content area for admin users.
 * 
 * USAGE:
 * - Imported and used by all Loan Administrator pages as a wrapper component
 * - Used in: LoanAdministratorDashboard.tsx, LoanAdministratorProfile.tsx, 
 *   LoanAdministratorBankSanctions.tsx, LoanAdministratorDisbursement.tsx,
 *   LoanAdministratorDocument.tsx, LoanAdministratorReports.tsx, LoanAdministratorTasks.tsx
 * 
 * KEY FEATURES:
 * - Responsive sidebar navigation with mobile menu support
 * - User profile section with verification status display
 * - Search functionality in the header
 * - Theme toggle and notification support
 * - Role-based navigation menu items
 * 
 * DEPENDENCIES:
 * - Uses AuthContext for user authentication and logout functionality
 * - Uses ThemeContext for dark/light mode toggling
 * - Integrates with React Router for navigation
 * - Uses Lucide React icons for UI elements
 * - Styled with Tailwind CSS for responsive design
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Search, Bell, Settings, Menu, X, User, Home, FileText, DollarSign, BarChart, CheckSquare, Building2, LogOut, HelpCircle } from "lucide-react";

interface LoanAdministratorLayoutProps {
  children: React.ReactNode;
}

interface NavigationLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
}

interface NavigationItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

/**
 * Custom navigation link component for the sidebar
 * Handles active state styling and icon display
 */
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

/**
 * Main layout component for Loan Administrator dashboard
 * Provides consistent navigation, header, and content structure across all admin pages
 * Features responsive design with mobile-friendly collapsible sidebar
 */
const LoanAdministratorLayout: React.FC<LoanAdministratorLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Determines if the current route matches the provided path
   * Used for highlighting active navigation items
   */
  const isCurrentRoute = (path: string): boolean => location.pathname === path;

  /**
   * Closes the mobile menu when navigation occurs
   * Improves mobile user experience
   */
  const handleMobileMenuClose = (): void => setIsMobileMenuOpen(false);

  /**
   * Navigation configuration for the sidebar
   * Centralized menu structure for easy maintenance
   */
  const navigationItems: NavigationItem[] = [
    { to: "/loan-administrator-dashboard", icon: Home, label: "Home" },
    { to: "/loan-administrator-profile", icon: User, label: "My Profile" },
    { to: "/loan-administrator-bank-sanctions", icon: Building2, label: "Bank Sanctions" },
    { to: "/loan-administrator-disbursement", icon: DollarSign, label: "Disbursement" },
    { to: "/loan-administrator-document", icon: FileText, label: "Document" },
    { to: "/loan-administrator-reports", icon: BarChart, label: "Report" },
    { to: "/loan-administrator-tasks", icon: CheckSquare, label: "Task" },
  ];

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex w-full">
      {/* Mobile Menu Overlay - Dark backdrop for mobile navigation */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* User Profile Section - Displays admin info and verification status */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">John MK</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">+91 7588072877 ✓</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">johnmk102@gmail.com</p>
                <p className="text-sm text-green-600 font-medium">Loan Administrator ✓</p>
              </div>
            </div>
            {/* Mobile menu close button */}
            <button className="lg:hidden" onClick={handleMobileMenuClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <button className="mt-3 text-sm text-brand-purple hover:underline">verify</button>
        </div>

        {/* Main Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavigationLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              isActive={isCurrentRoute(item.to)}
            >
              {item.label}
            </NavigationLink>
          ))}
        </nav>

        {/* Bottom Navigation - FAQ and Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <NavigationLink to="/faq" icon={HelpCircle}>
            FAQ
          </NavigationLink>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header Navigation Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left section - Mobile menu trigger and logo */}
              <div className="flex items-center space-x-4">
                <button
                  className="lg:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <img 
                  src="/lovable-uploads/75bc211c-a5f5-400d-8e31-d21743e7c871.png"
                  alt="Loan for India"
                  className="h-8"
                />
              </div>

              {/* Center section - Search functionality */}
              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search information"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>
              </div>

              {/* Right section - Theme toggle, notifications, and user avatar */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container - Full width responsive design */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LoanAdministratorLayout;
