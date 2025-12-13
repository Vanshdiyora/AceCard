import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { fetchProducts } from "../slice";
import { ProductsAPI } from "../services/products.service";
import ProductFormModal from "../components/ProductFormModal";
import ProductAnalyticsChart from "../components/ProductAnalysisChart";
import SkeletonProductCard from "../components/SkeletonProductCard";
import { Edit2, Grid, List } from "lucide-react";
import StatCard from "../../../common/components/cards/StatCard";
import { InfoCard } from "../../../common/components/cards/InfoCard";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);

  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F7F8FC]">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Product Catalog</h2>
          <p className="text-gray-500">
            Manage your product catalog and track performance
          </p>
        </div>

        <div className="flex gap-3">
          <button className="border px-4 py-2 rounded-lg bg-white shadow-sm">
            Import Products
          </button>
          <button
            onClick={() => {
              setEditProduct(null);
              setOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow"
          >
            + Add Product
          </button>
        </div>
      </div>
      <div className="flex gap-6">

        {/* LEFT SIDE — takes 65% width */}
        <div className="w-[65%]">

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="Total Products" value={products.length} icon="📦" />
            <StatCard title="Total Leads" value="483" icon="👥" />
            <StatCard title="Opportunities" value="103" icon="📈" />
          </div>

          {/* SEARCH + FILTER */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mt-4">
            <input
              className="w-1/2 border rounded-lg px-4 py-2 bg-gray-50"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${viewMode === "grid"
                    ? "bg-purple-600 text-white"
                    : "bg-white"
                  }`}
              >
                <Grid size={16} /> Grid
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${viewMode === "list"
                    ? "bg-purple-600 text-white"
                    : "bg-white"
                  }`}
              >
                <List size={16} /> List
              </button>
            </div>
          </div>

          {/* PRODUCT LIST AREA */}
          <div className="mt-6">
            {loading && (
              <div className="grid grid-cols-2 gap-5">
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
              </div>
            )}

            {!loading && viewMode === "grid" && (
              <div className="grid grid-cols-2 gap-5">
                {filtered.map((p) => (
                  <InfoCard
                    key={p.id}
                    product={p}
                    onEdit={() => {
                      setEditProduct(p);
                      setOpen(true);
                    }}
                    onToggleArchive={async () => {
                      await ProductsAPI.toggleArchive(p.id);
                      dispatch(fetchProducts());
                    }}
                  />

                ))}
              </div>
            )}

            {!loading && viewMode === "list" && (
              <table className="w-full bg-white rounded-xl shadow-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left text-sm">
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3">₹{p.price}</td>
                      <td className="p-3">{p.sku}</td>
                      <td className="p-3">{p.status}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setEditProduct(p);
                            setOpen(true);
                          }}
                          className="text-purple-600 flex gap-1 items-center"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* RIGHT SIDE — takes 35% width (wider) */}
        <div className="w-[35%] space-y-6">

          {/* CHART */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-xl mb-4">Product Analytics</h3>

            <div className="h-[220px]">
              <ProductAnalyticsChart products={products} />
            </div>
          </div>

          {/* TOP PERFORMERS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-xl mb-5">Top Performers</h3>

            {filtered
              .slice()
              .sort((a, b) => b.price - a.price) // or revenue (your choice)
              .slice(0, 3)
              .map((p, i) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center bg-purple-50 rounded-2xl px-5 py-4 mb-4"
                >
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-4">
                    {/* Rank badge */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
              ${i === 0 && "bg-purple-600"}
              ${i === 1 && "bg-orange-500"}
              ${i === 2 && "bg-purple-400"}
            `}
                    >
                      #{i + 1}
                    </div>

                    {/* Product name + leads */}
                    <div>
                      <p className="font-semibold text-lg">{p.name}</p>
                      <p className="text-gray-500 -mb-1 text-sm">Leads</p>
                      <p
                        className={`font-semibold text-md ${i === 0
                            ? "text-purple-700"
                            : i === 1
                              ? "text-orange-600"
                              : "text-purple-500"
                          }`}
                      >
                        {0}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT SIDE — Revenue */}
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Revenue</p>
                    <p className="font-semibold text-lg">
                      ₹{p.price}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-5 rounded-xl shadow-sm text-white space-y-3">
            <h3 className="font-semibold text-lg">Quick Actions</h3>

            <button
              onClick={() => {
                setEditProduct(null);
                setOpen(true);
              }}
              className="bg-white text-purple-700 w-full py-2 rounded-lg font-medium"
            >
              + Add New Product
            </button>

            <button className="bg-white text-purple-700 w-full py-2 rounded-lg font-medium">
              Import from Excel
            </button>

            <button className="bg-white text-purple-700 w-full py-2 rounded-lg font-medium">
              View Full Analytics
            </button>
          </div>

        </div>

      </div>


      {/* MODAL */}
      <ProductFormModal
        open={open}
        product={editProduct}
        onClose={() => {
          setOpen(false);
          setEditProduct(null);
        }}
        onSubmit={async (data) => {
          if (editProduct) {
            await ProductsAPI.updateProduct(editProduct.id, data);
          } else {
            await ProductsAPI.createProduct(data);
          }
          dispatch(fetchProducts());
          setOpen(false);
          setEditProduct(null);
        }}
      />
    </div>
  );
}