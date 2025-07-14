import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addressProofOptions } from "../utils/formOptions";
import { uploadViaPresigned } from "@/lib/uploadViaPresigned";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const DocumentUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFormType, setSelectedFormType] = useState<string>("");
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: boolean }>({});
  const [docs, setDocs] = useState<
    { id: number; doc_type: string; url: string }[]
  >([]);
  // Track which residence address proof was selected
  const [addressProofType, setAddressProofType] = useState<string>("");
  
  // Sales Manager specific states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);

  // Required document keys per form type
  const employeeRequiredDocs = [
    "passport",
    "panCard",
    "addressProof",
    "salarySlip",
    "bankStatement",
    "form16",
    "costSheet",
    "occupancyCert",
    "saleAgreement",
    "ocrReceipt",
    "ocrReflection",
    "builderNoc",
    "demandLetter",
    "architectLetter",
    "xyzLetter",
    "xyzDocument",
  ];

  const businessRequiredDocs = [
    "passport",
    "panCard",
    "addressProof",
    "threeYearItr",
    "oneYearBankStatement",
    "businessProofs",
    "threeYearForm26AS",
    "floorPlanDoc",
    "lightBill",
    "propertyCard",
    "chainAgreement",
    "ocrReceipt",
    "ocrReflection",
    "societyNoc",
    "vendorKyc",
    "vendorCancelCheque",
    "xyzLetter",
    "xyzDocument",
  ];

  useEffect(() => {
    async function load() {
      // For sales managers, only load documents if a customer is selected
      if (user.role === 'salesmanager' && !selectedCustomer) {
        return;
      }
      
      const customerId = user.role === 'salesmanager' ? selectedCustomer?.id : user.id;
      if (!customerId) return;
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/documents/${customerId}`,
      );
      console.log(data);
      setDocs(data);                        // every item already includes url
    }
    if (user.id) load();
  }, [user.id, selectedCustomer]);

  // Pre-select customer if passed via navigation state
  useEffect(() => {
    if (user.role === 'salesmanager' && location.state?.customer) {
      const email = location.state.customer.customerEmail || location.state.customer.email;
      if (email) {
        setIsAutoSelecting(true);
        setSearchQuery(email);
        // Wait for searchResults to update, then select the customer
      }
    }
  }, [user.role, location.state]);

  // When searchResults update, auto-select the customer if pre-selection is needed
  useEffect(() => {
    if (
      user.role === 'salesmanager' &&
      location.state?.customer &&
      searchQuery &&
      searchResults.length > 0 &&
      !selectedCustomer // Only auto-select if not already selected
    ) {
      // Try to find the customer in the results by email or id
      const email = location.state.customer.customerEmail || location.state.customer.email;
      const id = location.state.customer.customer_id || location.state.customer.id;
      const match = searchResults.find(
        (c) => c.email === email || c.id === id
      );
      if (match) {
        selectCustomer(match);
        setIsAutoSelecting(false);
      }
    } else if (
      user.role === 'salesmanager' &&
      location.state?.customer &&
      searchQuery &&
      searchResults.length === 0 &&
      !selectedCustomer
    ) {
      // If no results, stop loading
      setIsAutoSelecting(false);
    }
    // eslint-disable-next-line
  }, [searchResults]);

  // Search effect with debounce
  useEffect(() => {
    if (user.role !== 'salesmanager') return;
    
    const timer = setTimeout(() => {
      searchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFileChange = async (docType: string, file: File) => {
    const customerId = user.role === 'salesmanager' ? selectedCustomer?.id : user.id;
    if (!customerId) {
      toast.error("No customer selected");
      return;
    }

    // Supabase (S3) object keys cannot contain certain special characters like [ ] ? etc.
    // Replace any character that is NOT alphanumeric, dot, dash or underscore with an underscore.
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = `${customerId}/${docType}/${Date.now()}-${sanitizedFileName}`;
    try {
      await uploadViaPresigned(filePath, file);
    } catch (err) {
      console.error(err);
      return toast.error("Upload failed");
    }

    // Save row in your backend
    const backendRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/documents`, {
            userId: customerId,
            docType,
            storageKey: filePath,
            fileName: sanitizedFileName,
            size: file.size,
            mimeType: file.type,
    });

    // Refresh documents list to fetch signed URL generated by backend
    const { data: newDocs } = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/documents/${customerId}`,
    );
    setDocs(newDocs);

    setUploadedDocs((prev) => ({ ...prev, [docType]: true }));
    toast.success("Document uploaded successfully!");
  };

  const handleSaveDocuments = async () => {
    try {
      const customerId = user.role === 'salesmanager' ? selectedCustomer?.id : user.id;
      if (!customerId) {
        toast.error("No customer selected");
        return;
      }

      if (!selectedFormType) {
        toast.error("Please select a form type");
        return;
      }

      if (!addressProofType) {
        toast.error("Please select residence address proof type");
        return;
      }

      const requiredDocs = selectedFormType === "employee" ? employeeRequiredDocs : businessRequiredDocs;
      const uploadedTypes = docs.map((d) => d.doc_type);
      const missingDocs = requiredDocs.filter((d) => !uploadedTypes.includes(d));

      if (missingDocs.length > 0) {
        toast.error(`Please upload all required documents. Missing: ${missingDocs.join(", ")}`);
        return;
      }

      await axios.post(`${import.meta.env.VITE_SERVER_URL}/document-submissions`, {
        userId: customerId,
        formType: selectedFormType,
        addressProof: addressProofType,
        docIds: docs.map((d) => d.id),
      });
      toast.success("Documents saved successfully!");
      if (user.role === 'salesmanager') {
        navigate("/sales-manager-dashboard");
      } else {
        navigate("/disbursement");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save documents");
    }
  };

  const viewDoc = (url: string) => window.open(url, "_blank");

  const deleteDoc = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    await axios.delete(`${import.meta.env.VITE_SERVER_URL}/documents/${id}`);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Deleted");
  };

  // Search functions for sales managers
  const searchCustomers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/sales-manager/users/search?query=${encodeURIComponent(searchQuery)}&role=customer`,
        {
          headers: {
            "x-user-role": user.role,
          },
        }
      );
      console.log(response.data);
      
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search customers");
    } finally {
      setIsSearching(false);
    }
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    // console.log(customer);
    
    setSearchResults([]);
    setSearchQuery("");
    setDocs([]);
    setSelectedFormType("");
    setAddressProofType("");
    setUploadedDocs({});
  };

  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setDocs([]);
    setSelectedFormType("");
    setAddressProofType("");
    setUploadedDocs({});
  };

  const renderFileUploadSection = (title: string, description: string, docType: string) => (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      
      {uploadedDocs[docType] || docs.find((d) => d.doc_type === docType) ? (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => viewDoc(
              docs.find((d) => d.doc_type === docType)!.url
            )}
          >
            View
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteDoc(
              docs.find((d) => d.doc_type === docType)!.id
            )}
          >
            Delete
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <Input
            type="file"
            className="hidden"
            id={docType}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                e.target.files?.[0] && handleFileChange(docType, e.target.files[0])
            }
          />
          <label htmlFor={docType} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Drag file here or Browse
          </label>
        </div>
      )}
    </div>
  );

  const renderEmployeeBuilderPurchaseForm = () => (
    <div className="space-y-8">
      {/* KYC Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">KYC Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("Passport Photo", "JPG/PNG/PDF format accepted", "passport")}
          {renderFileUploadSection("Pan Card", "JPG/PNG/PDF format accepted", "panCard")}
          
          <div>
            <div className="mb-2 space-y-1">
              <p className="text-sm font-medium">Select Residence Address Proof</p>
              <p className="text-xs text-gray-500">Select any one of the following doc.</p>
            </div>
            <Select value={addressProofType} onValueChange={(val) => setAddressProofType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {addressProofOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {renderFileUploadSection("Upload Selected Address Proof", "JPG/PNG/PDF format accepted", "addressProof")}
        </div>
      </div>
      
      {/* Income Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Income Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("Three month Salary Slip", "JPG/PNG/PDF format accepted", "salarySlip")}
          {renderFileUploadSection("Sequential Bank Statement", "JPG/PNG/PDF format accepted", "bankStatement")}
          {renderFileUploadSection("Form 16 A & B", "JPG/PNG/PDF format accepted", "form16")}
        </div>
      </div>
      
      {/* Property Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Property Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("Cost Sheet", "JPG/PNG/PDF format accepted", "costSheet")}
          {renderFileUploadSection("OC (Occupancy Certificate)", "JPG/PNG/PDF format accepted", "occupancyCert")}
          {renderFileUploadSection("Sale Agreement", "JPG/PNG/PDF format accepted", "saleAgreement")}
        </div>
      </div>

      {/* Disbursement Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Disbursement Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("OCR receipt", "JPG/PNG/PDF format accepted", "ocrReceipt")}
          {renderFileUploadSection("OCR reflection", "JPG/PNG/PDF format accepted", "ocrReflection")}
          {renderFileUploadSection("Builder NOC", "JPG/PNG/PDF format accepted", "builderNoc")}
          {renderFileUploadSection("Demand Letter", "JPG/PNG/PDF format accepted", "demandLetter")}
          {renderFileUploadSection("Architect Letter", "JPG/PNG/PDF format accepted", "architectLetter")}
        </div>
      </div>

      {/* Other Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Other Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("XYZ Letter", "JPG/PNG/PDF format accepted", "xyzLetter")}
          {renderFileUploadSection("XYZ Document", "JPG/PNG/PDF format accepted", "xyzDocument")}
        </div>
      </div>
    </div>
  );

  const renderBusinessBuilderResaleForm = () => (
    <div className="space-y-8">
      {/* KYC Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">KYC Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("Passport Photo", "JPG/PNG/PDF format accepted", "passport")}
          {renderFileUploadSection("Pan Card", "JPG/PNG/PDF format accepted", "panCard")}
          
          <div>
            <div className="mb-2 space-y-1">
              <p className="text-sm font-medium">Select Residence Address Proof</p>
              <p className="text-xs text-gray-500">Select any one of the following doc.</p>
            </div>
            <Select value={addressProofType} onValueChange={(val) => setAddressProofType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {addressProofOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {renderFileUploadSection("Upload Selected Address Proof", "JPG/PNG/PDF format accepted", "addressProof")}
        </div>
      </div>
      
      {/* Income Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Income Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("Three year ITR", "JPG/PNG/PDF format accepted", "threeYearItr")}
          {renderFileUploadSection("One year Bank statement", "JPG/PNG/PDF format accepted", "oneYearBankStatement")}
          {renderFileUploadSection("Business proofs", "JPG/PNG/PDF format accepted", "businessProofs")}
          {renderFileUploadSection("Three year form26AS", "JPG/PNG/PDF format accepted", "threeYearForm26AS")}
        </div>
      </div>
      
      {/* Property Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Property Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("Floor Plan doc.", "JPG/PNG/PDF format accepted", "floorPlanDoc")}
          {renderFileUploadSection("Light Bill", "JPG/PNG/PDF format accepted", "lightBill")}
          {renderFileUploadSection("Property card", "JPG/PNG/PDF format accepted", "propertyCard")}
          {renderFileUploadSection("Chain agreement", "JPG/PNG/PDF format accepted", "chainAgreement")}
        </div>
      </div>

      {/* Disbursement Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Disbursement Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("OCR receipt", "JPG/PNG/PDF format accepted", "ocrReceipt")}
          {renderFileUploadSection("OCR reflection", "JPG/PNG/PDF format accepted", "ocrReflection")}
          {renderFileUploadSection("Society NOC", "JPG/PNG/PDF format accepted", "societyNoc")}
          {renderFileUploadSection("Vendor KYC", "JPG/PNG/PDF format accepted", "vendorKyc")}
          {renderFileUploadSection("Vendor cancel cheque", "JPG/PNG/PDF format accepted", "vendorCancelCheque")}
        </div>
      </div>

      {/* Other Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Other Documents</h2>
        <div className="space-y-4">
          {renderFileUploadSection("XYZ Letter", "JPG/PNG/PDF format accepted", "xyzLetter")}
          {renderFileUploadSection("XYZ Document", "JPG/PNG/PDF format accepted", "xyzDocument")}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Loading overlay for auto-selection */}
        {isAutoSelecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <span className="text-lg text-gray-900 dark:text-white">Loading customer documents...</span>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2">
          {user.role === 'salesmanager' ? 'Customer Document Management' : 'Loan Document Submission'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {user.role === 'salesmanager' 
            ? 'Search and manage customer documents' 
            : 'Upload all required documents for loan processing'
          }
        </p>
        
        {/* Sales Manager Customer Search */}
        {user.role === 'salesmanager' && !selectedCustomer && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Search Customer</h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by customer name, email or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                        {customer.mobile && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{customer.mobile}</p>
                        )}
                        {customer.lead_info?.lead_id && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">Lead ID: {customer.lead_info.lead_id}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">Select</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <p className="mt-4 text-center text-gray-500">No customers found</p>
            )}
          </div>
        )}

        {/* Selected Customer Info */}
        {user.role === 'salesmanager' && selectedCustomer && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Selected Customer</h3>
                <p className="text-blue-800 dark:text-blue-200">{selectedCustomer.name}</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">{selectedCustomer.email}</p>
              </div>
              <Button onClick={clearCustomerSelection} variant="outline" size="sm">
                Change Customer
              </Button>
            </div>
          </div>
        )}
        
        {/* Form Type Selection Buttons - Only show if customer is selected for sales managers */}
        {(user.role !== 'salesmanager' || selectedCustomer) && (
          <div className="mb-6 flex gap-4">
            <Button
              onClick={() => setSelectedFormType("employee")}
              variant={selectedFormType === "employee" ? "default" : "outline"}
              className="flex-1"
            >
              If Employee and Builder Purchase
            </Button>
            <Button
              onClick={() => setSelectedFormType("business")}
              variant={selectedFormType === "business" ? "default" : "outline"}
              className="flex-1"
            >
              If Business and Builder Resale
            </Button>
          </div>
        )}

        {/* Form Content */}
        {selectedFormType && (user.role !== 'salesmanager' || selectedCustomer) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {selectedFormType === "employee" && renderEmployeeBuilderPurchaseForm()}
            {selectedFormType === "business" && renderBusinessBuilderResaleForm()}
            
            <div className="mt-8 flex justify-center">
              <Button onClick={handleSaveDocuments} className="bg-brand-purple hover:bg-brand-purple/90">
                Save Document
              </Button>
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedFormType && (user.role !== 'salesmanager' || selectedCustomer) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Select Document Type</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Please select the appropriate document category above to begin uploading your loan documents.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentUpload;
