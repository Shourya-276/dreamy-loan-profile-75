
/**
 * ADMIN PROFILE FORM COMPONENT
 * 
 * This file contains a reusable form component for administrator profile management.
 * It handles all form fields required for admin personal and professional information.
 * 
 * USAGE:
 * - Imported and used in: LoanAdministratorProfile.tsx
 * - Receives form data and change handlers as props
 * - Separated from the main profile page for better code organization
 * 
 * FORM SECTIONS:
 * - Personal Information: Name, middle name, surname
 * - Contact Information: Email and mobile number
 * - Personal Details: Gender, date of birth, employee code
 * - Work Location: Headquarters and sub-headquarters selection
 * 
 * EXPORTS:
 * - AdminProfileForm: Main form component
 * - AdminProfileFormData: TypeScript interface for form data structure
 * 
 * DEPENDENCIES:
 * - Uses shadcn/ui Input and Label components for consistent styling
 * - Styled with Tailwind CSS for responsive layout
 * - Follows existing form patterns from customer-facing forms
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Interface for administrator profile form data
 * Defines all the fields required for admin profile management
 */
interface AdminProfileFormData {
  name: string;
  middleName: string;
  surname: string;
  emailId: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth: string;
  employeeCode: string;
  headquarters: string;
  subHeadquarters: string;
}

interface AdminProfileFormProps {
  formData: AdminProfileFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Reusable form component for administrator profile management
 * Handles all form fields with proper validation and styling
 * Separated from the main profile page for better maintainability
 */
const AdminProfileForm: React.FC<AdminProfileFormProps> = ({ formData, onInputChange }) => {
  /**
   * Gender options for the dropdown
   * Centralized configuration for easy maintenance
   */
  const genderOptions = [
    { value: "", label: "Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  /**
   * Headquarters options for location selection
   * Can be easily extended or modified as needed
   */
  const headquartersOptions = [
    { value: "", label: "Headquarters" },
    { value: "mumbai", label: "Mumbai" },
    { value: "delhi", label: "Delhi" },
    { value: "bangalore", label: "Bangalore" },
    { value: "hyderabad", label: "Hyderabad" }
  ];

  /**
   * Sub-headquarters options based on main headquarters
   * Currently static but can be made dynamic based on headquarters selection
   */
  const reportingOfficeOptions = [
    { value: "", label: "Reporting Office" },
    { value: "andheri", label: "Andheri" },
    { value: "bandra", label: "Bandra" },
    { value: "thane", label: "Thane" },
    { value: "navi-mumbai", label: "Navi Mumbai" }
  ];

  return (
    <>
      {/* Personal Information Section - Name fields in a row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={onInputChange}
            placeholder="Middle Name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="surname">Surname</Label>
          <Input
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={onInputChange}
            placeholder="Surname"
            className="mt-1"
          />
        </div>
      </div>

      {/* Contact Information Section - Email and phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="emailId">Email ID</Label>
          <Input
            id="emailId"
            name="emailId"
            type="email"
            value={formData.emailId}
            onChange={onInputChange}
            placeholder="Email ID"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={onInputChange}
            placeholder="Mobile Number"
            className="mt-1"
          />
        </div>
      </div>

      {/* Personal Details Section - Gender, DOB, Employee Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={onInputChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="employeeCode">Employee Code</Label>
          <Input
            id="employeeCode"
            name="employeeCode"
            value={formData.employeeCode}
            onChange={onInputChange}
            placeholder="Employee Code"
            className="mt-1"
          />
        </div>
      </div>

      {/* Work Location Section - Headquarters and Sub-headquarters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="headquarters">Headquarters</Label>
          <select
            id="headquarters"
            name="headquarters"
            value={formData.headquarters}
            onChange={onInputChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            {headquartersOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="reportingOffice">Reporting Office</Label>
          <select
            id="reportingOffice"
            name="reportingOffice"
            value={formData.subHeadquarters}
            onChange={onInputChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            {reportingOfficeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default AdminProfileForm;
export type { AdminProfileFormData };
