
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadSanctionLetter } from "@/lib/utils";
import { toast } from "sonner";

interface LFISanction {
  leadId: string;
  name: string;
  amount: number | string;
  userId: string | number;
}

interface LFISanctionsTableProps {
  sanctions: LFISanction[];
}

const LFISanctionsTable: React.FC<LFISanctionsTableProps> = ({ sanctions }) => {
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  
  const handleDownload = async (userId: string | number) => {
    setDownloadingId(userId);
    await downloadSanctionLetter(userId.toString(), toast, () => {}); // setIsDownloading is handled locally
    setDownloadingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Max Amount Sanctioned</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sanction Letter</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sanctions.map((sanction, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{sanction.leadId}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{sanction.name}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {(() => {
                  // Parse amount to number if it's a string
                  let amountNum: number;
                  if (typeof sanction.amount === 'string') {
                    // Remove commas and currency symbols if present
                    const cleaned = sanction.amount.replace(/[₹,]/g, '').trim();
                    amountNum = Number(cleaned);
                  } else {
                    amountNum = sanction.amount;
                  }
                  // Fallback if parse fails
                  if (isNaN(amountNum)) return "₹ -";
                  return `₹ ${amountNum.toLocaleString('en-IN')}`;
                })()}
              </td>
              <td className="px-6 py-4 text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(sanction.userId)}
                  className="flex items-center space-x-1"
                  disabled={downloadingId === sanction.userId}
                >
                  {downloadingId === sanction.userId ? (
                    <span className="w-4 h-4 mr-2 inline-block border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Download className="w-4 h-4 mr-1" />
                  )}
                  <span>{downloadingId === sanction.userId ? "Downloading..." : "Download"}</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LFISanctionsTable;