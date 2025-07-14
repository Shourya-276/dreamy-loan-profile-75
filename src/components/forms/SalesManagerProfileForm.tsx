
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ProfilePhotoSection from "../profile/ProfilePhotoSection";
import { useAuth } from "@/contexts/AuthContext";

const SalesManagerProfileForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: user?.email || "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    employeeCode: "",
    headquarters: "",
    reportingOffice: "",
    salaryBankAccountName: "",
    branchName: "",
    accountType: "",
    accountNumber: "",
    ifscCode: "",
    panCard: null as File | null,
    aadhaarCard: null as File | null,
    cancelledCheque: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleClear = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      dateOfBirth: "",
      employeeCode: "",
      headquarters: "",
      reportingOffice: "",
      salaryBankAccountName: "",
      branchName: "",
      accountType: "",
      accountNumber: "",
      ifscCode: "",
      panCard: null,
      aadhaarCard: null,
      cancelledCheque: null
    });
    toast.success("Form cleared!");
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Upload Section */}
      <ProfilePhotoSection />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) => handleInputChange("middleName", e.target.value)}
            placeholder="Enter middle name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
            disabled
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employeeCode">Employee Code</Label>
          <Input
            id="employeeCode"
            value={formData.employeeCode}
            onChange={(e) => handleInputChange("employeeCode", e.target.value)}
            placeholder="Enter employee code"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="headquarters">Headquarters</Label>
          <Select value={formData.headquarters} onValueChange={(value) => handleInputChange("headquarters", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select headquarters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="chennai">Chennai</SelectItem>
              <SelectItem value="pune">Pune</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reportingOffice">Reporting Office</Label>
          <Select value={formData.reportingOffice} onValueChange={(value) => handleInputChange("reportingOffice", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select reporting office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="andheri">Andheri</SelectItem>
              <SelectItem value="bandra">Bandra</SelectItem>
              <SelectItem value="thane">Thane</SelectItem>
              <SelectItem value="borivali">Borivali</SelectItem>
              <SelectItem value="navi-mumbai">Navi Mumbai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary Bank Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Salary Bank Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salaryBankAccountName">Salary Bank Account Name</Label>
            <Input
              id="salaryBankAccountName"
              value={formData.salaryBankAccountName}
              onChange={(e) => handleInputChange("salaryBankAccountName", e.target.value)}
              placeholder="Enter account holder name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              value={formData.branchName}
              onChange={(e) => handleInputChange("branchName", e.target.value)}
              placeholder="Enter branch name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
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
              value={formData.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              placeholder="Enter account number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              value={formData.ifscCode}
              onChange={(e) => handleInputChange("ifscCode", e.target.value)}
              placeholder="Enter IFSC code"
            />
          </div>
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="space-y-4">
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

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={handleSave} className="bg-brand-purple hover:bg-brand-purple/90">
          Save
        </Button>
      </div>
    </div>
  );
};

export default SalesManagerProfileForm;
