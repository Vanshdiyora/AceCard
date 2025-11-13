import { configureStore } from "@reduxjs/toolkit";
import campaignReducer from "../features/Campaign/CampaignSlice";
import dashboardReducer from "../features/DashBoard/DashBoardSlice"; // already exists

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    campaigns: campaignReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
