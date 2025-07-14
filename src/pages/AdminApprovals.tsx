
import React from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminApprovals = () => {
  const connectorApprovals = [
    {
      id: "#50",
      name: "Priya Mehta",
      email: "connector@gmail.com",
      action: "view"
    },
    {
      id: "#220",
      name: "Rajesh Sharma", 
      email: "connector@gmail.com",
      action: "view"
    },
    {
      id: "#140",
      name: "Anil Gupta",
      email: "connector@gmail.com", 
      action: "view"
    },
    {
      id: "#40",
      name: "Rajesh Sharma",
      email: "connector@gmail.com",
      action: "view"
    }
  ];

  const referralApprovals = [
    {
      id: "#90",
      name: "Priya Mehta",
      email: "connector@gmail.com",
      action: "view"
    },
    {
      id: "#221",
      name: "Rajesh Sharma",
      email: "connector@gmail.com", 
      action: "view"
    },
    {
      id: "#140",
      name: "Anil Gupta",
      email: "connector@gmail.com",
      action: "view"
    },
    {
      id: "#40",
      name: "Rajesh Sharma", 
      email: "connector@gmail.com",
      action: "view"
    }
  ];

  const employeeProfiles = [
    {
      id: "#80",
      name: "Priya Mehta",
      email: "connector@gmail.com",
      action: "view"
    },
    {
      id: "#221",
      name: "Rajesh Sharma",
      email: "connector@gmail.com",
      action: "view"
    }
  ];

  const ApprovalTable = ({ title, data }: { title: string; data: any[] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-500">
                  {title.includes('Employee') ? 'Employee Number' : 
                   title.includes('Referral') ? "Referral's Number" : 'Connector'}
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">profile</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Approve</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 text-sm">{item.id}</td>
                  <td className="py-3 text-sm">{item.name}</td>
                  <td className="py-3 text-sm">{item.email}</td>
                  <td className="py-3 text-sm">{item.action}</td>
                  <td className="py-3 text-sm">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded">
                      Approve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h1>
        </div>

        {/* Connector's Profile Approval */}
        <ApprovalTable title="Connector's profile Approval" data={connectorApprovals} />

        {/* Referral's Profile Approval */}
        <ApprovalTable title="Referral's profile Approval" data={referralApprovals} />

        {/* Employee's Profile */}
        <ApprovalTable title="Employee's profile" data={employeeProfiles} />
      </div>
    </AdminLayout>
  );
};

export default AdminApprovals;
