
import React, { useState, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

const AdminDashboard = () => {
  // Check if current user is aman@admin.com
  const isAmanAdmin = true; // For demo purposes, set to true. In real app, get from auth context

  // Updated performance metrics data
  const performanceMetrics = [
    {
      title: "Total Number of Leads",
      value: "1,245",
      icon: "👥",
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Number of Bank Sanctions",
      value: "387",
      icon: "🏦",
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Number of Disbursements",
      value: "275",
      icon: "💰",
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Number of Pending Disbursements",
      value: "42",
      icon: "⏳",
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Total Disbursement Value",
      value: "₹12.5 Cr",
      icon: "📊",
      bgColor: "bg-white",
      textColor: "text-gray-900"
    }
  ];

  // Updated leads data with Executive Name
  const leadsData = [
    {
      leadNumber: "#90",
      name: "Priya Mehta",
      executiveName: "Rahul Sharma",
      mobileNumber: "9876543210",
      loanType: "HL",
      bankName: "SBI",
      property: "Skyline Residency",
      converted: "Yes"
    },
    {
      leadNumber: "#221",
      name: "Rajesh Sharma",
      executiveName: "Anita Patel",
      mobileNumber: "9123456789",
      loanType: "HL",
      bankName: "HDFC",
      property: "Greenwood Villas",
      converted: "No"
    },
    {
      leadNumber: "#140",
      name: "Anil Gupta",
      executiveName: "Suresh Kumar",
      mobileNumber: "9234567890",
      loanType: "HL",
      bankName: "Kotak",
      property: "Palm Grove",
      converted: "Yes"
    },
    {
      leadNumber: "#40",
      name: "Rajesh Sharma",
      executiveName: "Priya Singh",
      mobileNumber: "9345678901",
      loanType: "HL",
      bankName: "ICICI",
      property: "Ocean View Apartments",
      converted: "Pending"
    },
    {
      leadNumber: "#89",
      name: "Neha Verma",
      executiveName: "Rahul Sharma",
      mobileNumber: "9456789012",
      loanType: "HL",
      bankName: "SBI",
      property: "Metro Heights",
      converted: "Yes"
    },
    {
      leadNumber: "#156",
      name: "Amit Kumar",
      executiveName: "Anita Patel",
      mobileNumber: "9567890123",
      loanType: "HL",
      bankName: "HDFC",
      property: "Golden Plaza",
      converted: "No"
    }
  ];

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [executiveFilter, setExecutiveFilter] = useState("all");
  const [leadNumberFilter, setLeadNumberFilter] = useState("");
  const [leadNameFilter, setLeadNameFilter] = useState("");

  // Get unique values for filter options
  const uniqueProjects = [...new Set(leadsData.map(lead => lead.property))];
  const uniqueBanks = [...new Set(leadsData.map(lead => lead.bankName))];
  const uniqueExecutives = [...new Set(leadsData.map(lead => lead.executiveName))];

  // Filtered leads based on search and filters
  const filteredLeads = useMemo(() => {
    return leadsData.filter(lead => {
      // Search term filter (searches both lead name and executive name)
      const matchesSearch = searchTerm === "" || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.executiveName.toLowerCase().includes(searchTerm.toLowerCase());

      // Individual filters
      const matchesProject = projectFilter === "all" || lead.property === projectFilter;
      const matchesBank = bankFilter === "all" || lead.bankName === bankFilter;
      const matchesExecutive = executiveFilter === "all" || lead.executiveName === executiveFilter;
      const matchesLeadNumber = leadNumberFilter === "" || lead.leadNumber.toLowerCase().includes(leadNumberFilter.toLowerCase());
      const matchesLeadName = leadNameFilter === "" || lead.name.toLowerCase().includes(leadNameFilter.toLowerCase());

      return matchesSearch && matchesProject && matchesBank && matchesExecutive && matchesLeadNumber && matchesLeadName;
    });
  }, [searchTerm, projectFilter, bankFilter, executiveFilter, leadNumberFilter, leadNameFilter, leadsData]);

  const handleDownloadRecentLeadsExcel = async () => {
    try {
      // Dynamic imports to handle module loading
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      // Access the default export
      const XLSX = XLSXModule.default || XLSXModule;

      // Prepare data for Recent Leads Excel export - now includes Executive Name
      const excelData = filteredLeads.map(lead => ({
        'Lead Number': lead.leadNumber,
        'Lead Name': lead.name,
        'Executive Name': lead.executiveName,
        'Mobile Number': lead.mobileNumber,
        'Loan Type': lead.loanType,
        'Bank Name': lead.bankName,
        'Property (Project)': lead.property
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Lead Number
        { wch: 20 }, // Lead Name
        { wch: 18 }, // Executive Name
        { wch: 15 }, // Mobile Number
        { wch: 12 }, // Loan Type
        { wch: 15 }, // Bank Name
        { wch: 25 }  // Property (Project)
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Leads_${dateStr}.xlsx`;

      // Save file
      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Leads Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>

        {/* Performance Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className={`${metric.bgColor} border border-gray-200 dark:border-gray-700 p-6 relative`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</p>
                </div>
                <div className="text-2xl">{metric.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Leads Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Leads</CardTitle>
            {isAmanAdmin && (
              <Button 
                onClick={handleDownloadRecentLeadsExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download in Excel
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="w-full max-w-md">
                <Input
                  placeholder="Search by Lead Name or Executive Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Projects</SelectItem>
                      {uniqueProjects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                  <Select value={bankFilter} onValueChange={setBankFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Banks" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Banks</SelectItem>
                      {uniqueBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Executive</label>
                  <Select value={executiveFilter} onValueChange={setExecutiveFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Executives" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Executives</SelectItem>
                      {uniqueExecutives.map((executive) => (
                        <SelectItem key={executive} value={executive}>
                          {executive}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Number</label>
                  <Input
                    placeholder="Filter by Lead Number"
                    value={leadNumberFilter}
                    onChange={(e) => setLeadNumberFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name</label>
                  <Input
                    placeholder="Filter by Lead Name"
                    value={leadNameFilter}
                    onChange={(e) => setLeadNameFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Lead Number</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Lead Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Executive Name</th>
                    {isAmanAdmin && (
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Mobile Number</th>
                    )}
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Loan Type</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Bank Name</th>
                    {isAmanAdmin && (
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Property (Project)</th>
                    )}
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 text-sm">{lead.leadNumber}</td>
                      <td className="py-3 text-sm">{lead.name}</td>
                      <td className="py-3 text-sm">{lead.executiveName}</td>
                      {isAmanAdmin && (
                        <td className="py-3 text-sm">{lead.mobileNumber}</td>
                      )}
                      <td className="py-3 text-sm">{lead.loanType}</td>
                      <td className="py-3 text-sm">{lead.bankName}</td>
                      {isAmanAdmin && (
                        <td className="py-3 text-sm">{lead.property}</td>
                      )}
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lead.converted === 'Yes' ? 'bg-green-100 text-green-800' :
                          lead.converted === 'No' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.converted}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
