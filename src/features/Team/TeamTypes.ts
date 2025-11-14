export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  roleColor: string;
  status: "active" | "inactive";
  statusColor: string;
  leads: number;
  pipeline: string;
}
