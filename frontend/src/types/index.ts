// types/index.ts
export interface Client {
  id: number;
  created_at: string;
  customer_name: string;
  phone_number: string;
  business_name: string;
  monthly_turnover: number;
  area: string;
  required_amount: number;
  old_financier_name?: string;
  old_scheme?: string;
  old_finance_amount?: number;
  new_financier_name?: string;
  new_scheme?: string;
  bank_support: boolean;
  remarks?: string;
  reference?: string;
  status: ClientStatus;
    status_updated_at?: string;  // Add this line
  commission_percentage?: number;
  disbursement_date?: string;
  last_follow_up?: string;
  next_follow_up?: string;
  updated_at?: string;
  loans?: Loan[];  // Add this
}


export type ClientStatus = 'New' | 'In Progress' | 'Approved' | 'Rejected' | 'Disbursed' | 'Completed';

export interface FollowUp {
  id: number;  // Changed from string to number
  client_id: number;
    type: 'Call' | 'Email' | 'Meeting' | 'Other'; 
  date: string;
  date_time:string;
  notes: string;
  next_follow_up_date?: string;
  next_follow_up_time?:string;
  created_at: string;
}

export interface Loan {
  id: number;
  client_id: number;
  amount: number;
  disbursement_date: string;
  proof_file?: File;  // For form handling
  proof_file_name?: string;  // From backend
  proof_file_path?: string;  // From backend
  created_at: string;
}


export interface Document {
  id: number;
  name: string;            // From backend file.filename
  original_name: string;   // From backend file.originalname
  folder: string;
  size: number;
  type: string;
  file_path: string;      // From backend
  upload_date: string;
  created_at?: string;
}
