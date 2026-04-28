export type AgeBands = {
  PS: number;
  SA: number;
  Inf: number;
  TT: number;
};

export type Room = {
  name: string;
  short: string;
  fte: number;
  budget: number;
  gap: number;
};

export type DetailedAcademy = {
  enrollments: number;
  fte_apr: number;
  incoming_enr: number;
  incoming_fte: number;
  withdrawals: number;
  withdraw_fte: number;
  rooms: Room[];
  open_capacity: number;
};

export type Academy = {
  code: string;
  name: string;
  city: string;
  region: string;
  budget: number;
  current: number;
  fte_vs_budget: number;
  spend: number;
  cpc: number;
  ctr: number;
  clicks: number;
  total_leads: number;
  paid_leads: number;
  pct_paid: number;
  cost_per_paid: number;
  lead_to_tour: number;
  tour_to_reg: number;
  ages: AgeBands;
  misalign: number;
  priority: boolean;
  // joined from detailed
  open_capacity: number;
  incoming_enr: number;
  incoming_fte: number;
  withdrawals: number;
  withdraw_fte: number;
  enrollments: number;
  rooms: Room[] | null;
};

export type Mappings = {
  campaignToCode: Record<string, string>;
  centerNameToCode: Record<string, string>;
  csvCodeToCode: Record<string, string>;
};

export type Stored = {
  academies: Academy[];
  uploadedAt: string;
};

export type FilterKey = "all" | "priority" | "inefficient" | "efficient" | "misaligned";
