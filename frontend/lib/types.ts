export type UserRole = "user" | "technician" | "admin";

export interface Appliance {
  id: number;
  name: string;
  icon?: string;
}

export interface ProblemType {
  id: number;
  appliance_id: number;
  label: string;
}

export interface Ticket {
  id: string;
  user_id?: string;
  technician_id?: string;
  appliance_id: number;
  problem_type_id?: number;
  description: string;
  status: string;
  urgency?: string;
  created_at: string;
  brand?: string;
  model?: string;
  phone?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  preferred_time_slot?: string;
  scheduled_date?: string;
  
  // Enhanced fields from API
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  technician_name?: string;
  technician_email?: string;
  technician_phone?: string;
  appliance_name?: string;
  appliance_icon?: string;
  problem_type_label?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  is_active: boolean;
  phone?: string;
}
