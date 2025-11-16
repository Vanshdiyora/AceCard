import { useAppSelector } from "../../../../app/hooks";
import StatCard from "../../../../common/components/cards/StatCard";

export default function SuperDashboardPage() {
  const { stats, recentActivity, systemHealth } = useAppSelector(
    (state) => state.superDashboard
  );

  return (
    <div className="space-y-6">

      {/* Header Buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
            Add Vendor
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Approve Salesperson
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Send Notification
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="Active Vendors"
          value={stats.activeVendors}
          change="12%"
          positive={true}
        />
        <StatCard
          title="Total Seats Allocated"
          value={stats.totalSeats}
          change="8%"
          positive={true}
        />
        <StatCard
          title="Leads Captured"
          value={stats.leadsCaptured}
          change="24%"
          positive={true}
        />
        <StatCard
          title="Active Salespeople"
          value={stats.activeSalespeople}
          change="15%"
          positive={true}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          change="5%"
          positive={false}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* RECENT ACTIVITY */}
        <div className="col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-semibold text-purple-600">
                  {item.user}
                </div>

                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>

          <HealthItem label="Active Sessions" value={systemHealth.activeSessions} />
          <HealthItem label="API Requests (24h)" value={systemHealth.apiRequests} />
          <HealthItem label="Error Rate" value={systemHealth.errorRate} />
          <HealthItem label="Avg Response Time" value={systemHealth.avgResponseTime} />

          {/* Progress */}
          <div className="mt-4">
            <p className="text-sm font-medium">Seat Utilization</p>

            <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
              <div
                className="h-3 bg-purple-600 rounded-full"
                style={{ width: `${systemHealth.seatUtilization}%` }}
              />
            </div>
            <p className="mt-1 text-sm">{systemHealth.seatUtilization}%</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function HealthItem({ label, value }: { label: string; value: any }) {
  return (
    <p className="text-sm flex justify-between py-1">
      <span className="font-medium">{label}</span>
      <span className="text-gray-700">{value}</span>
    </p>
  );
}
