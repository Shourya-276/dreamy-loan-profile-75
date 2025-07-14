
import React from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

const AdminInvoice = () => {
  const invoiceApprovals = [
    {
      id: "#1",
      name: "Priya Mehta",
      loanType: "HL",
      bankName: "SBI",
      status: "Approve"
    },
    {
      id: "#2",
      name: "Rajesh Sharma",
      loanType: "HL", 
      bankName: "SBI",
      status: "Approve"
    },
    {
      id: "#3",
      name: "Anil Gupta",
      loanType: "HL",
      bankName: "SBI", 
      status: "Approve"
    },
    {
      id: "#4",
      name: "Rajesh Sharma",
      loanType: "HL",
      bankName: "SBI",
      status: "Approve"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Approval</h1>
        </div>

        {/* Invoice Approval Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Lead Number</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Invoice</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Loan type</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Bank Name</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceApprovals.map((invoice, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 text-sm">{invoice.id}</td>
                      <td className="py-3 text-sm">view</td>
                      <td className="py-3 text-sm">{invoice.name}</td>
                      <td className="py-3 text-sm">{invoice.loanType}</td>
                      <td className="py-3 text-sm">{invoice.bankName}</td>
                      <td className="py-3 text-sm">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded">
                          {invoice.status}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Invoice Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Create Invoice</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Bank wise</label>
                <Select>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sbi">SBI</SelectItem>
                    <SelectItem value="hdfc">HDFC</SelectItem>
                    <SelectItem value="icici">ICICI</SelectItem>
                    <SelectItem value="kotak">Kotak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminInvoice;
