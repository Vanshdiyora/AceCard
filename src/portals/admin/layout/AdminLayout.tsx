import { Outlet } from "react-router-dom";
import Sidebar from "../../../common/components/layout/SideBar";
import Topbar from "../../../common/components/layout/TopBar";
import { useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { fetchNotifications } from "../../../features/notification/slice";

const AdminLayout = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  return (
      <div className="flex">
      <Sidebar type="admin" />

      <div className="flex-1 flex flex-col">
        <Topbar type="admin" username="Sarah" />

        <main className="p-4 bg-[#F7F8FC]">
          <Outlet />
        </main>
      </div>
    </div>  
  );
};

export default AdminLayout;
