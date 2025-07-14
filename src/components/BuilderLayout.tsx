
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, Building, DollarSign, BarChart3, CheckSquare, Menu, X, BellDot, Users, FolderOpen, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        active ? "bg-brand-purple text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      onClick={onClick}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
};

interface BuilderLayoutProps {
  children: React.ReactNode;
}

const BuilderLayout: React.FC<BuilderLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Sample notifications
  const notifications = [
    { id: 1, message: "New lead approved", time: "1 hour ago", read: false },
    { id: 2, message: "Document verification completed", time: "3 hours ago", read: false },
    { id: 3, message: "Loan application updated", time: "Yesterday", read: true },
  ];

  const navLinks = [
    {
      to: "/builder-dashboard",
      icon: <Home size={18} />,
      label: "Home",
      active: location.pathname === "/builder-dashboard",
    },
    {
      to: "/builder-profile",
      icon: <User size={18} />,
      label: "My Profile",
      active: location.pathname === "/builder-profile",
    },
    {
      to: "/builder-leads",
      icon: <Users size={18} />,
      label: "Leads",
      active: location.pathname === "/builder-leads",
    },
    {
      to: "/builder-projects",
      icon: <FolderOpen size={18} />,
      label: "Projects",
      active: location.pathname === "/builder-projects",
    },
    {
      to: "/builder-loan-status",
      icon: <FileText size={18} />,
      label: "Loan Status",
      active: location.pathname === "/builder-loan-status",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow py-3 px-4 md:px-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" className="md:hidden mr-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            <Link to="/builder-dashboard" className="flex items-center">
              <img 
                src="src\assets\images\logo.png" 
                alt="Loan for India" 
                className="h-10"
              />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 w-96">
              <input 
                type="text" 
                placeholder="Search information" 
                className="bg-transparent outline-none flex-1 text-sm"
              />
              <button className="text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellDot className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-medium border-b">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className={`p-3 ${!notification.read ? 'bg-blue-50 dark:bg-gray-700/50' : ''}`}>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm">{notification.message}</div>
                        <div className="text-xs text-gray-500">{notification.time}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={toggleTheme}>
              {theme === "light" ? 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg> :
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            </div>
            
            {user && (
              <div className="cursor-pointer">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow">
          {user && (
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <p className="text-xs text-brand-purple">Builder</p>
                </div>
              </div>
            </div>
          )}
          
          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                active={link.active}
              />
            ))}
          </nav>
          
          {/* Removed AI Loan Assistant button for aman@builder.com */}
          
          {user && (
            <div className="p-4 border-t dark:border-gray-700">
              <button 
                className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                onClick={logout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </aside>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/40" onClick={closeMobileMenu} />
            <div className="fixed top-0 left-0 bottom-0 w-[75%] max-w-sm bg-white dark:bg-gray-800 shadow-xl flex flex-col">
              {user && (
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-brand-purple">Builder</p>
                    </div>
                  </div>
                </div>
              )}
              
              <nav className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    active={link.active}
                    onClick={closeMobileMenu}
                  />
                ))}
              </nav>
              
              {/* Removed AI Loan Assistant button for mobile as well */}
              
              {user && (
                <div className="p-4 border-t dark:border-gray-700">
                  <button 
                    className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BuilderLayout;
