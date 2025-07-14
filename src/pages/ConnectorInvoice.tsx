
import React, { useState } from "react";
import ConnectorLayout from "../components/ConnectorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const ConnectorInvoice = () => {
  const [showTaxInvoice, setShowTaxInvoice] = useState(false);
  const [formData, setFormData] = useState({
    // Company Details
    companyName: "",
    address: "",
    gstNo: "",
    stateCode: "",
    panNo: "",
    
    // Billing Details
    customers: [{ name: "", consideredAmount: "", amount: "" }, { name: "", consideredAmount: "", amount: "" }],
    cgstRate: "9",
    sgstRate: "9",
    
    // Connector Details
    connectorName: "",
    connectorGstNo: "",
    connectorPanNo: "",
    bankName: "",
    bankAccountType: "",
    bankAccountNumber: "",
    ifscCode: "",
    branchName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (index: number, field: string, value: string) => {
    const updatedCustomers = [...formData.customers];
    updatedCustomers[index] = { ...updatedCustomers[index], [field]: value };
    setFormData(prev => ({ ...prev, customers: updatedCustomers }));
  };

  const addCustomer = () => {
    setFormData(prev => ({
      ...prev,
      customers: [...prev.customers, { name: "", consideredAmount: "", amount: "" }]
    }));
  };

  const removeCustomer = (index: number) => {
    if (formData.customers.length > 1) {
      const updatedCustomers = formData.customers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, customers: updatedCustomers }));
    }
  };

  const handleCreateInvoice = () => {
    setShowTaxInvoice(true);
  };

  if (showTaxInvoice) {
    return (
      <ConnectorLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Tax Invoice</h1>
            
            {/* Company Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Company details:</h3>
              <p className="text-gray-700 dark:text-gray-300">Invoice No: [27482162]</p>
              <p className="text-gray-700 dark:text-gray-300">Date: [01/04/2024]</p>
              <p className="font-semibold text-gray-900 dark:text-white">To,</p>
              <p className="text-gray-700 dark:text-gray-300">Loan For India</p>
              <p className="text-gray-700 dark:text-gray-300">g/806/906/9th Floor, Damji Shamji Corporate Square Ghatkopar East-77</p>
              <p className="text-gray-700 dark:text-gray-300">GST NO: [GST Number]</p>
              <p className="text-gray-700 dark:text-gray-300">PAN NO: [PAN Number]</p>
              <p className="text-gray-700 dark:text-gray-300">State Code: [State Code]</p>
            </div>

            {/* Invoice Table */}
            <div className="mb-6">
              <table className="w-full border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Description</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.customers.map((customer, index) => (
                    customer.name && (
                      <tr key={index}>
                        <td className="border border-gray-300 dark:border-gray-600 p-2">{customer.name}</td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2 text-right">{customer.amount}</td>
                      </tr>
                    )
                  ))}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-semibold">CGST ({formData.cgstRate}%)</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-right">₹0</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-semibold">SGST ({formData.sgstRate}%)</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-right">₹0</td>
                  </tr>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-bold">Total</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-right font-bold">₹0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setShowTaxInvoice(false)}
                variant="outline"
              >
                Back to Form
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </ConnectorLayout>
    );
  }

  return (
    <ConnectorLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Invoice</h1>
          
          <div className="space-y-6">
            {/* Company Details */}
            <div>
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">To,</h3>
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Company Details:</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name:</label>
                  <Input
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address:</label>
                  <Input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST NO:</label>
                  <Input
                    placeholder="Company GST Number"
                    value={formData.gstNo}
                    onChange={(e) => handleInputChange("gstNo", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State code:</label>
                  <Input
                    placeholder="State Code"
                    value={formData.stateCode}
                    onChange={(e) => handleInputChange("stateCode", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN NO:</label>
                <Input
                  placeholder="Company PAN Number"
                  value={formData.panNo}
                  onChange={(e) => handleInputChange("panNo", e.target.value)}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Billing Details */}
            <div>
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Billing Details:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Customer Names: (can add multiple names)</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-4"
                onClick={addCustomer}
              >
                Add Customer
              </Button>
              
              <div className="space-y-3">
                {formData.customers.map((customer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm min-w-[20px]">{index + 1}.</span>
                    <Input
                      placeholder="Customer"
                      value={customer.name}
                      onChange={(e) => handleCustomerChange(index, "name", e.target.value)}
                      className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <span>→</span>
                    <Input
                      placeholder="Considered Amount"
                      value={customer.consideredAmount}
                      onChange={(e) => handleCustomerChange(index, "consideredAmount", e.target.value)}
                      className="w-32 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <span>→</span>
                    <Input
                      placeholder="Commission Amount"
                      value={customer.amount}
                      onChange={(e) => handleCustomerChange(index, "amount", e.target.value)}
                      className="w-32 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    {formData.customers.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomer(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CGST:</label>
                  <Input
                    value={formData.cgstRate}
                    onChange={(e) => handleInputChange("cgstRate", e.target.value)}
                    className="w-16 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <span className="text-gray-700 dark:text-gray-300">%</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SGST:</label>
                  <Input
                    value={formData.sgstRate}
                    onChange={(e) => handleInputChange("sgstRate", e.target.value)}
                    className="w-16 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <span className="text-gray-700 dark:text-gray-300">%</span>
                </div>
              </div>
            </div>

            {/* Connector Details */}
            <div>
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">From,</h4>
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Connector Details:</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Connector's Name:</label>
                  <Input
                    placeholder="Name"
                    value={formData.connectorName}
                    onChange={(e) => handleInputChange("connectorName", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name:</label>
                  <Input
                    placeholder="Bank Name"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST NO:</label>
                  <Input
                    placeholder="Company GST Number"
                    value={formData.connectorGstNo}
                    onChange={(e) => handleInputChange("connectorGstNo", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Account Type:</label>
                  <Input
                    placeholder="Type"
                    value={formData.bankAccountType}
                    onChange={(e) => handleInputChange("bankAccountType", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN NO:</label>
                  <Input
                    placeholder="Company PAN Number"
                    value={formData.connectorPanNo}
                    onChange={(e) => handleInputChange("connectorPanNo", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Account number:</label>
                  <Input
                    placeholder="Acc Number"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code:</label>
                  <Input
                    placeholder="IFSC"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Name:</label>
                  <Input
                    placeholder="Branch Name"
                    value={formData.branchName}
                    onChange={(e) => handleInputChange("branchName", e.target.value)}
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setFormData({
                  companyName: "",
                  address: "",
                  gstNo: "",
                  stateCode: "",
                  panNo: "",
                  customers: [{ name: "", consideredAmount: "", amount: "" }, { name: "", consideredAmount: "", amount: "" }],
                  cgstRate: "9",
                  sgstRate: "9",
                  connectorName: "",
                  connectorGstNo: "",
                  connectorPanNo: "",
                  bankName: "",
                  bankAccountType: "",
                  bankAccountNumber: "",
                  ifscCode: "",
                  branchName: "",
                })}
              >
                Clear
              </Button>
              <Button 
                onClick={handleCreateInvoice} 
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ConnectorLayout>
  );
};

export default ConnectorInvoice;
