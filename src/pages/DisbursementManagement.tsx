
import React, { useState } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Upload } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const DisbursementManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data
  const pendingDisbursements = [
    { leadId: "#8232", leadName: "Rajesh Sharma", bankName: "HDFC Bank", pendingDocs: "Form, Doc1,Doc2", uploadAction: "Upload" },
    { leadId: "#1232", leadName: "Priya Mehta", bankName: "SBI", pendingDocs: "Form, Doc1,Doc2", uploadAction: "Upload" },
    { leadId: "#4232", leadName: "Anil Gupta", bankName: "HDFC Bank", pendingDocs: "Form, Doc1,Doc2", uploadAction: "Upload" },
  ];

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
    },
  ];

  const filteredData = activeTab === "pending" ? pendingDisbursements : completedDisbursements;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disbursement Management</h1>
        
        <Card className="bg-white dark:bg-gray-800 p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "completed"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by Lead Name, Lead ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>

          {/* Conditionally render sub-tabs only if NOT aman@salesmanager.com */}
          {user?.email !== 'aman@salesmanager.com' && activeTab === "pending" && (
            <div className="flex gap-4 mb-6">
              <Button variant="outline" size="sm">Uploaded</Button>
              <Button variant="outline" size="sm">Pending</Button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
                  {activeTab === "pending" ? (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Pending Docs</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Upload Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Final Sanction Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Disbursement Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">UTR Number</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadId}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadName}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.bankName}</td>
                    {activeTab === "pending" ? (
                      <>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.pendingDocs}</td>
                        <td className="px-4 py-4 text-sm">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Upload className="w-4 h-4 mr-1" />
                            {item.uploadAction}
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{item.amount}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{item.finalSanctionAmount}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{item.disbursementAmount}</td>
                        <td className="px-4 py-4 text-sm text-blue-600 font-mono">{item.utrNumber}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DisbursementManagement;
