
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Lead {
  name: string;
  action: string;
  contact: string;
  leadId: string;
  date: string;
  followUp: string;
  fullLead?: {
    id: string;
    status?: string;
    notes?: string;
    loanType?: string;
  };
  project?: string;
}

interface FollowupLeadsTableProps {
  leads: Lead[];
  onAddNotes: (lead: Lead) => void;
  onShareDetails: (leadId: string) => void;
  onActionChange?: (leadId: string, newAction: string) => void;
  showProjectColumn?: boolean;
}

const FollowupLeadsTable: React.FC<FollowupLeadsTableProps> = ({ 
  leads, 
  onAddNotes, 
  onShareDetails,
  onActionChange,
  showProjectColumn = true // Keep true as default since it's used in more places
}) => {
  const handleActionChange = (leadId: string, newAction: string) => {
    if (onActionChange) {
      onActionChange(leadId, newAction);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Contact</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Add notes</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Last Follow Up</th>
            {showProjectColumn && (
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Project</th>
            )}
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Product</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {leads.map((lead, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{lead.leadId}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{lead.name}</td>
              <td className="px-6 py-4 text-sm">
                <Select 
                  value={lead.fullLead?.status || lead.action}
                  onValueChange={(value) => handleActionChange(lead.leadId, value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder={lead.action} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50">
                    {/* Call Status Group */}
                    <SelectItem value="switched-off" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Switched off</SelectItem>
                    <SelectItem value="ltc" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">LTC</SelectItem>
                    <SelectItem value="ringing" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Ringing</SelectItem>
                    
                    {/* Number Issues Group */}
                    <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                    <SelectItem value="invalid-number" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Invalid Number</SelectItem>
                    <SelectItem value="wrong-number" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Wrong Number</SelectItem>
                    
                    {/* Interest Level Group */}
                    <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                    <SelectItem value="not-interested" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Not Interested</SelectItem>
                    <SelectItem value="hot-lead" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-red-600 font-medium">Hot Lead</SelectItem>
                    <SelectItem value="cold-lead" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-blue-600">Cold Lead</SelectItem>
                    
                    {/* Process Status Group */}
                    <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                    <SelectItem value="sanctioned" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-green-600 font-medium">Sanctioned</SelectItem>
                    <SelectItem value="followup" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Follow up</SelectItem>
                    <SelectItem value="reject" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-red-500">Rejected</SelectItem>
                    <SelectItem value="complete" className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-green-700 font-medium">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{lead.contact}</td>
              <td className="px-6 py-4 text-sm">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onAddNotes(lead)}
                  className="text-xs px-3 py-1"
                >
                  {lead.fullLead?.notes ? "View/Edit Notes" : "Add Notes"}
                </Button>
                {lead.fullLead?.notes && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate" title={lead.fullLead.notes}>
                    {lead.fullLead.notes}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{lead.date}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{lead.followUp}</td>
              {showProjectColumn && (
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{lead.fullLead?.loanType}</td>
              )}
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">Home Loan</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FollowupLeadsTable;
