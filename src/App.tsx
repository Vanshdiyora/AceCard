import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SideBar from "./components/layout/SideBar";
import TopBar from "./components/layout/TopBar";

import DashboardPage from "./pages/DashBoard/DashBoardPage";
import LeadsPage from "./pages/Leads/LeadsPage";
import CampaignsPage from "./pages/Campaigns/CampaignsPage";
import TeamPage from "./pages/Team/TeamPage";
import ProductsPage from "./pages/Products/ProductsPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import SupportPage from "./pages/Support/SupportPage";
import InsightsPage from "./pages/Insights/InsightsPage";

export default function App() {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <div className="p-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
