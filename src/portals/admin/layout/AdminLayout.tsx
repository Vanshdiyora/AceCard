import { Outlet } from "react-router-dom";
import Sidebar from "../../../common/components/layout/SideBar";
import Topbar from "../../../common/components/layout/TopBar";

const AdminLayout = () => {
  return (
      <div className="flex">
      <Sidebar type="admin" />

      <div className="flex-1 flex flex-col">
        <Topbar type="admin" username="Sarah" />

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>  
  );
};

export default AdminLayout;
