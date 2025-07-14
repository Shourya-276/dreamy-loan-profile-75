
import React from "react";
import BuilderLayout from "../components/BuilderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BuilderDashboard = () => {
  const clientsData = [
    {
      name: "Emily Carter",
      email: "emily.carter@example.com",
      phone: "(555) 123-456"
    },
    {
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "(555) 987-654"
    },
    {
      name: "Sasha Clark",
      email: "sasha.clark@example.com",
      phone: "(555) 246-801"
    },
    {
      name: "Ethan Harris",
      email: "ethan.harris@example.com",
      phone: "(555) 369-174"
    },
    {
      name: "Olivia White",
      email: "olivia.white@example.com",
      phone: "(555) 789-012"
    }
  ];

  return (
    <BuilderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">120</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
              <p className="text-xs text-gray-500">Completed</p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">85</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ongoing Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">15</div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsData.map((client, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{client.name}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{client.email}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{client.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </BuilderLayout>
  );
};

export default BuilderDashboard;
