import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import type { GroupedSearchResults, GlobalSearchItem } from "./types";

/* =================== ADMIN SEARCH =================== */

export const makeAdminGlobalSearchSelector = (query: string) =>
  createSelector(
    [
      (state: RootState) => state.campaigns.items,
      (state: RootState) => state.leads.leads,
      (state: RootState) => state.team.members,
      (state: RootState) => state.products.products,
    ],
    (campaigns, leads, members, products): GroupedSearchResults => {
      if (!query.trim()) {
        return { campaign: [], lead: [], team: [], product: [] };
      }

      const q = query.toLowerCase();

      const build = (
        items: any[],
        fields: string[],
        labelKey: string,
        type: GlobalSearchItem["type"],
        routePrefix: string
      ): GlobalSearchItem[] =>
        items
          .filter(item =>
            fields.some(f =>
              String(item[f] ?? "").toLowerCase().includes(q)
            )
          )
          .map(item => ({
            id: item.id,
            label: item[labelKey],
            type,
            route: `${routePrefix}/${item.id}`,
          }));

      return {
        campaign: build(
          campaigns,
          ["name", "description"],
          "name",
          "campaign",
          "/admin/campaigns"
        ),
        lead: build(
          leads,
          ["lead_name", "email", "company"],
          "lead_name",
          "lead",
          "/admin/leads"
        ),
        team: build(
          members,
          ["name", "email"],
          "name",
          "team",
          "/admin/team"
        ),
        product: build(
          products,
          ["name", "description", "category"],
          "name",
          "product",
          "/admin/products"
        ),
      };
    }
  );

/* =================== SUPERADMIN SEARCH =================== */

export const makeSuperGlobalSearchSelector = (query: string) =>
  createSelector(
    [(state: RootState) => state.vendors.vendors],
    (vendors): GroupedSearchResults => {
      if (!query.trim()) {
        return { vendor: [] };
      }

      const q = query.toLowerCase();

      return {
        vendor: vendors
          .filter((v: any) =>
            ["legal_name", "primary_email", "address"].some(f =>
              String(v[f] ?? "").toLowerCase().includes(q)
            )
          )
          .map((v: any) => ({
            id: v.id,
            label: v.legal_name,
            type: "vendor",
            route: `/super/vendors/${v.id}`,
          })),
      };
    }
  );
