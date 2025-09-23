import { RequestDetail } from "@/types";

export interface RequestType {
  id: number;
  name: string;
  title: string;
  description: string;
  fee?: number;
}

export interface DocumentRequestBody {
  id?: number;
  serial_number?: string | null;
  title: string;
  description: string;
  status?: string;
  exporter_name: string;
  rejection_reason?: string | null;
  request_details: RequestDetail[];
  branch_id: number;
  request_type_id: number | null;
  client_id?: number | null;
}
