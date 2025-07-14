
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface InitiateDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const InitiateDisbursementModal = ({ isOpen, onClose, title }: InitiateDisbursementModalProps) => {
  const [leadNumber, setLeadNumber] = useState("LN-12345");
  const [leadName, setLeadName] = useState("John Doe");
  const [selectedType, setSelectedType] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const handleApplyNow = () => {
    if (!selectedType || !amount) {
      toast.error("Please fill in all fields");
      return;
    }
    
    toast.success(`${title} submitted successfully for ₹${amount}`);
    onClose();
    setSelectedType("");
    setAmount("");
    
    // Navigate to Documents Request page using query parameter
    navigate("/sales-manager-initiate-disbursement?view=documents-request");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Lead Number :
            </label>
            <Input
              type="text"
              value={leadNumber}
              onChange={(e) => setLeadNumber(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Lead Name :
            </label>
            <Input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Type :
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat-cost">Flat Cost</SelectItem>
                <SelectItem value="tax-others">Tax / Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Amount :
            </label>
            <Input
              type="text"
              placeholder="eg: ₹2,00,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleApplyNow}
              className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitiateDisbursementModal;
