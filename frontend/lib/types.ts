export type UserRole = "user" | "technician" | "admin";

export interface Appliance {
  id: number;
  name: string;
  icon?: string;
  image_url?: string | null;
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

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  total: number;
  limit: number;
  offset: number;
  unread_count: number;
}

export interface NotificationSummary {
  unread_total: number;
  unread_messages: number;
  unread_status: number;
  latest: NotificationItem[];
}

export interface Conversation {
  id: string;
  ticket_id: string;
  client_id: string;
  technician_id?: string | null;
  ticket_status?: string | null;
  ticket_description?: string | null;
  scheduled_date?: string | null;
  appliance_name?: string | null;
  appliance_icon?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  technician_name?: string | null;
  technician_email?: string | null;
  technician_phone?: string | null;
  last_message_body?: string | null;
  last_message_created_at?: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationListResponse {
  items: Conversation[];
  eligible_tickets: Ticket[];
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: ConversationMessage[];
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
