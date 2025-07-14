import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Camera } from "lucide-react";

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    middleName: "",
    lastName: "",
    emailAddress: "",
    mobileNumber: "",
    designation: "",
    employeeCode: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log("Profile data:", formData);
    // Handle save logic here
  };

  const handleClear = () => {
    setFormData({
      name: "",
      middleName: "",
      lastName: "",
      emailAddress: "",
      mobileNumber: "",
      designation: "",
      employeeCode: ""
    });
  };

  const handlePhotoUpload = () => {
    console.log("Photo upload functionality to be implemented");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - Removed Upload photo button */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your admin profile information</p>
        </div>

        {/* Profile Form */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            {/* Profile Photo Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <button 
                    onClick={handlePhotoUpload}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Profile Photo</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Click the camera icon to upload a new photo
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter first name"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    placeholder="Enter middle name"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Contact Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile Number
                  </Label>
                  <Input
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Professional Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Designation
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange("designation", e.target.value)}
                    placeholder="Enter designation"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employee Code
                  </Label>
                  <Input
                    id="employeeCode"
                    value={formData.employeeCode}
                    onChange={(e) => handleInputChange("employeeCode", e.target.value)}
                    placeholder="Enter employee code"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
