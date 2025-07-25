import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedFormType, setSelectedFormType] = useState<string>("");
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: boolean }>({});
  const [docs, setDocs] = useState<
    { id: number; doc_type: string; url: string }[]
  >([]);
  // Track which residence address proof was selected
  const [addressProofType, setAddressProofType] = useState<string>("");

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
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/documents/${user.id}`,
      );
      console.log(data);
      setDocs(data);                        // every item already includes url
    }
    if (user.id) load();
  }, [user.id]);

  const handleFileChange = async (docType: string, file: File) => {
    // Supabase (S3) object keys cannot contain certain special characters like [ ] ? etc.
    // Replace any character that is NOT alphanumeric, dot, dash or underscore with an underscore.
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = `${user.id}/${docType}/${Date.now()}-${sanitizedFileName}`;
    try {
      await uploadViaPresigned(filePath, file);
    } catch (err) {
      console.error(err);
      return toast.error("Upload failed");
    }

    // Save row in your backend
    const backendRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/documents`, {
            userId: user.id,
            docType,
            storageKey: filePath,
            fileName: sanitizedFileName,
            size: file.size,
            mimeType: file.type,
    });

    // Refresh documents list to fetch signed URL generated by backend
    const { data: newDocs } = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/documents/${user.id}`,
    );
    setDocs(newDocs);

    setUploadedDocs((prev) => ({ ...prev, [docType]: true }));
    toast.success("Document uploaded successfully!");
  };

  const handleSaveDocuments = async () => {
    try {
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
        userId: user.id,
        formType: selectedFormType,
        addressProof: addressProofType,
        docIds: docs.map((d) => d.id),
      });
      toast.success("Documents saved successfully!");
      navigate("/disbursement");
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
        <h1 className="text-2xl font-bold mb-2">Loan Document Submission</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Upload all required documents for loan processing</p>
        
        {/* Form Type Selection Buttons */}
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

        {/* Form Content */}
        {selectedFormType && (
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
        {!selectedFormType && (
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
