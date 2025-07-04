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

export interface UserSettings {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  notification_frequency?: 'daily' | 'weekly' | 'none';
  // Add other settings as needed
}

export interface AppSettings {
  id: number;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  logo_url?: string;
  notification_email: string;
  reminder_time_before: number;
  notifications_enabled: boolean;
  admin_email: string;
  admin_name: string;
}
