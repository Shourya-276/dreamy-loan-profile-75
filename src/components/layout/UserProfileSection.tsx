
import React from "react";
import { User, X } from "lucide-react";

interface UserProfileSectionProps {
  isSalesManager: boolean;
  user: any;
  onMobileMenuClose: () => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ 
  isSalesManager, 
  user, 
  onMobileMenuClose 
}) => {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {/* {isSalesManager ? "Amit Thakur" : user?.name || "User"} */}
              {user?.name || "User"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {/* {isSalesManager ? "+91 7588072877 ✓" : user?.email} */}
              {user?.email}
            </p>
            {isSalesManager && (
              <>
                {/* <p className="text-sm text-gray-600 dark:text-gray-400">amitthakur@gmail.com</p> */}
                <p className="text-sm text-green-600 font-medium">Sales Manager - Mumbai ✓</p>
              </>
            )}
          </div>
        </div>
        <button className="lg:hidden" onClick={onMobileMenuClose}>
          <X className="w-6 h-6" />
        </button>
      </div>
      {isSalesManager && (
        <button className="mt-3 text-sm text-brand-purple hover:underline">verify</button>
      )}
    </div>
  );
};

export default UserProfileSection;
