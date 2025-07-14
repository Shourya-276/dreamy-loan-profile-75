
import React, { useState } from "react";
import LoanCoordinatorLayout from "../components/LoanCoordinatorLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";

/**
 * Loan Coordinator Document Management Page
 * Handles document viewing, searching, and management for loan coordinators
 */
const LoanCoordinatorDocument: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prefilledLead = searchParams.get('leadName') || '';
  const [searchTerm, setSearchTerm] = useState(prefilledLead);

  // Sample document data
  const documents = [
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      documentType: "KYC Documents",
      fileName: "aadhar_card.pdf",
      uploadDate: "2024-03-15",
      status: "Verified"
    },
    {
      leadId: "#8232", 
      leadName: "Rajesh Sharma",
      documentType: "Income Proof",
      fileName: "salary_slip.pdf",
      uploadDate: "2024-03-15",
      status: "Pending"
    },
    {
      leadId: "#1232",
      leadName: "Priya Mehta", 
      documentType: "Bank Statements",
      fileName: "bank_statement.pdf",
      uploadDate: "2024-03-14",
      status: "Verified"
    },
    {
      leadId: "#4232",
      leadName: "Anil Gupta",
      documentType: "Property Documents",
      fileName: "property_papers.pdf", 
      uploadDate: "2024-03-17",
      status: "Under Review"
    }
  ];

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = () => {
    // Search functionality already handled by filteredDocuments
    console.log("Searching for:", searchTerm);
  };

  return (
    <LoanCoordinatorLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Management</h1>
        </div>

        <Card className="bg-white dark:bg-gray-800 p-6">
          {/* Search Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4 w-full max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by Lead ID or Lead Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white px-8 h-12"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Search Results or Empty State */}
          {searchTerm ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Results ({filteredDocuments.length})
              </h2>
              
              {filteredDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Document Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">File Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Upload Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredDocuments.map((doc, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{doc.leadId}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{doc.leadName}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{doc.documentType}</td>
                          <td className="px-4 py-4 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{doc.fileName}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{doc.uploadDate}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              doc.status === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Download</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No documents found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mb-6">
                <Search className="mx-auto h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Search for Documents</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Enter a Lead ID or Lead Name in the search box above to view and manage their uploaded documents.
              </p>
            </div>
          )}
        </Card>
      </div>
    </LoanCoordinatorLayout>
  );
};

export default LoanCoordinatorDocument;
