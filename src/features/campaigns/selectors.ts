import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { EnrichedCampaign } from "./types";

export const selectEnrichedCampaignById = (id: number) =>
  createSelector(
    [
      (s: RootState) => s.campaigns.items,
      (s: RootState) => s.team.members,
    ],
    (campaigns): EnrichedCampaign | null => {
      const campaign = campaigns.find((c) => c.id === id);
      if (!campaign) return null;

      return {
        ...campaign,

        // Prefer backend value, fallback to team lookup
        owner_name: campaign.manager_name,
      };
    }
  );
