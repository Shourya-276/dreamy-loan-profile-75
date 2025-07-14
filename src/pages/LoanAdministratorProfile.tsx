
/**
 * LOAN ADMINISTRATOR PROFILE PAGE
 * 
 * This file contains the profile management page for Loan Administrator users.
 * It allows administrators to view and edit their personal and professional information.
 * 
 * USAGE:
 * - Accessed via route: /loan-administrator-profile
 * - Protected route - only accessible to users with 'loanadministrator' role
 * - Uses LoanAdministratorLayout as the page wrapper
 * - Navigation available from admin sidebar menu
 * 
 * COMPONENTS USED:
 * - LoanAdministratorLayout: Main layout wrapper
 * - ProfilePhotoSection: Profile picture upload component
 * - AdminProfileForm: Form fields for profile data
 * - Card, Button: UI components from shadcn/ui
 * 
 * STATE MANAGEMENT:
 * - Uses React useState for form data management
 * - Centralized state handling for all profile fields
 * - Form validation and submission handling
 * 
 * FUNCTIONALITY:
 * - Profile data input and editing
 * - Form clearing and saving capabilities
 * - Responsive design for different screen sizes
 * 
 * FUTURE ENHANCEMENTS:
 * - Backend integration for data persistence
 * - Form validation and error handling
 * - Success/error notifications
 */

import React, { useState } from "react";
import LoanAdministratorLayout from "../components/LoanAdministratorLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminProfileForm, { AdminProfileFormData } from "../components/profile/AdminProfileForm";
import ProfilePhotoSection from "../components/profile/ProfilePhotoSection";

/**
 * Loan Administrator Profile Management Page
 * Allows administrators to view and edit their personal and professional information
 * Uses modular components for better code organization and reusability
 */
const LoanAdministratorProfile: React.FC = () => {
  /**
   * Form state management for all profile data
   * Centralized state handling for better data consistency
   */
  const [profileFormData, setProfileFormData] = useState<AdminProfileFormData>({
    name: "",
    middleName: "",
    surname: "",
    emailId: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: "",
    employeeCode: "",
    headquarters: "",
    subHeadquarters: ""
  });

  const [bankFormData, setBankFormData] = useState({
    salaryBankAccountName: "",
    branchName: "",
    accountType: "",
    accountNumber: "",
    ifscCode: "",
    panCard: null as File | null,
    aadhaarCard: null as File | null,
    cancelledCheque: null as File | null
  });

  /**
   * Handles input changes for all form fields
   * Updates the corresponding field in the form state
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Clears all form fields to their initial empty state
   * Provides users with a quick way to reset the form
   */
  const handleBankInputChange = (field: string, value: string) => {
    setBankFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setBankFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleClearForm = (): void => {
    setProfileFormData({
      name: "",
      middleName: "",
      surname: "",
      emailId: "",
      mobileNumber: "",
      gender: "",
      dateOfBirth: "",
      employeeCode: "",
      headquarters: "",
      subHeadquarters: ""
    });
    setBankFormData({
      salaryBankAccountName: "",
      branchName: "",
      accountType: "",
      accountNumber: "",
      ifscCode: "",
      panCard: null,
      aadhaarCard: null,
      cancelledCheque: null
    });
  };

  /**
   * Saves the profile data
   * Currently logs the data - can be extended to save to backend
   */
  const handleSaveProfile = (): void => {
    console.log("Saving profile data:", profileFormData);
    // TODO: Implement actual save functionality to backend
  };

  return (
    <LoanAdministratorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        
        <Card className="bg-white dark:bg-gray-800 p-6">
          {/* Profile Photo Upload Section */}
          <ProfilePhotoSection />

          {/* Profile Form Fields */}
          <AdminProfileForm 
            formData={profileFormData}
            onInputChange={handleInputChange}
          />

          {/* Salary Bank Details Section */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Salary Bank Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryBankAccountName">Salary Bank Account Name</Label>
                <Input
                  id="salaryBankAccountName"
                  value={bankFormData.salaryBankAccountName}
                  onChange={(e) => handleBankInputChange("salaryBankAccountName", e.target.value)}
                  placeholder="Enter account holder name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  value={bankFormData.branchName}
                  onChange={(e) => handleBankInputChange("branchName", e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={bankFormData.accountType} onValueChange={(value) => handleBankInputChange("accountType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="number"
                  value={bankFormData.accountNumber}
                  onChange={(e) => handleBankInputChange("accountNumber", e.target.value)}
                  placeholder="Enter account number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={bankFormData.ifscCode}
                  onChange={(e) => handleBankInputChange("ifscCode", e.target.value)}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Document Upload</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="panCard">Upload PAN Card</Label>
                <Input
                  id="panCard"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("panCard", e.target.files?.[0] || null)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aadhaarCard">Upload Aadhaar Card</Label>
                <Input
                  id="aadhaarCard"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("aadhaarCard", e.target.files?.[0] || null)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancelledCheque">Upload Cancelled Cheque / Passbook</Label>
                <Input
                  id="cancelledCheque"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("cancelledCheque", e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Clear and Save */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button variant="outline" onClick={handleClearForm}>
              Clear
            </Button>
            <Button onClick={handleSaveProfile} className="bg-brand-purple hover:bg-brand-purple/90">
              Save
            </Button>
          </div>
        </Card>
      </div>
    </LoanAdministratorLayout>
  );
};

export default LoanAdministratorProfile;
