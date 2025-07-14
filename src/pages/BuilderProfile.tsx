
import React, { useState } from "react";
import BuilderLayout from "../components/BuilderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

const BuilderProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    middleName: "",
    lastName: "",
    companyName: "",
    builderType: "",
    emailAddress: "",
    mobileNumber: "",
    registeredCompanyName: "",
    companyAddress: "",
    gstNumber: "",
    bankName: "",
    bankIfscCode: "",
    bankBranch: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving profile data:", formData);
  };

  const handleClear = () => {
    setFormData({
      name: "",
      middleName: "",
      lastName: "",
      companyName: "",
      builderType: "",
      emailAddress: "",
      mobileNumber: "",
      registeredCompanyName: "",
      companyAddress: "",
      gstNumber: "",
      bankName: "",
      bankIfscCode: "",
      bankBranch: ""
    });
  };

  return (
    <BuilderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <Button variant="outline">Upload photo</Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Photo Upload Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Photo</h3>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">JPG/PNG/PDF format accepted</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      Drag file here or Browse
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Details */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <Input
                    value={formData.middleName}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    placeholder="Enter middle name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Builder Type</label>
                  <Select value={formData.builderType} onValueChange={(value) => handleInputChange("builderType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select builder type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="mixed">Mixed Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <Input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <Input
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registered Company name</label>
                  <Input
                    value={formData.registeredCompanyName}
                    onChange={(e) => handleInputChange("registeredCompanyName", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                    <Input
                      value={formData.companyAddress}
                      onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <Input
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bank Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank-Ifsc code</label>
                    <Input
                      value={formData.bankIfscCode}
                      onChange={(e) => handleInputChange("bankIfscCode", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">bank branch</label>
                    <Input
                      value={formData.bankBranch}
                      onChange={(e) => handleInputChange("bankBranch", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Documents */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Documents</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Pan card</p>
                    <p className="text-sm text-gray-500">JPG/PNG/PDF format accepted</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Drag file here or Browse
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">RERA Certificate</p>
                    <p className="text-sm text-gray-500">JPG/PNG/PDF format accepted</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Drag file here or Browse
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">GST Certificate</p>
                    <p className="text-sm text-gray-500">JPG/PNG/PDF format accepted</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Drag file here or Browse
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleClear}>Clear</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BuilderLayout>
  );
};

export default BuilderProfile;
