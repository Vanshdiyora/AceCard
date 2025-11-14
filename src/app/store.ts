import { configureStore } from "@reduxjs/toolkit";
import campaignReducer from "../features/Campaign/CampaignSlice";
import dashboardReducer from "../features/DashBoard/DashBoardSlice";
import leadsReducer from "../features/Leads/LeadsSlice";
import teamReducer from "../features/Team/TeamSlice";
import productsReducer from "../features/Products/ProductsSlice";
import settingsReducer from "../features/Settings/SettingsSlice";
import supportReducer from "../features/Support/SupportSlice";
import insightsReducer from "../features/Insights/InsightsSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    campaigns: campaignReducer,
    leads: leadsReducer,
    team: teamReducer,
    products: productsReducer,
    settings: settingsReducer,
    support: supportReducer,
    insights: insightsReducer,   // <-- Add this
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
