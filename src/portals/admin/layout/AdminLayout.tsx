import { Outlet } from "react-router-dom";
import Sidebar from "../../../common/components/layout/SideBar";
import Topbar from "../../../common/components/layout/TopBar";
import { useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { fetchNotifications } from "../../../features/notification/slice";

const AdminLayout = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchNotifications({page:1}));
  }, [dispatch]);

  return (
    <div className="grid grid-cols-[16rem_1fr] min-h-screen w-full">
      {/* Sidebar column */}
      <Sidebar type="admin" />

      {/* Content column */}
      <div className="flex flex-col min-w-0 max-w-full overflow-hidden">
        <Topbar type="admin" />

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
