import { createSlice } from "@reduxjs/toolkit";
import type { SalespersonState } from "./SalespersonTypes";

const initialState: SalespersonState = {
  stats: {
    total: 5,
    pending: 3,
    approved: 1,
    rejected: 1,
  },

  list: [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.j@globaltech.com",
      phone: "+1 234 567 8901",
      vendor: "GlobalTech Inc.",
      manager: "Sarah Johnson",
      role: "Sales Rep",
      registered: "2025-11-03",
      status: "Pending",
    },
    {
      id: 2,
      name: "Bob Williams",
      email: "bob.w@innovatelabs.com",
      phone: "+1 234 567 8902",
      vendor: "InnovateLabs",
      manager: "Michael Chen",
      role: "Sales Guy",
      registered: "2025-11-03",
      status: "Pending",
    },
    {
      id: 3,
      name: "David Brown",
      email: "david.b@globaltech.com",
      phone: "+1 234 567 8903",
      vendor: "GlobalTech Inc.",
      manager: "Sarah Johnson",
      role: "Sales Guy",
      registered: "2025-11-02",
      status: "Pending",
    },
    {
      id: 4,
      name: "Emma White",
      email: "emma.w@cyberlabs.com",
      phone: "+1 234 567 8904",
      vendor: "CyberLabs",
      manager: "Mark Lewis",
      role: "Sales Rep",
      registered: "2025-10-28",
      status: "Approved",
    },
    {
      id: 5,
      name: "John Carter",
      email: "john.c@vendia.com",
      phone: "+1 234 567 8905",
      vendor: "Vendia",
      manager: "Anna Clark",
      role: "Sales Rep",
      registered: "2025-10-20",
      status: "Rejected",
    },
  ],
};

const salespersonSlice = createSlice({
  name: "salespersons",
  initialState,
  reducers: {},
});

export default salespersonSlice.reducer;
