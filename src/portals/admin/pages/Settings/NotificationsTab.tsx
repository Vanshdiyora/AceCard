import { useAppSelector, useAppDispatch } from "../../../../app/hooks";
import { updateNotifications } from "../../../../features/admin/Settings/SettingsSlice";

export default function NotificationsTab() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.settings.notifications);

  const toggle = (key: keyof typeof notifications) => {
    dispatch(updateNotifications({ [key]: !notifications[key] }));
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="font-semibold text-lg">Notification Preferences</h3>

      <div className="space-y-5">
        {[
          {
            key: "leadAssignments",
            title: "Lead Assignments",
            desc: "Get notified when a lead is assigned to you",
          },
          {
            key: "campaignUpdates",
            title: "Campaign Updates",
            desc: "Receive updates about campaign performance",
          },
          {
            key: "teamActivity",
            title: "Team Activity",
            desc: "Stay informed about team member activities",
          },
          {
            key: "cardTaps",
            title: "Card Taps",
            desc: "Get notified when your card is tapped",
          },
          {
            key: "systemNotifications",
            title: "System Notifications",
            desc: "Important updates and maintenance alerts",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between border-b pb-4"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>

            {/* Toggle */}
            <button
              onClick={() =>
                toggle(item.key as keyof typeof notifications)
              }
              className={`
                w-12 h-6 rounded-full p-1 flex items-center transition
                ${
                  notifications[item.key as keyof typeof notifications]
                    ? "bg-purple-600 justify-end"
                    : "bg-gray-300 justify-start"
                }
              `}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow"></div>
            </button>
          </div>
        ))}
      </div>

      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Save Preferences
      </button>
    </div>
  );
}
