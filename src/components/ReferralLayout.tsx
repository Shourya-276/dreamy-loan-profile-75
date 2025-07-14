
/**
 * REFERRAL LAYOUT COMPONENT
 * 
 * This component provides the main layout structure for the referral dashboard.
 * It includes the header, sidebar navigation, and main content area designed
 * to match the reference images exactly.
 * 
 * USAGE:
 * - Used exclusively by ReferralDashboard.tsx
 * - Wraps all referral dashboard content
 * - Provides navigation between different tabs
 * 
 * FEATURES:
 * - Sidebar with user info and navigation menu
 * - Header with search functionality and user actions
 * - Responsive design matching the reference images
 * - Tab-based navigation system
 */

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Home, Users, DollarSign, FileText, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReferralLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ReferralLayout: React.FC<ReferralLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const lastLoggedIn = localStorage.getItem("lastLoggedIn");

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "profile", label: "My Profile", icon: User },
    { id: "leads", label: "View Leads", icon: Users },
    { id: "payout", label: "Payout Summary", icon: DollarSign },
    { id: "invoice", label: "Invoice", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex w-full">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-gray-800 shadow-lg flex flex-col border-r border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <img 
            src="/lovable-uploads/75bc211c-a5f5-400d-8e31-d21743e7c871.png"
            alt="Loan for India"
            className="h-12 max-w-fit"
          />
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold">
              R
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Referral</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              +91 7588072877 <span className="text-green-500">●</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">amitthakur@gmail.com</div>
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-300">Referral - Mumbai</span>
              <span className="text-green-500 ml-2">●</span>
            </div>
            <Button variant="outline" size="sm" className="text-xs mt-2 border-gray-300 dark:border-gray-600">
              verify
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-brand-purple text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search information"
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
              <Bell className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name || "Referral User"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || "amitthakur@gmail.com"}</p>
                </div>
                <DropdownMenuItem disabled className="text-xs text-gray-500 dark:text-gray-400 px-3 cursor-default">
                  Last logged in: {lastLoggedIn ? formatTimestamp(lastLoggedIn) : "Just now"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 hover:bg-red-100 dark:hover:bg-red-800 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ReferralLayout;
