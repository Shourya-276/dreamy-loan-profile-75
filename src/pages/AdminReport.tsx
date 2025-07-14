
import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreHorizontal, Download } from "lucide-react";
import FilterModal from "../components/admin/FilterModal";

const AdminReport = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const reportData = [
    {
      empCode: "#1",
      name: "Priya Mehta",
      totalAmount: "₹3,00,000",
      incentive: "₹28,000",
      bank: "SBI"
    },
    {
      empCode: "#2", 
      name: "Rajesh Sharma",
      totalAmount: "₹3,00,000",
      incentive: "₹28,000",
      bank: "HDFC"
    },
    {
      empCode: "#3",
      name: "Anil Gupta", 
      totalAmount: "₹3,00,000",
      incentive: "₹28,000",
      bank: "KOTAK"
    },
    {
      empCode: "#4",
      name: "Rajesh Sharma",
      totalAmount: "₹3,00,000", 
      incentive: "₹28,000",
      bank: "ICIC"
    }
  ];

  const handleDownloadExcel = async () => {
    try {
      // Dynamic imports to handle module loading
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      // Access the default export
      const XLSX = XLSXModule.default || XLSXModule;

      // Prepare data for Excel export
      const excelData = reportData.map(report => ({
        'EMP Code': report.empCode,
        'Name': report.name,
        'Total Amount': report.totalAmount,
        'Incentive': report.incentive,
        'Bank': report.bank
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // EMP Code
        { wch: 20 }, // Name
        { wch: 15 }, // Total Amount
        { wch: 15 }, // Incentive
        { wch: 15 }  // Bank
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Reports');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Admin_Reports_${dateStr}.xlsx`;

      // Save file
      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report</h1>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by Employee Name or ID"
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download in Excel
            </Button>
          </div>
        </div>

        {/* Report Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">EMP code</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Total Amount</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Incentive</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 text-sm">{item.empCode}</td>
                      <td className="py-3 text-sm">{item.name}</td>
                      <td className="py-3 text-sm">{item.totalAmount}</td>
                      <td className="py-3 text-sm">{item.incentive}</td>
                      <td className="py-3 text-sm">{item.bank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Filter Modal */}
        <FilterModal 
          open={isFilterOpen} 
          onOpenChange={setIsFilterOpen} 
        />
      </div>
    </AdminLayout>
  );
};

export default AdminReport;
