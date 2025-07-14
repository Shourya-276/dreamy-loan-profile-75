
import React, { useState } from "react";
import LoanAdministratorLayout from "../components/LoanAdministratorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Download, Filter } from "lucide-react";

const LoanAdministratorReports = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [bankNameFilter, setBankNameFilter] = useState("");

  // Dropdown data for each metric
  const sanctionsData = [
    { customerName: "Rajesh Sharma", bankName: "HDFC Bank", tat: "12 days" },
    { customerName: "Priya Mehta", bankName: "SBI", tat: "10 days" },
    { customerName: "Anil Gupta", bankName: "ICICI Bank", tat: "15 days" },
    { customerName: "Neha Verma", bankName: "HDFC Bank", tat: "8 days" },
  ];

  const firstDisbursementsData = [
    { customerName: "Amit Singh", bankName: "SBI", tat: "7 days" },
    { customerName: "Kavya Patel", bankName: "Kotak", tat: "9 days" },
    { customerName: "Rohit Kumar", bankName: "ICICI Bank", tat: "6 days" },
  ];

  const partDisbursementsData = [
    { customerName: "Sonal Shah", bankName: "HDFC Bank", tat: "5 days" },
    { customerName: "Vikram Joshi", bankName: "SBI", tat: "8 days" },
  ];

  const getDropdownData = (type: string) => {
    switch (type) {
      case "sanctions": return sanctionsData;
      case "firstDisbursements": return firstDisbursementsData;
      case "partDisbursements": return partDisbursementsData;
      default: return [];
    }
  };

  const filterData = (data: any[]) => {
    return data.filter(item => 
      item.customerName.toLowerCase().includes(customerNameFilter.toLowerCase()) &&
      item.bankName.toLowerCase().includes(bankNameFilter.toLowerCase())
    );
  };

  const handleDropdownToggle = (type: string) => {
    setExpandedDropdown(expandedDropdown === type ? null : type);
  };

  const handleDownloadExcel = async () => {
    try {
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      const XLSX = XLSXModule.default || XLSXModule;

      const excelData = [
        { 
          "No. of Sanctions": "45", 
          "No. of First Disbursements": "32", 
          "Avg. Disbursement TAT": "6 days / 8 days", 
          "No. of Part Disbursements": "15", 
          "Avg. Sanctions TAT": "12 days / 15 days",
          "TAT (First Disbursement)": "6 days",
          "TAT (Part Disbursement)": "4 days"
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 18 }, { wch: 25 }, { wch: 22 }, { wch: 25 }, { wch: 20 }, { wch: 22 }, { wch: 22 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Loan Admin Reports');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
      });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Loan_Administrator_Reports_${dateStr}.xlsx`;

      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <LoanAdministratorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Loan Performance Reports</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 items-center justify-between">
            <div className="flex gap-4">
              <Button
                onClick={() => setActiveTab("monthly")}
                variant={activeTab === "monthly" ? "default" : "outline"}
                className={activeTab === "monthly" ? "bg-brand-purple" : ""}
              >
                Monthly
              </Button>
              <Button
                onClick={() => setActiveTab("quarterly")}
                variant={activeTab === "quarterly" ? "default" : "outline"}
                className={activeTab === "quarterly" ? "bg-brand-purple" : ""}
              >
                Quarterly
              </Button>
              <Button
                onClick={() => setActiveTab("yearly")}
                variant={activeTab === "yearly" ? "default" : "outline"}
                className={activeTab === "yearly" ? "bg-brand-purple" : ""}
              >
                Yearly
              </Button>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button 
                onClick={handleDownloadExcel}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Excel
              </Button>
            </div>
          </div>

          {/* Reporting Period */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Reporting Period:</span> 15 Mar - 15 Apr 2025
            </p>
          </div>

          {/* Filter Controls */}
          {expandedDropdown && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Customer Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter customer name"
                    value={customerNameFilter}
                    onChange={(e) => setCustomerNameFilter(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Bank Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter bank name"
                    value={bankNameFilter}
                    onChange={(e) => setBankNameFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reports Table */}
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button 
                        onClick={() => handleDropdownToggle("sanctions")}
                        className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        No. of Sanctions
                        {expandedDropdown === "sanctions" ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button 
                        onClick={() => handleDropdownToggle("firstDisbursements")}
                        className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        No. of First Disbursements
                        {expandedDropdown === "firstDisbursements" ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Disbursement TAT</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button 
                        onClick={() => handleDropdownToggle("partDisbursements")}
                        className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        No. of Part Disbursements
                        {expandedDropdown === "partDisbursements" ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Sanctions TAT</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">TAT (First Disbursement)</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">TAT (Part Disbursement)</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">45</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">32</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">6 days / 8 days</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">15</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">12 days / 15 days</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">6 days</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">4 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dropdown Sub-table */}
            {expandedDropdown && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {expandedDropdown === "sanctions" && "Sanctions Details"}
                  {expandedDropdown === "firstDisbursements" && "First Disbursements Details"}
                  {expandedDropdown === "partDisbursements" && "Part Disbursements Details"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Customer Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">TAT</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {filterData(getDropdownData(expandedDropdown)).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.bankName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.tat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LoanAdministratorLayout>
  );
};

export default LoanAdministratorReports;
