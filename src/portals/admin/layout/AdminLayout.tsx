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
  }, [dispatch]);

  return (
    <div className="grid grid-cols-[16rem_1fr] min-h-screen w-full">
      {/* Sidebar column */}
      <Sidebar type="admin" />

      {/* Content column */}
      <div className="flex flex-col min-w-0 max-w-full overflow-hidden">
        <Topbar type="admin" username="Sarah" />

        <main className="p-4 bg-[#E6E4F2] flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
