
/**
 * REFERRAL TAX INVOICE COMPONENT
 * 
 * This component displays the generated tax invoice in the exact format
 * shown in the reference image. It includes all company details, billing
 * information, and payment details.
 * 
 * USAGE:
 * - Used by ReferralInvoice.tsx to display the generated invoice
 * - Shows formatted tax invoice with all details
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InvoiceData {
  companyName: string;
  address: string;
  gstNo: string;
  stateCode: string;
  panNo: string;
  customer1: string;
  amount1: string;
  customer2: string;
  amount2: string;
  cgst: string;
  sgst: string;
  connectorName: string;
  bankName: string;
  gstNumber: string;
  bankAccountType: string;
  panNumber: string;
  bankAccountNumber: string;
  ifscCode: string;
  branchName: string;
}

interface ReferralTaxInvoiceProps {
  invoiceData: InvoiceData;
  onBack: () => void;
}

const ReferralTaxInvoice: React.FC<ReferralTaxInvoiceProps> = ({ invoiceData, onBack }) => {
  const amount1 = parseFloat(invoiceData.amount1) || 0;
  const amount2 = parseFloat(invoiceData.amount2) || 0;
  const totalAmount = amount1 + amount2;
  const cgstAmount = (totalAmount * parseFloat(invoiceData.cgst)) / 100;
  const sgstAmount = (totalAmount * parseFloat(invoiceData.sgst)) / 100;
  const totalPayable = totalAmount + cgstAmount + sgstAmount;

  const currentDate = new Date().toLocaleDateString('en-GB');

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex gap-2">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button variant="outline">📥 View History</Button>
        <Button variant="outline">⬇️ Download</Button>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center mb-2">Tax Invoice</h1>
            
            {/* Company Details */}
            <div className="mb-4">
              <h3 className="font-semibold">Company details:</h3>
              <div className="text-sm">
                <div>Invoice No: [27462862]</div>
                <div>Date: [{currentDate}]</div>
                <div>To,</div>
                <div>Loan For India</div>
                <div>B/905/906/8th Floor, Domji Shamji Corporate Square Ghatkopar East-77</div>
                <div>GST No: [GST Number]</div>
                <div>PAN No: [PAN Number]</div>
                <div>State Code: [State Code]</div>
              </div>
            </div>
          </div>

          {/* Invoice Details Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Sr. No</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Particulars</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">TAX</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Commission Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">#1</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Payment Of<br />
                    1-Mr Ajinkya Gosavi<br />
                    2-Ratnkar Gosavi
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    ₹{amount1.toLocaleString()}<br />
                    ₹{amount2.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2">
                    ₹{amount1.toLocaleString()}<br />
                    ₹{amount2.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Total amount</td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">₹{totalAmount.toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">₹{totalAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2">CGST @ {invoiceData.cgst}%</td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2">{invoiceData.cgst}%</td>
                  <td className="border border-gray-300 px-4 py-2">₹{cgstAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2">SGST @ {invoiceData.sgst}%</td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2">{invoiceData.sgst}%</td>
                  <td className="border border-gray-300 px-4 py-2">₹{sgstAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Total Payable</td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">₹{totalPayable.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Connector Details */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Connector Details:</h3>
            <div className="text-sm space-y-1">
              <div>Cheque Favouring/Connector name</div>
              <div>Bank name: [Bank Name]</div>
              <div>GST No: [Your GST Number]</div>
              <div>PAN No: [Your PAN Number]</div>
              <div>Account No: [Account Number]</div>
              <div>Account Type: [e.g., Current Account]</div>
              <div>IFSC Code: [IFSC Code]</div>
              <div>Branch Name: [Branch Name]</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralTaxInvoice;
