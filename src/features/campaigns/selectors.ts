import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { EnrichedCampaign } from "./types";

export const selectEnrichedCampaignById = (id: number) =>
  createSelector(
    [
      (s: RootState) => s.campaigns.items,
      (s: RootState) => s.team.members,
    ],
    (campaigns, members): EnrichedCampaign | null => {
      const campaign = campaigns.find((c) => c.id === id);
      if (!campaign) return null;

      const owner = members.find((m) => m.id === campaign.manager_id);
      const salespersons = members.filter((m) =>
        campaign.assigned_reps?.includes(m.id)
      );

      return {
        ...campaign,
        owner_name: owner?.name,
        salespersons: salespersons.map((s) => ({
          id: s.id,
          name: s.name,
        })),
      };
    }
  );
