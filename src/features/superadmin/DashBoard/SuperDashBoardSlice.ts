import { createSlice } from "@reduxjs/toolkit";
import type { SuperDashboardState } from "./SuperDashBoardTypes";

const initialState: SuperDashboardState = {
  stats: {
    activeVendors: 127,
    totalSeats: 2458,
    leadsCaptured: 18742,
    activeSalespeople: 1834,
    pendingApprovals: 23,
  },

  recentActivity: [
    {
      id: 1,
      user: "TC",
      title: "New Vendor Joined",
      desc: "TechCorp Solutions registered and awaiting verification",
      time: "5 minutes ago",
    },
    {
      id: 2,
      user: "GT",
      title: "Seats Updated",
      desc: "GlobalTech increased seat allocation from 20 to 35",
      time: "23 minutes ago",
    },
  ],

  systemHealth: {
    activeSessions: 1234,
    apiRequests: 45200,
    errorRate: "0.3%",
    avgResponseTime: "124ms",
    seatUtilization: 74,
  },
};

export const superDashboardSlice = createSlice({
  name: "superDashboard",
  initialState,
  reducers: {},
});

export default superDashboardSlice.reducer;
