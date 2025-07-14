
import React, { useState, useMemo } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Eye, Edit, Trash2 } from "lucide-react";

const SuperAdminProjectMaster = () => {
  // Sample project data
  const projectsData = [
    {
      id: 1,
      projectName: "Skyline Residency",
      builderName: "ABC Builders",
      location: "Mumbai",
      status: "Active",
      totalUnits: 150,
      soldUnits: 120,
      reraNumber: "P52016000123",
      launchDate: "2024-01-15"
    },
    {
      id: 2,
      projectName: "Greenwood Villas",
      builderName: "XYZ Constructions",
      location: "Pune",
      status: "Active",
      totalUnits: 80,
      soldUnits: 65,
      reraNumber: "P52017000456",
      launchDate: "2024-02-20"
    },
    {
      id: 3,
      projectName: "Palm Grove",
      builderName: "DEF Developers",
      location: "Bangalore",
      status: "Completed",
      totalUnits: 200,
      soldUnits: 200,
      reraNumber: "P52018000789",
      launchDate: "2023-06-10"
    }
  ];

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Get unique values for filters
  const uniqueStatuses = [...new Set(projectsData.map(project => project.status))];
  const uniqueLocations = [...new Set(projectsData.map(project => project.location))];

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projectsData.filter(project => {
      const matchesSearch = searchTerm === "" || 
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.builderName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesLocation = locationFilter === "all" || project.location === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [searchTerm, statusFilter, locationFilter, projectsData]);

  const handleDownloadExcel = async () => {
    try {
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      const XLSX = XLSXModule.default || XLSXModule;

      const excelData = filteredProjects.map(project => ({
        'Project Name': project.projectName,
        'Builder Name': project.builderName,
        'Location': project.location,
        'Status': project.status,
        'Total Units': project.totalUnits,
        'Sold Units': project.soldUnits,
        'RERA Number': project.reraNumber,
        'Launch Date': project.launchDate
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 25 }, // Project Name
        { wch: 20 }, // Builder Name
        { wch: 15 }, // Location
        { wch: 12 }, // Status
        { wch: 12 }, // Total Units
        { wch: 12 }, // Sold Units
        { wch: 18 }, // RERA Number
        { wch: 15 }  // Launch Date
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Projects');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Projects_${dateStr}.xlsx`;

      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Master</h1>
          <div className="flex space-x-4">
            <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Excel
            </Button>
          </div>
        </div>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="w-full max-w-md">
                <Input
                  placeholder="Search by project name or builder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Statuses</SelectItem>
                      {uniqueStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Projects Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Project Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Builder Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Location</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Total Units</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Sold Units</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">RERA Number</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Launch Date</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b">
                      <td className="py-3 text-sm">{project.projectName}</td>
                      <td className="py-3 text-sm">{project.builderName}</td>
                      <td className="py-3 text-sm">{project.location}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'Active' ? 'bg-green-100 text-green-800' :
                          project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm">{project.totalUnits}</td>
                      <td className="py-3 text-sm">{project.soldUnits}</td>
                      <td className="py-3 text-sm">{project.reraNumber}</td>
                      <td className="py-3 text-sm">{project.launchDate}</td>
                      <td className="py-3 text-sm">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminProjectMaster;
