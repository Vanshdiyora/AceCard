import { createSlice } from "@reduxjs/toolkit";
import type { VendorItem, VendorStat } from "./VendorsTypes";

interface VendorsState {
  stats: VendorStat[];
  vendors: VendorItem[];
}

const initialState: VendorsState = {
  stats: [
    { title: "Total Vendors", value: 127, change: "12%", positive: true },
    { title: "Pending Verification", value: 8, change: "4%", positive: false },
    { title: "Active Vendors", value: 115, change: "9%", positive: true },
    { title: "Suspended", value: 4, change: "1%", positive: false },
  ],

  vendors: [
    {
      id: 1,
      companyName: "TechCorp Solutions",
      contactPerson: "John Smith",
      email: "john@techcorp.com",
      gst: "GST123456789",
      domain: "techcorp.acecard.io",
      seats: 0,
      status: "Pending",
      joined: "2025-11-01",
    },
    {
      id: 2,
      companyName: "GlobalTech Inc.",
      contactPerson: "Sarah Johnson",
      email: "sarah@globaltech.com",
      gst: "GST987654321",
      domain: "globaltech.acecard.io",
      seats: 35,
      status: "Verified",
      joined: "2025-10-15",
    },
    {
      id: 3,
      companyName: "InnovateLabs",
      contactPerson: "Michael Chen",
      email: "michael@innovatelabs.com",
      gst: "GST456789123",
      domain: "innovatelabs.acecard.io",
      seats: 50,
      status: "Verified",
      joined: "2025-09-20",
    },
    {
      id: 4,
      companyName: "XYZ Marketing",
      contactPerson: "Emily Davis",
      email: "emily@xyzmarketing.com",
      gst: "GST789123456",
      domain: "xyzmarketing.acecard.io",
      seats: 20,
      status: "Suspended",
      joined: "2025-08-10",
    },
  ],
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {},
});

export default vendorsSlice.reducer;
