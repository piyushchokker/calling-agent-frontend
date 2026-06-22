export type CustomerStatus = "PENDING" | "CALL_INITIATED" | "QUALIFIED" | "NOT_INTERESTED" | "FAILED" | "NEEDS_REVIEW";

export interface Company {
  id: string;
  name: string;
  prompt_instructions: string | null;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  phone: string;
  status: CustomerStatus;
}

export interface CallLog {
  id: string;
  customer_id: string;
  transcript: string | null;
  summary: string | null;
  outcome: CustomerStatus | null;
}
