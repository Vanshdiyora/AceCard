import { Outlet } from "react-router-dom";
import Sidebar from "../../../common/components/layout/SideBar";
import Topbar from "../../../common/components/layout/TopBar";
import { useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { fetchNotifications } from "../../../features/notification/slice";

const SuperAdminLayout = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);
  return (
     <div className="flex">
      <Sidebar type="superadmin" />

      <div className="flex-1 flex flex-col">
        <Topbar type="super_admin" />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
