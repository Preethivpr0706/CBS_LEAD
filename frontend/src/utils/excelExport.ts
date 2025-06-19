// utils/excelExport.ts
import * as XLSX from 'xlsx';
import { Client } from '../types';

export const exportToExcel = async (clients: Client[], filename: string): Promise<void> => {
  // Format data for export
  const data = clients.map(client => ({
    'Client Name': client.customer_name,
    'Phone Number': client.phone_number,
    'Business Name': client.business_name,
    'Area': client.area,
    'Required Amount': client.required_amount,
    'Monthly Turnover': client.monthly_turnover,
    'Status': client.status,
    'Old Financier': client.old_financier_name || '',
    'Old Scheme': client.old_scheme || '',
    'Old Finance Amount': client.old_finance_amount || '',
    'New Financier': client.new_financier_name || '',
    'New Scheme': client.new_scheme || '',
    'Bank Support': client.bank_support ? 'Yes' : 'No',
    'Remarks': client.remarks || '',
    'Reference': client.reference || '',
    'Commission %': client.commission_percentage || '',
    'Created Date': new Date(client.created_at).toLocaleDateString(),
    'Last Follow-up': client.last_follow_up ? new Date(client.last_follow_up).toLocaleDateString() : '',
    'Next Follow-up': client.next_follow_up ? new Date(client.next_follow_up).toLocaleDateString() : ''
  }));
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Save file
  saveAsExcelFile(excelBuffer, filename);
};

const saveAsExcelFile = (buffer: any, fileName: string): void => {
  const data = new Blob([buffer], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    link.remove();
  }, 100);
};
