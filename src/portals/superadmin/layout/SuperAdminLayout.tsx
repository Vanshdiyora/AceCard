import { Outlet } from "react-router-dom";
import Sidebar from "../../../common/components/layout/SideBar";
import Topbar from "../../../common/components/layout/TopBar";

const SuperAdminLayout = () => {
  return (
     <div className="flex">
      <Sidebar type="superadmin" />

      <div className="flex-1 flex flex-col bg-gray-50">
        <Topbar type="superadmin" />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
