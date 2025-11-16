export interface VendorStat {
  title: string;
  value: number;
  change: string;
  positive: boolean;
}

export interface VendorItem {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  gst: string;
  domain: string;
  seats: number;
  status: "Pending" | "Verified" | "Suspended";
  joined: string;
}
