import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Download sanction letter utility
export async function downloadSanctionLetter(userId: string, toast?: any, setIsDownloading?: (v: boolean) => void) {
  if (!userId) {
    if (toast) toast.error("Customer ID not found. Please try again.");
    return;
  }
  try {
    if (setIsDownloading) setIsDownloading(true);
    if (toast) toast.info("Generating sanction letter...");
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/loan-offers/lfi-sanction-letter/${userId}`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    let filename = 'LFI_Sanction_Letter.pdf';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) filename = filenameMatch[1];
    }
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    if (toast) toast.success("Sanction letter downloaded successfully!");
  } catch (error: any) {
    console.error("Error downloading sanction letter:", error);
    if (toast) {
      if (error.response?.status === 404) {
        toast.error("No active loan sanction found. Please complete the loan application first.");
      } else {
        toast.error("Failed to download sanction letter. Please try again later.");
      }
    }
  } finally {
    if (setIsDownloading) setIsDownloading(false);
  }
}
