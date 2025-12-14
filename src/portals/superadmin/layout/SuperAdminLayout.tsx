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

      <div className="flex-1 flex flex-col bg-gray-50">
        <Topbar type="superadmin" />

        <main className="p-4 bg-[#F7F8FC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
