
/**
 * REFERRAL INVOICE COMPONENT
 * 
 * This component handles invoice creation and display functionality.
 * It includes a form for creating invoices and displays a tax invoice
 * format exactly as shown in the reference images.
 * 
 * USAGE:
 * - Used within ReferralDashboard.tsx when invoice tab is active
 * - Handles invoice creation and viewing
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ReferralTaxInvoice from "./ReferralTaxInvoice";

const ReferralInvoice = () => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    companyName: "",
    address: "",
    gstNo: "",
    stateCode: "",
    panNo: "",
    customer1: "",
    amount1: "",
    customer2: "",
    amount2: "",
    cgst: "9",
    sgst: "9",
    connectorName: "",
    bankName: "",
    gstNumber: "",
    bankAccountType: "",
    panNumber: "",
    bankAccountNumber: "",
    ifscCode: "",
    branchName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateInvoice = () => {
    setShowInvoice(true);
  };

  const handleClear = () => {
    setInvoiceData({
      companyName: "",
      address: "",
      gstNo: "",
      stateCode: "",
      panNo: "",
      customer1: "",
      amount1: "",
      customer2: "",
      amount2: "",
      cgst: "9",
      sgst: "9",
      connectorName: "",
      bankName: "",
      gstNumber: "",
      bankAccountType: "",
      panNumber: "",
      bankAccountNumber: "",
      ifscCode: "",
      branchName: "",
    });
  };

  if (showInvoice) {
    return <ReferralTaxInvoice invoiceData={invoiceData} onBack={() => setShowInvoice(false)} />;
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Details */}
          <div>
            <h3 className="font-medium mb-3">To,</h3>
            <h4 className="font-medium mb-3">Company Details:</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="companyName">Company Name:</Label>
                <Input
                  id="companyName"
                  placeholder="Company Name"
                  value={invoiceData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Address:</Label>
                <Input
                  id="address"
                  placeholder="Address"
                  value={invoiceData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="gstNo">GST NO:</Label>
                <Input
                  id="gstNo"
                  placeholder="Company GST Number"
                  value={invoiceData.gstNo}
                  onChange={(e) => handleInputChange("gstNo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stateCode">State code-</Label>
                <Input
                  id="stateCode"
                  placeholder="State Code"
                  value={invoiceData.stateCode}
                  onChange={(e) => handleInputChange("stateCode", e.target.value)}
                />
              </div>
            </div>
            <div className="w-1/2">
              <Label htmlFor="panNo">PAN NO:</Label>
              <Input
                id="panNo"
                placeholder="Company PAN Number"
                value={invoiceData.panNo}
                onChange={(e) => handleInputChange("panNo", e.target.value)}
              />
            </div>
          </div>

          {/* Billing Details */}
          <div>
            <h4 className="font-medium mb-3">Billing Details:</h4>
            <p className="text-sm text-gray-600 mb-3">Customer Names:(can add multiple names)</p>
            <Button variant="outline" size="sm" className="mb-4">Add Customer</Button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">1.</span>
                <Input
                  placeholder="Customer"
                  value={invoiceData.customer1}
                  onChange={(e) => handleInputChange("customer1", e.target.value)}
                  className="flex-1"
                />
                <span>→</span>
                <Input
                  placeholder="Customer amount"
                  value={invoiceData.amount1}
                  onChange={(e) => handleInputChange("amount1", e.target.value)}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">2.</span>
                <Input
                  placeholder="Customer"
                  value={invoiceData.customer2}
                  onChange={(e) => handleInputChange("customer2", e.target.value)}
                  className="flex-1"
                />
                <span>→</span>
                <Input
                  placeholder="Customer amount"
                  value={invoiceData.amount2}
                  onChange={(e) => handleInputChange("amount2", e.target.value)}
                  className="w-32"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Label>CGST:</Label>
                <Input
                  value={invoiceData.cgst}
                  onChange={(e) => handleInputChange("cgst", e.target.value)}
                  className="w-16"
                />
                <span>%</span>
              </div>
              <div className="flex items-center gap-2">
                <Label>SGST:</Label>
                <Input
                  value={invoiceData.sgst}
                  onChange={(e) => handleInputChange("sgst", e.target.value)}
                  className="w-16"
                />
                <span>%</span>
              </div>
            </div>
          </div>

          {/* Connector Details */}
          <div>
            <h4 className="font-medium mb-3">From,</h4>
            <h4 className="font-medium mb-3">Connector Details:</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="connectorName">Connector's Name:</Label>
                <Input
                  id="connectorName"
                  placeholder="Name"
                  value={invoiceData.connectorName}
                  onChange={(e) => handleInputChange("connectorName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bankName">Bank Name:</Label>
                <Input
                  id="bankName"
                  placeholder="Bank Name"
                  value={invoiceData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="gstNumber">GST NO:</Label>
                <Input
                  id="gstNumber"
                  placeholder="Company GST Number"
                  value={invoiceData.gstNumber}
                  onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bankAccountType">Bank Account Type:</Label>
                <Input
                  id="bankAccountType"
                  placeholder="Type"
                  value={invoiceData.bankAccountType}
                  onChange={(e) => handleInputChange("bankAccountType", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="panNumber">PAN NO:</Label>
                <Input
                  id="panNumber"
                  placeholder="Company PAN Number"
                  value={invoiceData.panNumber}
                  onChange={(e) => handleInputChange("panNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bankAccountNumber">Bank Account number:</Label>
                <Input
                  id="bankAccountNumber"
                  placeholder="Acc Number"
                  value={invoiceData.bankAccountNumber}
                  onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ifscCode">IFSC Code:</Label>
                <Input
                  id="ifscCode"
                  placeholder="IFSC"
                  value={invoiceData.ifscCode}
                  onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="branchName">Branch Name:</Label>
                <Input
                  id="branchName"
                  placeholder="Branch Name"
                  value={invoiceData.branchName}
                  onChange={(e) => handleInputChange("branchName", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={handleClear}>Clear</Button>
            <Button onClick={handleCreateInvoice} className="bg-indigo-600 hover:bg-indigo-700">
              Create Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralInvoice;
