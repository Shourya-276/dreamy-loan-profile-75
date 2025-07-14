
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, FolderOpen, Users, TrendingUp, Building, Layers, DollarSign, MapPin } from "lucide-react";

const AdminMasters = () => {
  const navigate = useNavigate();

  const masterItems = [
    {
      icon: FolderOpen,
      title: "Project",
      description: "",
      onClick: () => navigate("/admin-project-master")
    },
    {
      icon: DollarSign,
      title: "Commission Master",
      description: ""
    },
    {
      icon: TrendingUp,
      title: "Incentive",
      description: ""
    },
    {
      icon: Users,
      title: "Employee Master",
      description: "For Employee Details",
      onClick: () => navigate("/admin-employee-master")
    },
    {
      icon: Layers,
      title: "Hierarchy Master",
      description: ""
    },
    {
      icon: Building,
      title: "Bank wise ROI",
      description: "",
      onClick: () => navigate("/admin-bank-roi-master")
    },
    {
      icon: MapPin,
      title: "Bank wise Branches",
      description: ""
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Masters</h1>
        </div>

        {/* Masters Grid */}
        <div className="grid grid-cols-1 gap-4">
          {masterItems.map((item, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={item.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMasters;
