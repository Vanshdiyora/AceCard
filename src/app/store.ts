import { configureStore } from "@reduxjs/toolkit";

import campaignReducer from "../features/campaigns/slice";
import dashboardReducer from "../features/dashboard/slice";
import leadsReducer from "../features/leads/slice";
import teamReducer from "../features/teams/slice";
import productsReducer from "../features/products/slice";
import settingsReducer from "../features/admin/Settings/SettingsSlice";
import supportReducer from "../features/support/slice";
import authReducer from "../features/auth/slice";

import superDashboardReducer from "../features/superadmin/DashBoard/SuperDashBoardSlice";
import vendorsReducer from "../features/vendors/slice";
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
    superDashboard : superDashboardReducer,
    vendors: vendorsReducer, 
    superSalespersons: salespersonReducer,
    superSeats: seatskeysSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
