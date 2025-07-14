
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

interface Wing {
  id: string;
  wingNumber: string;
  numberOfFloors: number;
  numberOfFlatsPerFloor: number;
}

interface Bank {
  id: string;
  bankName: string;
  apfNumber: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
  editingProject?: any;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onProjectCreated, editingProject }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: "",
    developerName: "",
    reraNumber: "",
    totalInventory: "",
    numberOfTenants: "",
    numberOfSaleFlats: "",
    numberOfCommercialUnits: "",
    projectType: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    ctsNumber: "",
    pincode: "",
    state: "",
    city: "",
    district: ""
  });

  const [wings, setWings] = useState<Wing[]>([
    { id: "1", wingNumber: "", numberOfFloors: 0, numberOfFlatsPerFloor: 0 }
  ]);

  const [banks, setBanks] = useState<Bank[]>([
    { id: "1", bankName: "", apfNumber: "" }
  ]);

  // Populate form when editing
  useEffect(() => {
    if (editingProject) {
      setFormData({
        projectName: editingProject.project_name || "",
        developerName: editingProject.developer_name || "",
        reraNumber: editingProject.rera_number || "",
        totalInventory: editingProject.total_inventory?.toString() || "",
        numberOfTenants: editingProject.number_of_tenants?.toString() || "",
        numberOfSaleFlats: editingProject.number_of_sale_flats?.toString() || "",
        numberOfCommercialUnits: editingProject.number_of_commercial_units?.toString() || "",
        projectType: editingProject.project_type || "",
        addressLine1: editingProject.address_line1 || "",
        addressLine2: editingProject.address_line2 || "",
        landmark: editingProject.landmark || "",
        ctsNumber: editingProject.cts_number || "",
        pincode: editingProject.pincode || "",
        state: editingProject.state || "",
        city: editingProject.city || "",
        district: editingProject.district || ""
      });

      // Fetch and populate wings and banks
      fetchProjectDetails(editingProject.id);
    } else {
      // Reset form for new project
      setFormData({
        projectName: "",
        developerName: "",
        reraNumber: "",
        totalInventory: "",
        numberOfTenants: "",
        numberOfSaleFlats: "",
        numberOfCommercialUnits: "",
        projectType: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        ctsNumber: "",
        pincode: "",
        state: "",
        city: "",
        district: ""
      });
      setWings([{ id: "1", wingNumber: "", numberOfFloors: 0, numberOfFlatsPerFloor: 0 }]);
      setBanks([{ id: "1", bankName: "", apfNumber: "" }]);
    }
  }, [editingProject]);

  const fetchProjectDetails = async (projectId: number) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/builder/projects/details/${projectId}`,
        {
          headers: {
            "x-user-role": user?.role
          }
        }
      );

      const { project } = response.data;
      
      // Populate wings
      if (project.wings && project.wings.length > 0) {
        const projectWings = project.wings.map((wing: any, index: number) => ({
          id: wing.id?.toString() || (index + 1).toString(),
          wingNumber: wing.wing_number || "",
          numberOfFloors: wing.number_of_floors || 0,
          numberOfFlatsPerFloor: wing.number_of_flats_per_floor || 0
        }));
        setWings(projectWings);
      }

      // Populate banks
      if (project.banks && project.banks.length > 0) {
        const projectBanks = project.banks.map((bank: any, index: number) => ({
          id: bank.id?.toString() || (index + 1).toString(),
          bankName: bank.bank_name || "",
          apfNumber: bank.apf_number || ""
        }));
        setBanks(projectBanks);
      }

    } catch (error) {
      console.error("Error fetching project details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fetch location data when pincode is entered (6 digits)
    if (field === "pincode" && value.length === 6) {
      fetchLocationData(value);
    }
  };

  const fetchLocationData = async (pincode: string) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === "Success") {
        const locationData = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          state: locationData.State || "",
          city: locationData.District || "",
          district: locationData.District || ""
        }));
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const addWing = () => {
    const newWing: Wing = {
      id: Date.now().toString(),
      wingNumber: "",
      numberOfFloors: 0,
      numberOfFlatsPerFloor: 0
    };
    setWings(prev => [...prev, newWing]);
  };

  const removeWing = (id: string) => {
    if (wings.length > 1) {
      setWings(prev => prev.filter(wing => wing.id !== id));
    }
  };

  const updateWing = (id: string, field: keyof Wing, value: string | number) => {
    setWings(prev => prev.map(wing => 
      wing.id === id ? { ...wing, [field]: value } : wing
    ));
  };

  const addBank = () => {
    const newBank: Bank = {
      id: Date.now().toString(),
      bankName: "",
      apfNumber: ""
    };
    setBanks(prev => [...prev, newBank]);
  };

  const removeBank = (id: string) => {
    if (banks.length > 1) {
      setBanks(prev => prev.filter(bank => bank.id !== id));
    }
  };

  const updateBank = (id: string, field: keyof Bank, value: string) => {
    setBanks(prev => prev.map(bank => 
      bank.id === id ? { ...bank, [field]: value } : bank
    ));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.projectName || !formData.developerName || !formData.reraNumber) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "User not authenticated."
      });
      return;
    }

    setIsLoading(true);

    try {
      const projectData = {
        builderId: user.id,
        projectName: formData.projectName,
        developerName: formData.developerName,
        reraNumber: formData.reraNumber,
        totalInventory: formData.totalInventory ? parseInt(formData.totalInventory) : null,
        numberOfTenants: formData.numberOfTenants ? parseInt(formData.numberOfTenants) : null,
        numberOfSaleFlats: formData.numberOfSaleFlats ? parseInt(formData.numberOfSaleFlats) : null,
        numberOfCommercialUnits: formData.numberOfCommercialUnits ? parseInt(formData.numberOfCommercialUnits) : null,
        projectType: formData.projectType,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        landmark: formData.landmark,
        ctsNumber: formData.ctsNumber,
        pincode: formData.pincode,
        state: formData.state,
        city: formData.city,
        district: formData.district,
        wings: wings.filter(wing => wing.wingNumber && wing.numberOfFloors && wing.numberOfFlatsPerFloor),
        banks: banks.filter(bank => bank.bankName && bank.apfNumber)
      };
      // Add user role in header
      let response;
      if (editingProject) {
        // Update existing project
        response = await axios.put(
          `${import.meta.env.VITE_SERVER_URL}/builder/projects/${editingProject.id}`,
          projectData,
          {
            headers: {
              "x-user-role": user?.role
            }
          }
        );
      } else {
        // Create new project
        response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/builder/projects`,
          projectData,
          {
            headers: {
              "x-user-role": user?.role
            }
          }
        );
      }

      const result = await response.data;

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Success",
          description: editingProject ? "Project updated successfully!" : "Project created successfully!"
        });
        
        handleClear();
        onClose();
        
        // Notify parent component to refresh the project list
        if (onProjectCreated) {
          onProjectCreated();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create project"
        });
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create project. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      projectName: "",
      developerName: "",
      reraNumber: "",
      totalInventory: "",
      numberOfTenants: "",
      numberOfSaleFlats: "",
      numberOfCommercialUnits: "",
      projectType: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      ctsNumber: "",
      pincode: "",
      state: "",
      city: "",
      district: ""
    });
    
    setWings([{ id: "1", wingNumber: "", numberOfFloors: 0, numberOfFlatsPerFloor: 0 }]);
    setBanks([{ id: "1", bankName: "", apfNumber: "" }]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingProject ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange("projectName", e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="developerName">Developer Name *</Label>
                  <Input
                    id="developerName"
                    value={formData.developerName}
                    onChange={(e) => handleInputChange("developerName", e.target.value)}
                    placeholder="Enter developer name"
                  />
                </div>
                <div>
                  <Label htmlFor="reraNumber">RERA Number *</Label>
                  <Input
                    id="reraNumber"
                    value={formData.reraNumber}
                    onChange={(e) => handleInputChange("reraNumber", e.target.value)}
                    placeholder="Enter RERA number"
                  />
                </div>
                <div>
                  <Label htmlFor="totalInventory">Total Inventory</Label>
                  <Input
                    id="totalInventory"
                    type="number"
                    value={formData.totalInventory}
                    onChange={(e) => handleInputChange("totalInventory", e.target.value)}
                    placeholder="Enter total inventory"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfTenants">Number of Tenants</Label>
                  <Input
                    id="numberOfTenants"
                    type="number"
                    value={formData.numberOfTenants}
                    onChange={(e) => handleInputChange("numberOfTenants", e.target.value)}
                    placeholder="Enter number of tenants"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfSaleFlats">Number of Sale Flats</Label>
                  <Input
                    id="numberOfSaleFlats"
                    type="number"
                    value={formData.numberOfSaleFlats}
                    onChange={(e) => handleInputChange("numberOfSaleFlats", e.target.value)}
                    placeholder="Enter number of sale flats"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfCommercialUnits">Number of Commercial Units</Label>
                  <Input
                    id="numberOfCommercialUnits"
                    type="number"
                    value={formData.numberOfCommercialUnits}
                    onChange={(e) => handleInputChange("numberOfCommercialUnits", e.target.value)}
                    placeholder="Enter number of commercial units"
                  />
                </div>
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Re-development">Re-development</SelectItem>
                      <SelectItem value="FREE HOLD">FREE HOLD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                    placeholder="Enter address line 1"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                    placeholder="Enter address line 2"
                  />
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => handleInputChange("landmark", e.target.value)}
                    placeholder="Enter landmark"
                  />
                </div>
                <div>
                  <Label htmlFor="ctsNumber">CTS Number</Label>
                  <Input
                    id="ctsNumber"
                    value={formData.ctsNumber}
                    onChange={(e) => handleInputChange("ctsNumber", e.target.value)}
                    placeholder="Enter CTS number"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    type="number"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    placeholder="Enter pincode"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                    placeholder="Auto-filled from pincode"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                    placeholder="Auto-filled from pincode"
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                    placeholder="Auto-filled from pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wings Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wings Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Wing Number</th>
                      <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Number of Floors</th>
                      <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Number of Flats Per Floor</th>
                      <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wings.map((wing) => (
                      <tr key={wing.id} className="border-b">
                        <td className="p-3">
                          <Input
                            value={wing.wingNumber}
                            onChange={(e) => updateWing(wing.id, "wingNumber", e.target.value)}
                            placeholder="Wing A, B, etc."
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={wing.numberOfFloors}
                            onChange={(e) => updateWing(wing.id, "numberOfFloors", parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={wing.numberOfFlatsPerFloor}
                            onChange={(e) => updateWing(wing.id, "numberOfFlatsPerFloor", parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWing(wing.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={wings.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                variant="outline"
                onClick={addWing}
                className="mt-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </Button>
            </CardContent>
          </Card>

          {/* Banks Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bank Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Bank Name</th>
                      <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">APF Number</th>
                      <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((bank) => (
                      <tr key={bank.id} className="border-b">
                        <td className="p-3">
                          <Input
                            value={bank.bankName}
                            onChange={(e) => updateBank(bank.id, "bankName", e.target.value)}
                            placeholder="Bank name"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            value={bank.apfNumber}
                            onChange={(e) => updateBank(bank.id, "apfNumber", e.target.value)}
                            placeholder="APF number"
                          />
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBank(bank.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={banks.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                variant="outline"
                onClick={addBank}
                className="mt-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={handleClear} disabled={isLoading}>
              Clear
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-brand-purple hover:bg-brand-purple/90 text-white"
              disabled={isLoading}
            >
              {isLoading 
                ? (editingProject ? "Updating..." : "Creating...") 
                : (editingProject ? "Update Project" : "Save Project")
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
