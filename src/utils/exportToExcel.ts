
import * as XLSX from 'xlsx';

export interface ExportData {
  [key: string]: any;
}

export const exportToExcel = (data: ExportData[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create a worksheet from the data
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate the Excel file and trigger download
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};

// Utility function to format date for Excel export
export const formatDateForExcel = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN');
};

// Utility function to clean and format data for Excel export
export const cleanDataForExport = (data: ExportData[]): ExportData[] => {
  return data.map(item => {
    const cleanedItem: ExportData = {};
    Object.keys(item).forEach(key => {
      // Convert camelCase to Title Case for headers
      const headerKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      cleanedItem[headerKey] = item[key];
    });
    return cleanedItem;
  });
};
