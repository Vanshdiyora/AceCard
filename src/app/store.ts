import { configureStore } from "@reduxjs/toolkit";

import campaignReducer from "../features/admin/Campaign/CampaignSlice";
import dashboardReducer from "../features/admin/DashBoard/DashBoardSlice";
import leadsReducer from "../features/admin/Leads/LeadsSlice";
import teamReducer from "../features/admin/Team/TeamSlice";
import productsReducer from "../features/admin/Products/ProductsSlice";
import settingsReducer from "../features/admin/Settings/SettingsSlice";
import supportReducer from "../features/admin/Support/SupportSlice";
import insightsReducer from "../features/admin/Insights/InsightsSlice";

import superDashboardReducer from "../features/superadmin/DashBoard/SuperDashBoardSlice";
import vendorsReducer from "../features/superadmin/Vendors/VendorsSlice";
import salespersonReducer from "../features/superadmin/Salesperson/SalespersonSlice";
import seatskeysSlice from "../features/superadmin/SeatsKeys/SeatsKeysSlice"

export const store = configureStore({
  reducer: {
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
