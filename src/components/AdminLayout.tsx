
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { User, Home, Settings, LogOut, FileText, BarChart, CheckSquare } from "lucide-react";
import NavigationLink from "./layout/NavigationLink";
import HeaderSection from "./layout/HeaderSection";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isCurrentRoute = (path: string): boolean => location.pathname === path;
  const handleMobileMenuClose = (): void => setIsMobileMenuOpen(false);

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
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Admin</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">+91 7588072877</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">amitthakur@gmail.com</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Admin - Mumbai</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <NavigationLink
            to="/admin-dashboard"
            icon={Home}
            isActive={isCurrentRoute("/admin-dashboard")}
          >
            Home
          </NavigationLink>
          <NavigationLink
            to="/admin-profile"
            icon={User}
            isActive={isCurrentRoute("/admin-profile")}
          >
            My Profile
          </NavigationLink>
          <NavigationLink
            to="/admin-masters"
            icon={Settings}
            isActive={isCurrentRoute("/admin-masters")}
          >
            Masters
          </NavigationLink>
          <NavigationLink
            to="/admin-invoice"
            icon={FileText}
            isActive={isCurrentRoute("/admin-invoice")}
          >
            Invoice
          </NavigationLink>
          <NavigationLink
            to="/admin-report"
            icon={BarChart}
            isActive={isCurrentRoute("/admin-report")}
          >
            Report
          </NavigationLink>
          <NavigationLink
            to="/admin-approvals"
            icon={CheckSquare}
            isActive={isCurrentRoute("/admin-approvals")}
          >
            Approvals
          </NavigationLink>
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
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

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
