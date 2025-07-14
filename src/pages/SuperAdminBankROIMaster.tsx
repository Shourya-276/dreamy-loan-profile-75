
import React, { useState, useMemo } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Eye, Edit, Trash2 } from "lucide-react";

const SuperAdminBankROIMaster = () => {
  // Sample bank ROI data
  const bankROIData = [
    {
      id: 1,
      bankName: "SBI",
      loanType: "Home Loan",
      minROI: 8.50,
      maxROI: 9.25,
      processingFee: "0.35%",
      minAmount: 100000,
      maxAmount: 10000000,
      tenure: "30 years",
      status: "Active"
    },
    {
      id: 2,
      bankName: "HDFC",
      loanType: "Home Loan",
      minROI: 8.75,
      maxROI: 9.50,
      processingFee: "0.50%",
      minAmount: 200000,
      maxAmount: 15000000,
      tenure: "30 years",
      status: "Active"
    },
    {
      id: 3,
      bankName: "ICICI",
      loanType: "Home Loan",
      minROI: 8.65,
      maxROI: 9.40,
      processingFee: "0.40%",
      minAmount: 150000,
      maxAmount: 12000000,
      tenure: "25 years",
      status: "Active"
    },
    {
      id: 4,
      bankName: "Kotak",
      loanType: "Home Loan",
      minROI: 8.80,
      maxROI: 9.55,
      processingFee: "0.45%",
      minAmount: 250000,
      maxAmount: 8000000,
      tenure: "20 years",
      status: "Inactive"
    }
  ];

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [bankFilter, setBankFilter] = useState("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique values for filters
  const uniqueBanks = [...new Set(bankROIData.map(roi => roi.bankName))];
  const uniqueLoanTypes = [...new Set(bankROIData.map(roi => roi.loanType))];
  const uniqueStatuses = [...new Set(bankROIData.map(roi => roi.status))];

  // Filtered bank ROI data
  const filteredBankROI = useMemo(() => {
    return bankROIData.filter(roi => {
      const matchesSearch = searchTerm === "" || 
        roi.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roi.loanType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBank = bankFilter === "all" || roi.bankName === bankFilter;
      const matchesLoanType = loanTypeFilter === "all" || roi.loanType === loanTypeFilter;
      const matchesStatus = statusFilter === "all" || roi.status === statusFilter;

      return matchesSearch && matchesBank && matchesLoanType && matchesStatus;
    });
  }, [searchTerm, bankFilter, loanTypeFilter, statusFilter, bankROIData]);

  const handleDownloadExcel = async () => {
    try {
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      const XLSX = XLSXModule.default || XLSXModule;

      const excelData = filteredBankROI.map(roi => ({
        'Bank Name': roi.bankName,
        'Loan Type': roi.loanType,
        'Min ROI (%)': roi.minROI,
        'Max ROI (%)': roi.maxROI,
        'Processing Fee': roi.processingFee,
        'Min Amount': roi.minAmount,
        'Max Amount': roi.maxAmount,
        'Tenure': roi.tenure,
        'Status': roi.status
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 15 }, // Bank Name
        { wch: 15 }, // Loan Type
        { wch: 12 }, // Min ROI
        { wch: 12 }, // Max ROI
        { wch: 15 }, // Processing Fee
        { wch: 15 }, // Min Amount
        { wch: 15 }, // Max Amount
        { wch: 12 }, // Tenure
        { wch: 10 }  // Status
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Bank ROI');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Bank_ROI_${dateStr}.xlsx`;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank ROI Master</h1>
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

        {/* Bank ROI Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bank ROI Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="w-full max-w-md">
                <Input
                  placeholder="Search by bank name or loan type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
                  <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Loan Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Loan Types</SelectItem>
                      {uniqueLoanTypes.map((loanType) => (
                        <SelectItem key={loanType} value={loanType}>
                          {loanType}
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

            {/* Bank ROI Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Bank Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Loan Type</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Min ROI (%)</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Max ROI (%)</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Processing Fee</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Min Amount</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Max Amount</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Tenure</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBankROI.map((roi) => (
                    <tr key={roi.id} className="border-b">
                      <td className="py-3 text-sm">{roi.bankName}</td>
                      <td className="py-3 text-sm">{roi.loanType}</td>
                      <td className="py-3 text-sm">{roi.minROI}%</td>
                      <td className="py-3 text-sm">{roi.maxROI}%</td>
                      <td className="py-3 text-sm">{roi.processingFee}</td>
                      <td className="py-3 text-sm">₹{roi.minAmount.toLocaleString()}</td>
                      <td className="py-3 text-sm">₹{roi.maxAmount.toLocaleString()}</td>
                      <td className="py-3 text-sm">{roi.tenure}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          roi.status === 'Active' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {roi.status}
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

export default SuperAdminBankROIMaster;
