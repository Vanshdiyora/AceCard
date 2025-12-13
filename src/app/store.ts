import { configureStore } from "@reduxjs/toolkit";

import campaignReducer from "../features/campaigns/slice";
import dashboardReducer from "../features/admin/DashBoard/DashBoardSlice";
import leadsReducer from "../features/admin/Leads/LeadsSlice";
import teamReducer from "../features/teams/slice";
import productsReducer from "../features/products/slice";
import settingsReducer from "../features/admin/Settings/SettingsSlice";
import supportReducer from "../features/support/slice";
import insightsReducer from "../features/admin/Insights/InsightsSlice";
import authReducer from "../features/auth/slice";

import superDashboardReducer from "../features/superadmin/DashBoard/SuperDashBoardSlice";
import vendorsReducer from "../features/superadmin/Vendors/VendorsSlice";
import salespersonReducer from "../features/superadmin/Salesperson/SalespersonSlice";
import seatskeysSlice from "../features/superadmin/SeatsKeys/SeatsKeysSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,   
    dashboard: dashboardReducer,
    campaigns: campaignReducer,
    leads: leadsReducer,
    team: teamReducer,
    products: productsReducer,
    settings: settingsReducer,
    support: supportReducer,
    insights: insightsReducer,   
    superDashboard : superDashboardReducer,
    superVendors: vendorsReducer, 
    superSalespersons: salespersonReducer,
    superSeats: seatskeysSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
