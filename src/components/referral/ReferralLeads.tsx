
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ColumnFilter from "../ui/column-filter";

const ReferralLeads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    loanType: "",
    loanAmount: "",
    bankName: "",
    payoutAmount: "",
    status: "Pending"
  });

  // Sample leads data
  const leadsData = [
    {
      leadNumber: "#1",
      name: "Priya Mehta",
      loanType: "HL",
      loanAmount: "₹3,00,000",
      bankName: "SBI",
      payoutAmount: "₹40,000",
      status: "In process",
      payoutDate: "10 | 05 | 25"
    },
    {
      leadNumber: "#2",
      name: "Rajesh Sharma",
      loanType: "HL",
      loanAmount: "₹2,00,000",
      bankName: "HDFC",
      payoutAmount: "₹20,000",
      status: "Pending",
      payoutDate: "10 | 05 | 25"
    },
    {
      leadNumber: "#3",
      name: "Anil Gupta",
      loanType: "HL",
      loanAmount: "₹7,00,000",
      bankName: "ICIC",
      payoutAmount: "₹50,000",
      status: "In process",
      payoutDate: "2 | 05 | 25"
    },
    {
      leadNumber: "#4",
      name: "Rajesh Sharma",
      loanType: "HL",
      loanAmount: "₹8,00,000",
      bankName: "Kotak",
      payoutAmount: "₹50,000",
      status: "Pending",
      payoutDate: "4 | 05 | 25"
    },
    {
      leadNumber: "#5",
      name: "Priya Mehta",
      loanType: "HL",
      loanAmount: "₹10,00,000",
      bankName: "SBI",
      payoutAmount: "₹70,000",
      status: "Pending",
      payoutDate: "6 | 05 | 25"
    },
    {
      leadNumber: "#6",
      name: "Priya Mehta",
      loanType: "HL",
      loanAmount: "₹22,00,000",
      bankName: "HDFC",
      payoutAmount: "₹50,000",
      status: "Pending",
      payoutDate: "9 | 05 | 25"
    },
    {
      leadNumber: "#7",
      name: "Neha Verma",
      loanType: "HL",
      loanAmount: "₹5,00,000",
      bankName: "ICIC",
      payoutAmount: "₹40,000",
      status: "In process",
      payoutDate: "10 | 05 | 25"
    },
    {
      leadNumber: "#8",
      name: "Priya Mehta",
      loanType: "HL",
      loanAmount: "₹5,00,000",
      bankName: "SBI",
      payoutAmount: "₹40,000",
      status: "Pending",
      payoutDate: "18 | 05 | 25"
    },
    {
      leadNumber: "#9",
      name: "Anil Gupta",
      loanType: "HL",
      loanAmount: "₹5,00,000",
      bankName: "HDFC",
      payoutAmount: "₹40,000",
      status: "Rejected",
      payoutDate: "21 | 05 | 25"
    }
  ];

  // Define filter columns
  const filterColumns = [
    { key: "leadNumber", label: "Lead Number", type: "text" as const },
    { key: "name", label: "Name", type: "text" as const },
    { key: "loanType", label: "Loan Type", type: "select" as const, options: ["HL"] },
    { key: "bankName", label: "Bank Name", type: "select" as const, options: ["SBI", "HDFC", "ICIC", "Kotak"] },
    { key: "status", label: "Status", type: "select" as const, options: ["In process", "Pending", "Rejected"] }
  ];

  // Filter the data based on search term and column filters
  const filteredLeadsData = useMemo(() => {
    return leadsData.filter(lead => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.leadNumber.toLowerCase().includes(searchTerm.toLowerCase());

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const leadValue = lead[key as keyof typeof lead]?.toString().toLowerCase() || "";
        return leadValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, filters]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in process":
        return "text-green-600";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleAddLead = () => {
    console.log("Adding new lead:", newLead);
    setIsAddLeadOpen(false);
    setNewLead({
      name: "",
      loanType: "",
      loanAmount: "",
      bankName: "",
      payoutAmount: "",
      status: "Pending"
    });
  };

  const handleDownloadExcel = async () => {
    try {
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      const XLSX = XLSXModule.default || XLSXModule;

      const excelData = filteredLeadsData.map(lead => ({
        'Lead Number': lead.leadNumber,
        'Name': lead.name,
        'Loan Type': lead.loanType,
        'Loan Amount': lead.loanAmount,
        'Bank Name': lead.bankName,
        'Payout Amount': lead.payoutAmount,
        'Status': lead.status,
        'Payout Date': lead.payoutDate
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Referral Leads');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Referral_Leads_${dateStr}.xlsx`;

      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">View Leads</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download in Excel
          </Button>
          <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="loanType" className="text-right">Loan Type</Label>
                  <Select value={newLead.loanType} onValueChange={(value) => setNewLead({...newLead, loanType: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HL">Home Loan</SelectItem>
                      <SelectItem value="PL">Personal Loan</SelectItem>
                      <SelectItem value="BL">Business Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="loanAmount" className="text-right">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    value={newLead.loanAmount}
                    onChange={(e) => setNewLead({...newLead, loanAmount: e.target.value})}
                    className="col-span-3"
                    placeholder="₹"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bankName" className="text-right">Bank Name</Label>
                  <Select value={newLead.bankName} onValueChange={(value) => setNewLead({...newLead, bankName: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SBI">SBI</SelectItem>
                      <SelectItem value="HDFC">HDFC</SelectItem>
                      <SelectItem value="ICIC">ICICI</SelectItem>
                      <SelectItem value="Kotak">Kotak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payoutAmount" className="text-right">Payout Amount</Label>
                  <Input
                    id="payoutAmount"
                    value={newLead.payoutAmount}
                    onChange={(e) => setNewLead({...newLead, payoutAmount: e.target.value})}
                    className="col-span-3"
                    placeholder="₹"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddLead}>
                  Add Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by Lead Name, Lead ID"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ColumnFilter
              columns={filterColumns}
              onFilterChange={setFilters}
            />
          </div>

          {/* Removed Status Tabs for aman@referral.com */}

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Lead Number</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Loan type</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Loan Amount</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Bank Name</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Payout Amount</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Payout Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeadsData.map((lead, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 text-sm text-gray-900 dark:text-white">{lead.leadNumber}</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-white">{lead.name}</td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{lead.loanType}</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-white font-medium">{lead.loanAmount}</td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{lead.bankName}</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-white font-medium">{lead.payoutAmount}</td>
                    <td className="py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{lead.payoutDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralLeads;
