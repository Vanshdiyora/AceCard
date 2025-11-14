import { createSlice } from "@reduxjs/toolkit";
import type { TeamMember } from "./TeamTypes";

interface TeamState {
  members: TeamMember[];
}

const initialState: TeamState = {
  members: [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@acecard.com",
      role: "Manager",
      roleColor: "bg-purple-100 text-purple-700",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 89,
      pipeline: "$245k",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.c@acecard.com",
      role: "Sales Rep",
      roleColor: "bg-blue-100 text-blue-700",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 76,
      pipeline: "$198k",
    },
    {
      id: 3,
      name: "David Rodriguez",
      email: "david.r@acecard.com",
      role: "Sales Rep",
      roleColor: "bg-blue-100 text-blue-700",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 94,
      pipeline: "$215k",
    },
    {
      id: 4,
      name: "Emily Watson",
      email: "emily.w@acecard.com",
      role: "Sales Rep",
      roleColor: "bg-blue-100 text-blue-700",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 83,
      pipeline: "$190k",
    },
    {
      id: 5,
      name: "James Liu",
      email: "james.l@acecard.com",
      role: "Sales Rep",
      roleColor: "bg-blue-100 text-blue-700",
      status: "inactive",
      statusColor: "bg-gray-100 text-gray-700",
      leads: 0,
      pipeline: "$0k",
    },
  ],
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
  },
});

export const { addMember } = teamSlice.actions;
export default teamSlice.reducer;
