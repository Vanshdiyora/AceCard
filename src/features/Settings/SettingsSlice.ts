import { createSlice } from "@reduxjs/toolkit";
import type { OrganizationSettings, ProfileSettings, NotificationSettings, CustomDomainSettings } from "./SettingsTypes";

interface SettingsState {
  organization: OrganizationSettings;
  profile: ProfileSettings;
  notifications: NotificationSettings;
  customDomain: CustomDomainSettings;
}

const initialState: SettingsState = {
  organization: {
    orgName: "AceCard Enterprise",
    industry: "Technology",
    currency: "USD ($)",
    locale: "English (US)",
    logo: null
  },
  profile: {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@acecard.com",
    role: "Manager",
    avatar: null
  },
  notifications: {
    leadAssignments: true,
    campaignUpdates: true,
    teamActivity: false,
    cardTaps: true,
    systemNotifications: true
  },
  customDomain: {
    domain: "company.acecard.com",
    active: true,
    message: "Your custom domain is active and verified",
    completedOn: "Oct 15, 2025"
  }
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateOrganization: (state, action) => {
      state.organization = { ...state.organization, ...action.payload };
    },

    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },

    updateNotifications: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },

    updateDomain: (state, action) => {
      state.customDomain = { ...state.customDomain, ...action.payload };
    }
  },
});

export const {
  updateOrganization,
  updateProfile,
  updateNotifications,
  updateDomain
} = settingsSlice.actions;

export default settingsSlice.reducer;
