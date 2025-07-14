
import React, { useState } from "react";
import LoanCoordinatorLayout from "../components/LoanCoordinatorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const LoanCoordinatorProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "Mohit",
    middleName: "",
    fullName: "Mohit Rajput",
    email: "mohitrajput@gmail.com",
    phoneNumber: "+91 7588072877",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBankInputChange = (field: string, value: string) => {
    setBankFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setBankFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handleClear = () => {
    setFormData({
      firstName: "",
      middleName: "",
      fullName: "",
      email: "",
      phoneNumber: "",
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

  return (
    <LoanCoordinatorLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Profile Photo Section */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Profile Photo</h3>
              <Button variant="outline" size="sm" className="mt-2">Change Photo</Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Name</Label>
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
                <Label htmlFor="fullName">Surname</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter surname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Mobile Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>

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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportingOffice">Reporting Office</Label>
                <Select value={formData.subHeadquarters} onValueChange={(value) => handleInputChange("subHeadquarters", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Reporting Office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="andheri">Andheri</SelectItem>
                    <SelectItem value="bandra">Bandra</SelectItem>
                    <SelectItem value="powai">Powai</SelectItem>
                    <SelectItem value="thane">Thane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </LoanCoordinatorLayout>
  );
};

export default LoanCoordinatorProfile;
