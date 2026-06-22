import axios from 'axios';
import { Company, Customer, CallLog } from './types';
import { createClient } from '@/utils/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const getCompanies = async (): Promise<Company[]> => {
  const { data } = await api.get('/companies');
  return data;
};

export const getCustomers = async (companyId: string): Promise<Customer[]> => {
  const { data } = await api.get(`/companies/${companyId}/customers`);
  return data;
};

export const createCustomer = async (companyId: string, name: string, phone: string, email?: string): Promise<Customer> => {
  const { data } = await api.post(`/customers`, {
    company_id: companyId,
    name,
    phone,
    email
  });
  return data;
};

export const startCampaign = async (companyId: string): Promise<void> => {
  await api.post(`/campaigns/${companyId}/start`);
};

export const getCallLog = async (customerId: string): Promise<CallLog | null> => {
  const { data } = await api.get(`/call-logs/${customerId}`);
  return data && data.length > 0 ? data[data.length - 1] : null;
};
