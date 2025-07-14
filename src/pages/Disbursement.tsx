import React, { useState, useMemo } from "react";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import PartDisbursementTab from "../components/disbursement/PartDisbursementTab";
import NewDisbursementTab from "../components/disbursement/NewDisbursementTab";
import DocumentsRequestTab from "../components/disbursement/DocumentsRequestTab";
import ColumnFilter from "../components/ui/column-filter";
import { useSearchParams } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Disbursement = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'main';
  const [activeTab, setActiveTab] = useState("part");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Show Documents Request page if navigated to it
  if (view === 'documents-request') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Loan Disbursement Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Track and manage your loan disbursement</p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <DocumentsRequestTab />
          </div>
        </div>
      </Layout>
    );
  }

  // Sample data for filtering demonstration
  const sampleDisbursementData = [
    { leadId: "#8232", leadName: "Rajesh Sharma", bankName: "HDFC Bank", loanAmount: "₹5,00,000", status: "Pending" },
    { leadId: "#1232", leadName: "Priya Mehta", bankName: "SBI", loanAmount: "₹3,50,000", status: "Approved" },
    { leadId: "#4232", leadName: "Anil Gupta", bankName: "ICICI Bank", loanAmount: "₹7,00,000", status: "Processing" }
  ];

  // Updated completed disbursements data with new columns and removed status
  const completedDisbursements = [
    { 
      leadId: "#8230", 
      leadName: "Suresh Kumar", 
      bankName: "ICICI Bank", 
      amount: "₹15,00,000",
      finalSanctionAmount: "₹15,50,000",
      disbursementAmount: "₹15,00,000",
      utrNumber: "ICIC0001234567890123456"
    },
    { 
      leadId: "#1230", 
      leadName: "Anita Sharma", 
      bankName: "SBI", 
      amount: "₹12,50,000",
      finalSanctionAmount: "₹13,00,000",
      disbursementAmount: "₹12,30,000",
      utrNumber: "SBIN0009876543210987654"
    }
  ];

  // Define filter columns for disbursement
  const filterColumns = [
    { key: "leadId", label: "Lead ID", type: "text" as const },
    { key: "leadName", label: "Lead Name", type: "text" as const },
    { key: "bankName", label: "Bank Name", type: "select" as const, options: ["HDFC Bank", "SBI", "ICICI Bank"] },
    { key: "loanAmount", label: "Loan Amount", type: "text" as const },
    { key: "status", label: "Status", type: "select" as const, options: ["Pending", "Approved", "Processing"] }
  ];

  // Filter the data based on search term and column filters
  const filteredDisbursementData = useMemo(() => {
    return sampleDisbursementData.filter(item => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        item.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leadId.toLowerCase().includes(searchTerm.toLowerCase());

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
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Loan Disbursement Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Track and manage your loan disbursement</p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Search and Filter */}
          {/* <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by Lead Name, Lead ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <ColumnFilter
                columns={filterColumns}
                onFilterChange={setFilters}
              />
            </div>
          </div> */}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="part" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Part Disbursement
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                New Disbursement
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Completed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="part">
              <PartDisbursementTab />
            </TabsContent>
            
            <TabsContent value="new">
              <NewDisbursementTab />
            </TabsContent>

            <TabsContent value="completed">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead ID</TableHead>
                      <TableHead>Lead Name</TableHead>
                      <TableHead>Bank Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Final Sanction Amount</TableHead>
                      <TableHead>Disbursement Amount</TableHead>
                      <TableHead>UTR Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedDisbursements.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.leadId}</TableCell>
                        <TableCell>{item.leadName}</TableCell>
                        <TableCell>{item.bankName}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>{item.finalSanctionAmount}</TableCell>
                        <TableCell>{item.disbursementAmount}</TableCell>
                        <TableCell>{item.utrNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Disbursement;
