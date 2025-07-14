
import React, { useState, useMemo } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Eye, Edit, Trash2 } from "lucide-react";

const SuperAdminEmployeeMaster = () => {
  // Sample employee data
  const employeesData = [
    {
      id: 1,
      employeeCode: "EMP001",
      name: "Rahul Sharma",
      designation: "Sales Manager",
      department: "Sales",
      mobileNumber: "9876543210",
      emailAddress: "rahul.sharma@company.com",
      joiningDate: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      employeeCode: "EMP002",
      name: "Anita Patel",
      designation: "Marketing Executive",
      department: "Marketing",
      mobileNumber: "9123456789",
      emailAddress: "anita.patel@company.com",
      joiningDate: "2024-02-10",
      status: "Active"
    },
    {
      id: 3,
      employeeCode: "EMP003",
      name: "Suresh Kumar",
      designation: "Loan Coordinator",
      department: "Operations",
      mobileNumber: "9234567890",
      emailAddress: "suresh.kumar@company.com",
      joiningDate: "2023-11-20",
      status: "Active"
    },
    {
      id: 4,
      employeeCode: "EMP004",
      name: "Priya Singh",
      designation: "HR Executive",
      department: "HR",
      mobileNumber: "9345678901",
      emailAddress: "priya.singh@company.com",
      joiningDate: "2024-03-05",
      status: "Inactive"
    }
  ];

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");

  // Get unique values for filters
  const uniqueDepartments = [...new Set(employeesData.map(emp => emp.department))];
  const uniqueStatuses = [...new Set(employeesData.map(emp => emp.status))];
  const uniqueDesignations = [...new Set(employeesData.map(emp => emp.designation))];

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employeesData.filter(employee => {
      const matchesSearch = searchTerm === "" || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.emailAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
      const matchesDesignation = designationFilter === "all" || employee.designation === designationFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesDesignation;
    });
  }, [searchTerm, departmentFilter, statusFilter, designationFilter, employeesData]);

  const handleDownloadExcel = async () => {
    try {
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      const XLSX = XLSXModule.default || XLSXModule;

      const excelData = filteredEmployees.map(employee => ({
        'Employee Code': employee.employeeCode,
        'Name': employee.name,
        'Designation': employee.designation,
        'Department': employee.department,
        'Mobile Number': employee.mobileNumber,
        'Email Address': employee.emailAddress,
        'Joining Date': employee.joiningDate,
        'Status': employee.status
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 15 }, // Employee Code
        { wch: 20 }, // Name
        { wch: 20 }, // Designation
        { wch: 15 }, // Department
        { wch: 15 }, // Mobile Number
        { wch: 25 }, // Email Address
        { wch: 15 }, // Joining Date
        { wch: 10 }  // Status
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Employees_${dateStr}.xlsx`;

      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Master</h1>
          <div className="flex space-x-4">
            <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Excel
            </Button>
          </div>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="w-full max-w-md">
                <Input
                  placeholder="Search by name, code, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Departments</SelectItem>
                      {uniqueDepartments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <Select value={designationFilter} onValueChange={setDesignationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Designations" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Designations</SelectItem>
                      {uniqueDesignations.map((designation) => (
                        <SelectItem key={designation} value={designation}>
                          {designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Statuses</SelectItem>
                      {uniqueStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Employees Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Employee Code</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Designation</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Department</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Mobile Number</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Email Address</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Joining Date</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b">
                      <td className="py-3 text-sm">{employee.employeeCode}</td>
                      <td className="py-3 text-sm">{employee.name}</td>
                      <td className="py-3 text-sm">{employee.designation}</td>
                      <td className="py-3 text-sm">{employee.department}</td>
                      <td className="py-3 text-sm">{employee.mobileNumber}</td>
                      <td className="py-3 text-sm">{employee.emailAddress}</td>
                      <td className="py-3 text-sm">{employee.joiningDate}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminEmployeeMaster;
