
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Eye, Download, Upload } from "lucide-react";

const AdminProjectDocuments = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectName = location.state?.projectName || "Unknown Project";

  // Sample APF documents data - in a real app, this would come from an API
  const apfDocuments = [
    {
      id: 1,
      name: "Building Approval Certificate",
      fileUrl: "/sample-document.pdf",
      uploaded: true
    },
    {
      id: 2,
      name: "Occupancy Certificate",
      fileUrl: "/sample-document.pdf",
      uploaded: true
    },
    {
      id: 3,
      name: "Completion Certificate",
      fileUrl: "/sample-document.pdf",
      uploaded: false
    },
    {
      id: 4,
      name: "NOC from Fire Department",
      fileUrl: "/sample-document.pdf",
      uploaded: true
    }
  ];

  const handleView = (document: any) => {
    // Open document in new tab
    window.open(document.fileUrl, '_blank');
  };

  const handleDownload = (document: any) => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = document.fileUrl;
    link.download = `${document.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin-project-master")}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Project Master</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project Master - {projectName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage APF documents for this project</p>
        </div>

        {/* Building Inventory Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Building Inventory</span>
              <Button size="sm" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Drag file here or Browse</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium">Document Uploaded</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* APF Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>APF Documents List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr.no</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apfDocuments.map((document, index) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{document.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(document)}
                          className="flex items-center space-x-1"
                          disabled={!document.uploaded}
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(document)}
                          className="flex items-center space-x-1"
                          disabled={!document.uploaded}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProjectDocuments;
