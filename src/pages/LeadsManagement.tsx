import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import FollowupLeadsTable from "../components/leads/FollowupLeadsTable";
import LFISanctionsTable from "../components/leads/LFISanctionsTable";
import axios from "axios";
import ColumnFilter from "../components/ui/column-filter";

interface Lead {
  id: number;
  customerId: number;
  customerName: string;
  mobile: string;
  email: string;
  status: string;
  loanType: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TransformedLead {
  name: string;
  action: string;
  contact: string;
  leadId: string;
  date: string;
  followUp: string;
  fullLead: Lead;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const LeadsManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("followup");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState<Lead | null>(null);
  const [notesContent, setNotesContent] = useState("");
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [followupFilters, setFollowupFilters] = useState<Record<string, string>>({});
  const [lfiFilters, setLfiFilters] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const [leadToRemove, setLeadToRemove] = useState<string | null>(null);

  // Check if current user is aman@salesmanager.com
  const isAmanSalesManager = user?.email === "aman@salesmanager.com";

  // Handle pre-filled search from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
    }
  }, [searchParams]);

  // State for LFI sanctions data
  const [lfiSanctions, setLfiSanctions] = useState<any[]>([]);
  const [loadingSanctions, setLoadingSanctions] = useState(false);

  const followupFilterColumns = [
    { key: "name", label: "Lead Name", type: "text" as const },
    { key: "leadId", label: "Lead ID", type: "text" as const },
    { key: "action", label: "Actions", type: "select" as const, options: ["Followup", "Reject"] },
    { key: "contact", label: "Contact", type: "text" as const },
    { key: "followUp", label: "Follow Up Time", type: "select" as const, options: ["2hrs", "1 day", "4 day"] },
    ...(isAmanSalesManager ? [{ key: "project", label: "Project", type: "select" as const, options: ["Home Loan", "Car Loan", "Business Loan", "Education Loan"] }] : [])
  ];

  const lfiFilterColumns = [
    { key: "leadId", label: "Lead ID", type: "text" as const },
    { key: "name", label: "Lead Name", type: "text" as const },
    { key: "bankName", label: "Bank Name", type: "select" as const, options: ["HDFC Bank", "SBI", "ICICI Bank"] },
    { key: "status", label: "Loan Status", type: "select" as const, options: ["Approved", "Pending", "Rejected"] }
  ];

  // We no longer need filteredLfiSanctions since filtering is done on the backend
  // Filters are applied in the fetchLfiSanctions function
  
  // State for leads data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [lfiPagination, setLfiPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Mock user ID for sales manager - in real app, this would come from auth context
  const salesManagerId = Number(user?.id) || 1;

  const fetchLeads = async (page = 1, status = statusFilter, search = searchTerm) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(status !== 'all' && { status }),
        ...(search && { search })
      });

      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/sales-manager/leads/${salesManagerId}?${params}`, {
        headers: {
          'x-user-role': 'salesmanager'
        }
      });
      console.log(response.data);
      const data: LeadsResponse = response.data;
      setLeads(data.leads);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
      toast.error('Failed to load leads');
      
      // Fallback to hardcoded data for followup leads
      if (activeTab === "followup") {
        setLeads([
          { id: 1, customerId: 1, customerName: "Rajesh Sharma", mobile: "9876543210", email: "rajesh@example.com", status: "pending", loanType: "Home Loan", notes: null, createdAt: "2024-01-10", updatedAt: "2024-01-10" },
          { id: 2, customerId: 2, customerName: "Priya Mehta", mobile: "8765432109", email: "priya@example.com", status: "rejected", loanType: "Personal Loan", notes: null, createdAt: "2024-01-10", updatedAt: "2024-01-10" },
          { id: 3, customerId: 3, customerName: "Anil Gupta", mobile: "7654321098", email: "anil@example.com", status: "approved", loanType: "Business Loan", notes: null, createdAt: "2024-01-10", updatedAt: "2024-01-10" }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch LFI sanctions data
  const fetchLfiSanctions = async (page = 1, search = searchTerm, bankFilter = "") => {
    try {
      setLoadingSanctions(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(bankFilter && { bankName: bankFilter })
      });

      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/sales-manager/sanctions/${salesManagerId}?${params}`, {
        headers: {
          'x-user-role': 'salesmanager'
        }
      });
      
      const data = response.data;
      setLfiSanctions(data.sanctions);
      setLfiPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching LFI sanctions:', err);
      setError('Failed to load LFI sanctions');
      toast.error('Failed to load LFI sanctions');
      
      // Fallback to empty array if error
      setLfiSanctions([]);
    } finally {
      setLoadingSanctions(false);
    }
  };

  const updateLeadStatus = async (leadId: number, status: string, notes?: string) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/sales-manager/leads/${leadId}/status`, 
        { status, notes },
        {
          headers: {
            'x-user-role': 'salesmanager',
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Lead status updated successfully');
      
      // Refresh leads data
      fetchLeads(currentPage, statusFilter, searchTerm);
      
      return response.data;
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Failed to update lead status');
      throw err;
    }
  };

  useEffect(() => {
    if (activeTab === "followup") {
      fetchLeads(1, statusFilter, searchTerm);
    } else if (activeTab === "lfi") {
      fetchLfiSanctions(1, searchTerm);
    }
    setCurrentPage(1);
  }, [activeTab, statusFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (activeTab === "followup") {
        if (searchTerm !== "") {
          fetchLeads(1, statusFilter, searchTerm);
        } else {
          fetchLeads(1, statusFilter, "");
        }
      } else if (activeTab === "lfi") {
        // Get bank filter if any
        const bankFilter = lfiFilters.bankName || "";
        fetchLfiSanctions(1, searchTerm, bankFilter);
      }
      setCurrentPage(1);
    }, 500); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, activeTab]);

  // Effect to handle LFI filter changes
  useEffect(() => {
    if (activeTab === "lfi") {
      const bankFilter = lfiFilters.bankName || "";
      fetchLfiSanctions(1, searchTerm, bankFilter);
    }
  }, [lfiFilters]);

  // Handle LFI pagination change
  const handleLfiPageChange = (page: number) => {
    const bankFilter = lfiFilters.bankName || "";
    fetchLfiSanctions(page, searchTerm, bankFilter);
    setLfiPagination({
      ...lfiPagination,
      page
    });
  };

  const handleAddNotes = (tableLead: any) => {
    const fullLead = tableLead.fullLead || tableLead;
    setSelectedLeadForNotes(fullLead);
    setNotesContent(fullLead.notes || "");
    setIsNotesDialogOpen(true);
  };

  const handleActionChange = async (leadId: string, newAction: string) => {
    // Check if the new action requires automatic note popup (only for aman@salesmanager.com)
    if (isAmanSalesManager && (newAction === "not-interested" || newAction === "reject" || newAction === "ltc")) {
      const numericLeadId = parseInt(leadId.replace('#', ''));
      const lead = leads.find(l => l.id === numericLeadId);
      if (lead) {
        setSelectedLeadForNotes(lead);
        setLeadToRemove(leadId);
        setNotesContent("");
        setIsNotesDialogOpen(true);
      }
    }

    // Update backend
    try {
      const numericLeadId = parseInt(leadId.replace('#', ''));
      await updateLeadStatus(numericLeadId, newAction);
      toast.success(`Lead status updated to ${newAction}`);
    } catch (err) {
      // Error already handled in updateLeadStatus
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLeadForNotes) return;

    try {
      const leadId = selectedLeadForNotes.id;
      const status = selectedLeadForNotes.status;
      
      await updateLeadStatus(leadId, status, notesContent);

      // If this note was triggered by specific actions and user is aman@salesmanager.com, refresh leads
      if (leadToRemove && isAmanSalesManager) {
        // The lead will be filtered out by the status filter or backend response
        setLeadToRemove(null);
      }

      setIsNotesDialogOpen(false);
      setSelectedLeadForNotes(null);
      setNotesContent("");
    } catch (err) {
      // Error already handled in updateLeadStatus
    }
  };

  const handleShareDetails = (leadId: string) => {
    console.log("Share details for lead:", leadId);
    toast.info(`Sharing details for lead ${leadId}`);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLeads(page, statusFilter, searchTerm);
  };

  const handleLfiPaginationChange = (newPagination: any) => {
    setLfiPagination(newPagination);
  };

  // Transform leads data for the table components
  const transformedFollowupLeads = useMemo(() => {
    const transformed = leads.map(lead => ({
      name: lead.customerName,
      action: lead.status === "pending" ? "Followup" : lead.status === "rejected" ? "Reject" : "Followup",
      contact: lead.mobile,
      leadId: `#${lead.id}`,
      date: new Date(lead.createdAt).toLocaleDateString(),
      followUp: "2hrs", // This would come from backend logic
      project: lead.loanType,
      fullLead: {
        id: lead.id.toString(),
        status: lead.status,
        notes: lead.notes,
        loanType: lead.loanType
      }
    }));

    // Apply column filters
    return transformed.filter(lead => {
      const matchesFilters = Object.entries(followupFilters).every(([key, value]) => {
        if (!value) return true;
        const leadValue = lead[key as keyof typeof lead]?.toString().toLowerCase() || "";
        return leadValue.includes(value.toLowerCase());
      });
      return matchesFilters;
    });
  }, [leads, followupFilters]);


  if (loading && leads.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Leads Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Loading your leads...</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDownloadExcel = async () => {
    try {
      // Dynamic imports to handle module loading
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      // Access the default export
      const XLSX = XLSXModule.default || XLSXModule;

      // Prepare data for Excel export
      const excelData = transformedFollowupLeads.map(lead => ({
        'Lead ID': lead.leadId,
        'Lead Name/Contact': `${lead.name} / ${lead.contact}`,
        'Actions': lead.action,
        'Follow up time': lead.followUp,
        'Project': lead.project,
        'Created Date': lead.date
      }));

      // Create workbook and worksheet - using correct method calls
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Lead ID
        { wch: 25 }, // Lead Name/Contact
        { wch: 15 }, // Actions
        { wch: 15 }, // Follow up time
        { wch: 20 }, // Project
        { wch: 15 }  // Created Date
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Followup Leads');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `FollowUp_Leads_${dateStr}.xlsx`;

      // Save file
      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  const handleDownloadLFIExcel = async () => {
    try {
      // Dynamic imports to handle module loading
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      // Access the default export
      const XLSX = XLSXModule.default || XLSXModule;

      // Prepare data for LFI Sanctions Excel export with more detailed information
      const excelData = lfiSanctions.map(sanction => ({
        'Lead ID': sanction.leadId,
        'Lead Name': sanction.name,
        'Bank Name': sanction.bankName,
        'Loan Status': sanction.status,
        'Amount': typeof sanction.amount === 'number' ? 
          new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(sanction.amount) : 
          sanction.amount,
        'Interest Rate': sanction.interestRate,
        'Contact': sanction.contact,
        'Date': sanction.date
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Lead ID
        { wch: 20 }, // Lead Name
        { wch: 20 }, // Bank Name
        { wch: 15 }, // Loan Status
        { wch: 20 }, // Amount
        { wch: 15 }, // Interest Rate
        { wch: 15 }, // Contact
        { wch: 15 }  // Date
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'LFI Sanctions');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `LFI_Sanctions_${dateStr}.xlsx`;

      // Save file
      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading LFI Sanctions Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Leads Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === "followup" 
                ? `Total: ${pagination.total} leads | Page ${pagination.page} of ${pagination.totalPages}`
                : `Total: ${lfiPagination.total} LFI sanctions | Page ${lfiPagination.page} of ${lfiPagination.totalPages}`
              }
            </p>
          </div>
          <Button 
            onClick={() => {
              if (activeTab === "followup") {
                fetchLeads(currentPage, statusFilter, searchTerm);
              } else if (activeTab === "lfi") {
                fetchLfiSanctions(lfiPagination.page, searchTerm);
              }
            }} 
            variant="outline"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">⚠️ Some data may not be current due to connection issues. Showing cached data.</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => setActiveTab("followup")}
            className={`${activeTab === "followup" ? "bg-brand-purple text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            <span className="mr-2">📞</span> Followup Leads ({leads.filter(l => l.status === "pending").length})
          </Button>
          <Button
            onClick={() => setActiveTab("lfi")}
            className={`${activeTab === "lfi" ? "bg-brand-purple text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            <span className="mr-2">📄</span> LFI Sanctions ({activeTab === "lfi" ? lfiPagination.total : leads.filter(l => l.status === "approved").length})
          </Button>
          <Link to="/sales-manager-loan-offers">
            <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300">
              <span className="mr-2">💰</span> Explore Loan Offers
            </Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by Lead Name, Lead ID, or Mobile Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (activeTab === "followup") {
                    fetchLeads(1, statusFilter, searchTerm);
                  } else if (activeTab === "lfi") {
                    fetchLfiSanctions(1, searchTerm);
                  }
                }}
              >
                <span className="mr-2">🔍</span> Search
              </Button>
              <ColumnFilter
                columns={activeTab === "followup" ? followupFilterColumns : lfiFilterColumns}
                onFilterChange={activeTab === "followup" ? setFollowupFilters : setLfiFilters}
              />
              {activeTab === "followup" && (
                <Button 
                  onClick={handleDownloadExcel}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download in Excel
                </Button>
              )}
              {activeTab === "lfi" && (
                <Button 
                  onClick={handleDownloadLFIExcel}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download in Excel
                </Button>
              )}
            </div>
          </div>

          {/* Status Tabs - Removed for aman@salesmanager.com */}
          {/* Commented out the status filter buttons */}
          {/* {activeTab === "followup" && (
            <div className="flex gap-4 mb-6">
              <Button 
                variant={statusFilter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusFilter("all")}
              >
                All ({pagination.total})
              </Button>
              <Button 
                variant={statusFilter === "pending" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === "under_review" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusFilter("under_review")}
              >
                Under Review
              </Button>
              <Button 
                variant={statusFilter === "approved" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusFilter("approved")}
              >
                Approved
              </Button>
              <Button 
                variant={statusFilter === "rejected" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusFilter("rejected")}
              >
                Rejected
              </Button>
            </div>
          )}

          {activeTab === "lfi" && (
            <div className="flex gap-4 mb-6">
              <Button variant="outline" size="sm">Sanctioned</Button>
              <Button variant="outline" size="sm">Approved</Button>
              <Button variant="outline" size="sm">Pending</Button>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading leads...
              </div>
            </div>
          )}

          {/* Tables */}
          {!loading && (
            <>
              {activeTab === "followup" ? (
                <FollowupLeadsTable 
                  leads={transformedFollowupLeads}
                  onAddNotes={handleAddNotes}
                  onShareDetails={handleShareDetails}
                  onActionChange={handleActionChange}
                />
              ) : (
                <>
                  {loadingSanctions ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center">
                        <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading sanctions...
                      </div>
                    </div>
                  ) : (
                    <LFISanctionsTable 
                      sanctions={lfiSanctions} 
                    />
                  )}
                  
                  {/* Pagination for LFI sanctions */}
                  {!loadingSanctions && lfiPagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLfiPageChange(lfiPagination.page - 1)}
                        disabled={lfiPagination.page === 1}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: lfiPagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === lfiPagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLfiPageChange(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLfiPageChange(lfiPagination.page + 1)}
                        disabled={lfiPagination.page === lfiPagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Pagination - only show for followup leads */}
              {activeTab === "followup" && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* No data message */}
          {!loading && activeTab === "followup" && leads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No leads found. {searchTerm && "Try adjusting your search terms."}
              </p>
            </div>
          )}
          
          {!loadingSanctions && activeTab === "lfi" && lfiSanctions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No LFI sanctions found. {searchTerm && "Try adjusting your search terms."}
              </p>
            </div>
          )}


        </div>

        {/* Notes Modal */}
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedLeadForNotes?.notes ? "Edit" : "Add"} Notes for {selectedLeadForNotes?.customerName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white-700 dark:text-gray-200 mb-2">
                  Lead ID: #{selectedLeadForNotes?.id}
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Customer: {selectedLeadForNotes?.customerName}
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Current Status: {selectedLeadForNotes?.status}
                </label>
                {selectedLeadForNotes?.notes && (
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Existing Notes: Yes
                  </label>
                )}
                <textarea
                  placeholder={selectedLeadForNotes?.notes ? "Edit existing notes..." : "Enter your notes here..."}
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-900 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNotesDialogOpen(false);
                    setLeadToRemove(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNotes}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!notesContent.trim()}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default LeadsManagement;
