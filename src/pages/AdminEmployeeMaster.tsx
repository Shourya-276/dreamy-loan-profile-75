
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const AdminEmployeeMaster = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeName: "",
    email: "",
    phoneNumber: "",
    designation: ""
  });
  const { user } = useAuth();
  const [emailError, setEmailError] = useState(false);
  // console.log(user?.role);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // console.log("Saving employee data:", formData);
    setEmailError(false);
    try {
    await axios.post(`${import.meta.env.VITE_SERVER_URL}/admin/employee-master/createEmployee`, formData, {
      headers: {
        "x-user-role": user?.role
      }
    })
      .then(response => {
        console.log("Response from backend:", response.data);
        toast.success("Employee data saved successfully!");
        handleClear();
      })
    } catch (error) {
      if (error.response.status === 400 && error.response.data.error === "Email already exists") {
        toast.error("Email already exists");
        setEmailError(true);
      } else {
        toast.error("Failed to save employee data");
      }
    }
  };

  const handleClear = () => {
    setEmailError(false);
    setFormData({
      employeeName: "",
      email: "",
      phoneNumber: "",
      designation: ""
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin-masters")}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Masters</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Master</h1>
          <p className="text-gray-600 dark:text-gray-400">Add new employee details</p>
        </div>

        {/* Employee Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Employee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input
                  id="employeeName"
                  placeholder="Enter employee name"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && <p className="text-red-500">Email already exists</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select
                  value={formData.designation}
                  onValueChange={(value) => handleInputChange('designation', value)}
                >
                  <SelectTrigger id="designation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesmanager">Sales Manager</SelectItem>
                    <SelectItem value="loancoordinator">Loan Co-ordinator</SelectItem>
                    <SelectItem value="loanadministrator">Loan Administrator</SelectItem>
                    <SelectItem value="connector">Connector</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Save
                </Button>
                <Button onClick={handleClear} variant="outline" className="flex-1">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEmployeeMaster;
