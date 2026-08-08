export const CUSTOMER_TYPES = [
  "RETAIL",
  "WHOLESALE",
  "DISTRIBUTOR",
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_STATUSES = [
  "LEAD",
  "ACTIVE",
  "INACTIVE",
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}