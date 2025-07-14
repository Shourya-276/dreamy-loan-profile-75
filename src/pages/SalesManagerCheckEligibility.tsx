
import React, { useState, useMemo, useEffect } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SalesManagerEligibilityForm from "../components/forms/SalesManagerEligibilityForm";
import CustomerProfileFormCopy from "../components/forms/CustomerProfileFormCopy";
import ColumnFilter from "../components/ui/column-filter";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
// import { downloadSanctionLetter } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const SalesManagerCheckEligibility = () => {
  const [currentView, setCurrentView] = useState<"main" | "existing-user" | "new-user">("main");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [eligibilityHistory, setEligibilityHistory] = useState<any[]>([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        const resp = await axios.get(`${serverUrl}/sales-manager/eligibility/${user.id}`, {
          headers: { 'x-user-role': 'salesmanager' }
        });
        // console.log("DATATA",resp.data);
        const data = resp.data.map((rec: any) => {
          const statusLabel = rec.status === 'eligible' ? 'Eligible' : rec.status === 'pending' ? 'Pending' : 'Not Eligible';
          const action = rec.status === 'eligible' ? 'Apply loan' : rec.status === 'pending' ? 'Continue' : 'Re-check';
          return {
            leadId: rec.lead_id || '-',
            customerName: rec.customer_name,
            customer_id: rec.customer_id, // Add customer_id for reference
            customerEmail: rec.customer_email,
            status: statusLabel,
            maxLoan: rec.max_loan ? `₹${Number(rec.max_loan).toLocaleString('en-IN')}` : '-',
            action,
          };
        });
        setEligibilityHistory(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load eligibility history');
      }
    };

    fetchHistory();
  }, [user]);

  const handleActionClick = async (record: any) => {
    if (record.action === 'Continue') {
      // Set customer data with just the user ID for the form to fetch
      const customerData = {
        userId: record.customer_id,
        personal: null,
        income: null,
        existingLoans: []
      };
      
      setSelectedCustomerData(customerData);
      setCurrentView("new-user");
    } else {
      // Handle other actions (Apply loan, Re-check) as needed
      navigate("/sales-manager-loan-offers", { state: { userId: record.customer_id, customer: record } });
      toast.info(`${record.action} clicked for ${record.customerName}`);
    }
  };

  // Define filter columns for eligibility history
  const filterColumns = [
    { key: "leadId", label: "Lead ID", type: "text" as const },
    { key: "customerName", label: "Customer Name", type: "text" as const },
    { key: "customerEmail", label: "Customer Email", type: "text" as const },
    { key: "status", label: "Status", type: "select" as const, options: ["Eligible", "Pending", "Not Eligible"] },
    { key: "maxLoan", label: "Max. Loan", type: "text" as const },
    { key: "action", label: "Action", type: "select" as const, options: ["Apply loan", "Continue", "Re-check"] }
  ];

  // Filter the data based on search term and column filters
  const filteredEligibilityHistory = useMemo(() => {
    return eligibilityHistory.filter(record => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.leadId.toLowerCase().includes(searchTerm.toLowerCase());

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const recordValue = record[key as keyof typeof record]?.toString().toLowerCase() || "";
        return recordValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, filters, eligibilityHistory]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "existing-user":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setCurrentView("main")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
              <h1 className="text-2xl font-bold">Check Customer Eligibility</h1>
            </div>

            <div className="p-6">
              <SalesManagerEligibilityForm />
            </div>
          </div>
        );

      case "new-user":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setCurrentView("main")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
              <h1 className="text-2xl font-bold">New Customer Profile</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <CustomerProfileFormCopy prefillData={selectedCustomerData} />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Check Eligibility</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Want to Apply for a New Loan?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Check your eligibility instantly.</p>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => setCurrentView("existing-user")}
                  className="bg-brand-purple hover:bg-brand-purple/90 text-lg py-6 px-8"
                >
                  Quick Eligibility Check
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedCustomerData(null); // clear any previous customer data to avoid auto-prefill
                    setCurrentView("new-user");
                  }}
                  variant="outline"
                  className="text-lg py-6 px-8"
                >
                  New User
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Eligibility History</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Review past eligibility checks and update your details.</p>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by Customer Name, Lead ID"
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
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Customer Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max. Loan ₹</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEligibilityHistory.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{record.leadId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{record.customerName}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            record.status === 'Eligible' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {record.status === 'Eligible' && '✅'} 
                            {record.status === 'Pending' && '⏳'} 
                            {record.status === 'Not Eligible' && '❌'} 
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{record.maxLoan}</td>
                        <td className="px-6 py-4 text-sm">
                          <Button 
                            size="sm" 
                            className={record.status === 'Eligible' ? "bg-brand-purple hover:bg-brand-purple/90" : "bg-brand-purple hover:bg-brand-purple/90"}
                            onClick={() => handleActionClick(record)}
                          >
                            {record.action}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderCurrentView()}
    </Layout>
  );
};

export default SalesManagerCheckEligibility;
