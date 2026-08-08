export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdBy: string;
  createdAt: string;
}

export interface FollowUpInput {
  note: string;
  followUpDate: string;
}

export interface FollowUpsResponse {
  success: boolean;
  data: FollowUp[];
}

export interface FollowUpResponse {
  success: boolean;
  data: FollowUp;
}

export interface DeleteFollowUpResponse {
  success: boolean;
  message: string;
}