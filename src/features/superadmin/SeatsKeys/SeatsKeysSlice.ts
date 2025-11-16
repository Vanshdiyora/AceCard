import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: {
    totalAllocated: 2458,
    seatsInUse: 1823,
    available: 635,
    utilization: "74%",
  },
  vendors: [
    {
      name: "GlobalTech Inc.",
      totalSeats: 35,
      usedSeats: 28,
      utilization: "80%",
      accessKey: "gt_acc_7f8d9e2a1b3c4567",
      expiry: "2026-10-15",
      status: "Active",
    },
    {
      name: "InnovateLabs",
      totalSeats: 50,
      usedSeats: 47,
      utilization: "94%",
      accessKey: "il_acc_3c4d5e6f7a8b9012",
      expiry: "2026-09-20",
      status: "Active",
    },
    {
      name: "XYZ Marketing",
      totalSeats: 20,
      usedSeats: 20,
      utilization: "100%",
      accessKey: "xyz_acc_1e2f3a4b5c6d7890",
      expiry: "2025-12-10",
      status: "Suspended",
    }
  ]
};

const seatskeysSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {}
});

export default seatskeysSlice.reducer;
