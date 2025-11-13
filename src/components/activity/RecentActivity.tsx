export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      color: "bg-green-500",
      title: "New lead: Tech Solutions Inc.",
      user: "Sarah Johnson",
      time: "5 minutes ago",
    },
    {
      id: 2,
      color: "bg-blue-500",
      title: "Card tapped at Tech Conference",
      user: "Michael Chen",
      time: "15 minutes ago",
    },
    {
      id: 3,
      color: "bg-purple-500",
      title: "Meeting scheduled with Acme Corp",
      user: "David Rodriguez",
      time: "1 hour ago",
    },
    {
      id: 4,
      color: "bg-gray-500",
      title: "Q2 Campaign reached 80% target",
      user: "System",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="font-semibold mb-4">Recent Activity</h3>

      <div className="divide-y divide-gray-200">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 py-4">
            {/* Bullet */}
            <span className={`w-3 h-3 rounded-full mt-2 ${item.color}`}></span>

            {/* Text */}
            <div className="flex flex-col">
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">
                {item.user} • {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
