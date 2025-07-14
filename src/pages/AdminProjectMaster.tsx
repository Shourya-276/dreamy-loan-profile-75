
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminProjectMaster = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState("");

  // Sample project data - in a real app, this would come from an API
  const projects = [
    { id: "swastik-platinum", name: "Swastik Platinum" },
    { id: "vighnaharta", name: "Vighnaharta" },
    { id: "onyx", name: "Onyx" },
    { id: "vaibhav-laxmi", name: "Vaibhav Laxmi" }
  ];

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      navigate(`/admin-project-documents/${projectId}`, { 
        state: { projectName: project.name } 
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin-masters")}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Masters</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Master</h1>
          <p className="text-gray-600 dark:text-gray-400">Select a project to manage its documents</p>
        </div>

        {/* Project Selection Card */}
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-lg">Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProject} onValueChange={handleProjectSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProjectMaster;
