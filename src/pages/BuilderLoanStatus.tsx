
import React, { useState, useMemo } from "react";
import BuilderLayout from "../components/BuilderLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ColumnFilter from "../components/ui/column-filter";

const BuilderLoanStatus = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const loanStatusData = [
    {
      id: 1,
      wing: "A",
      floor: "1",
      flatNo: "101",
      reraCarpet: "650 sq ft",
      name: "John Doe",
      agreementValue: "₹45,00,000",
      gst: "₹2,25,000",
      otherCharges: "₹50,000",
      bankName: "SBI",
      loanAmount: "₹35,00,000",
      sanction: "Yes",
      disbursementStatus: "Status 1/6"
    },
    {
      id: 2,
      wing: "A",
      floor: "1",
      flatNo: "102",
      reraCarpet: "750 sq ft",
      name: "Jane Smith",
      agreementValue: "₹52,00,000",
      gst: "₹2,60,000",
      otherCharges: "₹75,000",
      bankName: "HDFC",
      loanAmount: "₹40,00,000",
      sanction: "Yes",
      disbursementStatus: "Status 3/6"
    },
    {
      id: 3,
      wing: "B",
      floor: "2",
      flatNo: "201",
      reraCarpet: "850 sq ft",
      name: "Mike Johnson",
      agreementValue: "₹58,00,000",
      gst: "₹2,90,000",
      otherCharges: "₹60,000",
      bankName: "ICICI",
      loanAmount: "₹45,00,000",
      sanction: "No",
      disbursementStatus: "Status 2/6"
    },
    {
      id: 4,
      wing: "B",
      floor: "2",
      flatNo: "202",
      reraCarpet: "650 sq ft",
      name: "Sarah Wilson",
      agreementValue: "₹46,00,000",
      gst: "₹2,30,000",
      otherCharges: "₹55,000",
      bankName: "Axis Bank",
      loanAmount: "₹36,00,000",
      sanction: "Yes",
      disbursementStatus: "Status 4/6"
    },
    {
      id: 5,
      wing: "C",
      floor: "3",
      flatNo: "301",
      reraCarpet: "750 sq ft",
      name: "David Brown",
      agreementValue: "₹53,00,000",
      gst: "₹2,65,000",
      otherCharges: "₹70,000",
      bankName: "Kotak",
      loanAmount: "₹42,00,000",
      sanction: "Yes",
      disbursementStatus: "Status 6/6"
    },
    {
      id: 6,
      wing: "C",
      floor: "3",
      flatNo: "302",
      reraCarpet: "800 sq ft",
      name: "Lisa Davis",
      agreementValue: "₹55,00,000",
      gst: "₹2,75,000",
      otherCharges: "₹65,000",
      bankName: "PNB",
      loanAmount: "₹43,00,000",
      sanction: "Yes",
      disbursementStatus: "Status 2/6"
    }
  ];

  // Define filter columns for all table columns
  const filterColumns = [
    { key: "wing", label: "Wing", type: "select" as const, options: ["A", "B", "C"] },
    { key: "floor", label: "Floor", type: "select" as const, options: ["1", "2", "3"] },
    { key: "flatNo", label: "Flat No.", type: "text" as const },
    { key: "reraCarpet", label: "RERA Carpet", type: "text" as const },
    { key: "name", label: "Name", type: "text" as const },
    { key: "agreementValue", label: "Agreement Value", type: "text" as const },
    { key: "gst", label: "GST", type: "text" as const },
    { key: "otherCharges", label: "Other Charges", type: "text" as const },
    { key: "bankName", label: "Bank Name", type: "select" as const, options: ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak", "PNB"] },
    { key: "loanAmount", label: "Loan Amount", type: "text" as const },
    { key: "sanction", label: "Sanction", type: "select" as const, options: ["Yes", "No"] },
    { key: "disbursementStatus", label: "Disbursement Status", type: "select" as const, options: ["Status 1/6", "Status 2/6", "Status 3/6", "Status 4/6", "Status 5/6", "Status 6/6"] }
  ];

  // Filter the data based on search term and column filters
  const filteredData = useMemo(() => {
    return loanStatusData.filter(item => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.flatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.wing.toLowerCase().includes(searchTerm.toLowerCase());

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof typeof item]?.toString().toLowerCase() || "";
        return itemValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, filters]);

  return (
    <BuilderLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Status</h1>
        </div>

        {/* Search and Filter Section - Made scrollable */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 overflow-x-auto pb-2">
          <div className="relative flex-shrink-0 w-full sm:w-auto sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by Lead Name, Lead ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 min-w-[300px]"
            />
          </div>
          <div className="flex-shrink-0">
            <ColumnFilter
              columns={filterColumns}
              onFilterChange={setFilters}
              className="flex items-center gap-2"
            />
          </div>
        </div>

        {/* Loan Status Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Wing</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Floor</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Flat No.</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">RERA Carpet</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Name</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Agreement Value</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">GST</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Other Charges</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Bank Name</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Loan Amount</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Sanction</TableHead>
                  <TableHead className="text-blue-600 font-medium whitespace-nowrap">Disbursement Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.wing}</TableCell>
                    <TableCell>{item.floor}</TableCell>
                    <TableCell>{item.flatNo}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.reraCarpet}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.agreementValue}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.gst}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.otherCharges}</TableCell>
                    <TableCell>{item.bankName}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.loanAmount}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        item.sanction === 'Yes' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.sanction}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        item.disbursementStatus === 'Status 6/6' 
                          ? 'bg-green-100 text-green-800' 
                          : item.disbursementStatus === 'Status 4/6' || item.disbursementStatus === 'Status 5/6'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.disbursementStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default BuilderLoanStatus;
