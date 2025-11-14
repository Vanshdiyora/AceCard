import { createSlice } from "@reduxjs/toolkit";
import type { Product, ProductStats } from "./ProductsTypes";

interface ProductState {
  products: Product[];
  stats: ProductStats;
}

const initialState: ProductState = {
  stats: {
    totalProducts: 5,
    activeProducts: 4,
    totalOpportunities: 102,
    totalRevenue: "$432k"
  },

  products: [
    {
      id: 1,
      name: "Enterprise Suite",
      sku: "ENT-001",
      price: "$9,999",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 45,
      opportunities: 12
    },
    {
      id: 2,
      name: "Professional Plan",
      sku: "PRO-002",
      price: "$4,999",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 89,
      opportunities: 28
    },
    {
      id: 3,
      name: "Starter Package",
      sku: "STR-003",
      price: "$999",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 156,
      opportunities: 52
    },
    {
      id: 4,
      name: "Custom Integration",
      sku: "CUS-004",
      price: "$14,999",
      status: "active",
      statusColor: "bg-green-100 text-green-700",
      leads: 23,
      opportunities: 8
    },
    {
      id: 5,
      name: "Legacy System",
      sku: "LEG-005",
      price: "$2,999",
      status: "inactive",
      statusColor: "bg-gray-100 text-gray-700",
      leads: 12,
      opportunities: 2
    }
  ]
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {}
});

export default productsSlice.reducer;
