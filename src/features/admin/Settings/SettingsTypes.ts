export interface OrganizationSettings {
  orgName: string;
  industry: string;
  currency: string;
  locale: string;
  logo: string | null;
}

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string | null;
}

export interface NotificationSettings {
  leadAssignments: boolean;
  campaignUpdates: boolean;
  teamActivity: boolean;
  cardTaps: boolean;
  systemNotifications: boolean;
}

export interface CustomDomainSettings {
  domain: string;
  active: boolean;
  message: string;
  completedOn: string;
}
