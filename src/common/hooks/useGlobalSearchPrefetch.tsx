import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

// import { fetchCampaigns } from "../../features/campaigns/slice";
// import { fetchLeads } from "../../features/leads/slice";
// import { fetchTeam } from "../../features/teams/slice";
// import { fetchProducts } from "../../features/products/slice";
// import { fetchVendors } from "../../features/vendors/slice";

export function useGlobalSearchPrefetch(
  mode: "admin" | "super_admin"
) {
  const dispatch = useAppDispatch();

  // ✅ SAFE selectors (null-proof)
  // const campaignsLoaded = useAppSelector(
  //   (state) => (state.campaigns.items ?? []).length > 0
  // );

  // const leadsLoaded = useAppSelector(
  //   (state) => (state.leads.leads ?? []).length > 0
  // );

  const teamLoaded = useAppSelector(
    (state) => (state.team.members ?? []).length > 0
  );

  const productsLoaded = useAppSelector(
    (state) => (state.products.products ?? []).length > 0
  );

  const vendorsLoaded = useAppSelector(
    (state) => (state.vendors.vendors ?? []).length > 0
  );

  useEffect(() => {
    if (mode === "admin") {
      // if (!campaignsLoaded) dispatch(fetchCampaigns());
      // if (!leadsLoaded) dispatch(fetchLeads());
      // if (!teamLoaded) dispatch(fetchTeam());
      // if (!productsLoaded) dispatch(fetchProducts());
    }

    if (mode === "super_admin") {
      // if (!vendorsLoaded) dispatch(fetchVendors());
    }
  }, [
    mode,
    // campaignsLoaded,
    // leadsLoaded,
    teamLoaded,
    productsLoaded,
    vendorsLoaded,
    dispatch,
  ]);
}
