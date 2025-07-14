
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { User, Home, FileText, DollarSign, CheckSquare, LogOut, HelpCircle, CreditCard, Star, Search } from "lucide-react";
import NavigationLink from "./layout/NavigationLink";
import UserProfileSection from "./layout/UserProfileSection";
import SalesManagerNavigation from "./layout/SalesManagerNavigation";
import HeaderSection from "./layout/HeaderSection";
import ChatWidget from "./ChatWidget";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isCurrentRoute = (path: string): boolean => location.pathname === path;
  const handleMobileMenuClose = (): void => setIsMobileMenuOpen(false);

  // Check if user is sales manager
  const isSalesManager = user?.role === 'salesmanager';

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex w-full">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* User Profile Section */}
        <UserProfileSection 
          isSalesManager={isSalesManager}
          user={user}
          onMobileMenuClose={handleMobileMenuClose}
        />

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Sales Manager Navigation */}
          {isSalesManager ? (
            <>
              <NavigationLink
                to="/dashboard"
                icon={Home}
                isActive={isCurrentRoute("/dashboard") || isCurrentRoute("/")}
              >
                Home
              </NavigationLink>
              <NavigationLink
                to="/profile"
                icon={User}
                isActive={isCurrentRoute("/profile")}
              >
                My Profile
              </NavigationLink>
              <NavigationLink
                to="/check-eligibility"
                icon={CheckSquare}
                isActive={isCurrentRoute("/check-eligibility")}
              >
                Check Eligibility
              </NavigationLink>
              <NavigationLink
                to="/sales-manager-loan-offers"
                icon={DollarSign}
                isActive={isCurrentRoute("/sales-manager-loan-offers")}
              >
                Explore Loan Offers
              </NavigationLink>
              <NavigationLink
                to="/document"
                icon={FileText}
                isActive={isCurrentRoute("/document")}
              >
                Document
              </NavigationLink>
              <SalesManagerNavigation isCurrentRoute={isCurrentRoute} />
            </>
          ) : (
            <>
              {/* Customer Navigation - Complete 10 items */}
              <NavigationLink
                to="/dashboard"
                icon={Home}
                isActive={isCurrentRoute("/dashboard") || isCurrentRoute("/")}
              >
                Home
              </NavigationLink>
              <NavigationLink
                to="/profile"
                icon={User}
                isActive={isCurrentRoute("/profile")}
              >
                My Profile
              </NavigationLink>
              <NavigationLink
                to="/check-cibil"
                icon={CreditCard}
                isActive={isCurrentRoute("/check-cibil")}
              >
                Check CIBIL
              </NavigationLink>
              <NavigationLink
                to="/check-eligibility"
                icon={CheckSquare}
                isActive={isCurrentRoute("/check-eligibility")}
              >
                Check Eligibility
              </NavigationLink>
              <NavigationLink
                to="/explore-loan-offers"
                icon={Search}
                isActive={isCurrentRoute("/explore-loan-offers")}
              >
                Explore loan offers
              </NavigationLink>
              <NavigationLink
                to="/my-loan-applications"
                icon={FileText}
                isActive={isCurrentRoute("/my-loan-applications")}
              >
                My Loan Applications
              </NavigationLink>
              <NavigationLink
                to="/document"
                icon={FileText}
                isActive={isCurrentRoute("/document")}
              >
                Documents
              </NavigationLink>
              <NavigationLink
                to="/apply-loan"
                icon={FileText}
                isActive={isCurrentRoute("/apply-loan")}
              >
                Forms and Letters
              </NavigationLink>
              <NavigationLink
                to="/disbursement"
                icon={DollarSign}
                isActive={isCurrentRoute("/disbursement")}
              >
                Disbursement
              </NavigationLink>
              <NavigationLink
                to="/review"
                icon={Star}
                isActive={isCurrentRoute("/review")}
              >
                Review
              </NavigationLink>
            </>
          )}
        </nav>

        {/* Bottom Navigation */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <HeaderSection 
          onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <div className="flex-1 flex">
          <main className="flex-1 p-6">
            {children}
          </main>
          
          {/* ChatWidget - Always visible for default users and sales managers on dashboard */}
          {(!isSalesManager || (isSalesManager && (isCurrentRoute("/dashboard") || isCurrentRoute("/")))) && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 h-screen sticky top-0">
              <ChatWidget isOpen={true} setIsOpen={() => {}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
