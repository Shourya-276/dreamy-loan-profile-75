import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import BuilderLayout from "../components/BuilderLayout";
import CreateProjectModal from "../components/builder/CreateProjectModal";
import DocumentUploadModal from "../components/builder/DocumentUploadModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Edit, Trash2, Plus, ArrowLeft, Upload, Download, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const BuilderProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("projects"); // "projects", "apf-documents", "inventory"
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [apfDocuments, setApfDocuments] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [editingProject, setEditingProject] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user?.id]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/builder/projects/${user?.id}`, {
        headers: {
          "x-user-role": user?.role
        }
      });
      const result = await response.data;
      
      if (response.status === 200) {
        setProjects(result.projects || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to fetch projects"
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch projects"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAPFDocuments = async (projectId: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/builder/projects/${projectId}/apf-documents`, {
        headers: {
          "x-user-role": user?.role
        }
      });
      const result = await response.data;
      
      if (response.status === 200) {
        setApfDocuments(result.documents || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to fetch APF documents"
        });
      }
    } catch (error) {
      console.error("Error fetching APF documents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch APF documents"
      });
    }
  };

  const fetchInventoryData = async (projectId: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/builder/projects/${projectId}/inventory`, {
        headers: {
          "x-user-role": user?.role
        }
      });
      const result = await response.data;
      
      if (response.status === 200) {
        setInventoryData(result.inventory || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to fetch inventory data"
        });
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch inventory data"
      });
    }
  };

  const filteredProjects = projects.filter(project =>
    project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.address_line1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.address_line2?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAPFDocuments = async (project) => {
    setSelectedProject(project);
    setCurrentView("apf-documents");
    await fetchAPFDocuments(project.id);
  };

  const handleInventoryDetails = async (project) => {
    setSelectedProject(project);
    setCurrentView("inventory");
    await fetchInventoryData(project.id);
  };

  const handleBackToProjects = () => {
    setCurrentView("projects");
    setSelectedProject(null);
  };

  const handleUploadDocument = (document) => {
    // Force a new modal instance
    setModalKey(prev => prev + 1);
    setSelectedDocument(document);
    setUploadModalOpen(true);
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/builder/projects/documents/${doc.id}/download`,
        {
          headers: {
            "x-user-role": user?.role
          }
        }
      );
  
      const { downloadUrl, fileName } = response.data;
  
      // Fetch the file using axios with blob response type
      const fileResponse = await axios.get(downloadUrl, {
        responseType: 'blob'
      });
  
      // Create a download link with the blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(fileResponse.data);
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Clean up the object URL
      window.URL.revokeObjectURL(link.href);
  
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download document. Please try again."
      });
    }
  };
  
  

  const handleViewDocument = async (document) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/builder/projects/documents/${document.id}/download`,
        {
          headers: {
            "x-user-role": user?.role
          }
        }
      );

      const { downloadUrl } = response.data;
      
      // Open document in new tab
      window.open(downloadUrl, '_blank');

    } catch (error) {
      console.error("View error:", error);
      toast({
        variant: "destructive",
        title: "View failed",
        description: "Failed to view document. Please try again."
      });
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsCreateProjectModalOpen(true);
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.project_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/builder/projects/${project.id}`,
        {
          headers: {
            "x-user-role": user?.role
          }
        }
      );

      toast({
        title: "Success",
        description: "Project deleted successfully!"
      });

      // Refresh projects list
      fetchProjects();

    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete project. Please try again."
      });
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/builder/projects/apf-documents/${doc.id}`,
        {
          headers: { "x-user-role": user?.role }
        }
      );
      toast({
        title: "Success",
        description: "Document deleted successfully!"
      });
      if (selectedProject) fetchAPFDocuments(selectedProject.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete document. Please try again."
      });
    }
  };

  // APF Documents View
  if (currentView === "apf-documents") {
    return (
      <BuilderLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToProjects}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">APF Document Submission</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg">
            <div className="space-y-1">
              {apfDocuments.map((doc, index) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{doc.document_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">JPG/PNG/PDF format accepted</p>
                    <p className="text-xs text-gray-400 mt-1">Status: {doc.upload_status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!doc.file_path && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleUploadDocument(doc)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    )}
                    {doc.file_path && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-600 hover:text-purple-700"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteDocument(doc)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <Button className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white">
                Save Document
              </Button>
            </div>
          </div>

          {/* Document Upload Modal for APF Documents */}
          {uploadModalOpen && selectedDocument && (
            <DocumentUploadModal
              key={modalKey}
              isOpen={uploadModalOpen}
              onClose={() => {
                setUploadModalOpen(false);
                setSelectedDocument(null);
              }}
              document={selectedDocument}
              onUploadSuccess={() => {
                if (selectedProject) {
                  fetchAPFDocuments(selectedProject.id);
                }
              }}
            />
          )}
        </div>
      </BuilderLayout>
    );
  }

  // Inventory Details View
  if (currentView === "inventory") {
    return (
      <BuilderLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToProjects}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by Lead Name, Lead ID"
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-600 font-medium">Wing</TableHead>
                  <TableHead className="text-blue-600 font-medium">Floor</TableHead>
                  <TableHead className="text-blue-600 font-medium">Flat No.</TableHead>
                  <TableHead className="text-blue-600 font-medium">RERA Carpet</TableHead>
                  <TableHead className="text-blue-600 font-medium">Customer Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.wing}</TableCell>
                    <TableCell>{item.floor}</TableCell>
                    <TableCell>{item.flat_number}</TableCell>
                    <TableCell>{item.rera_carpet_area}</TableCell>
                    <TableCell>{item.customer_name || "Not Assigned"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </BuilderLayout>
    );
  }

  // Main Projects View
  return (
    <BuilderLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Overview</h1>
          <Button 
            className="bg-brand-purple hover:bg-brand-purple/90 text-white"
            onClick={() => setIsCreateProjectModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search Project by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No projects found. Create your first project to get started!</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {project.project_name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        {project.developer_name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {[project.address_line1, project.address_line2, project.city, project.state, project.pincode].filter(Boolean).join(", ")}
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          className="bg-brand-purple hover:bg-brand-purple/90 text-white px-6"
                          onClick={() => handleAPFDocuments(project)}
                        >
                          APF Documents
                        </Button>
                        <Button 
                          variant="outline"
                          className="px-6"
                          onClick={() => handleInventoryDetails(project)}
                        >
                          Inventory Details
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProject(project)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Show More Button */}
        <div className="flex justify-center pt-4">
          <Button variant="link" className="text-gray-600 underline">
            Show More
          </Button>
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => {
            setIsCreateProjectModalOpen(false);
            setEditingProject(null);
          }}
          onProjectCreated={fetchProjects}
          editingProject={editingProject}
        />

        {/* Document Upload Modal */}
        {uploadModalOpen && selectedDocument && (
          <DocumentUploadModal
            key={modalKey}
            isOpen={uploadModalOpen}
            onClose={() => {
              setUploadModalOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            onUploadSuccess={() => {
              if (selectedProject) {
                fetchAPFDocuments(selectedProject.id);
              }
            }}
          />
        )}
      </div>
    </BuilderLayout>
  );
};

export default BuilderProjects;
