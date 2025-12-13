import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTickets } from "../slice";

import NewTicketModal from "../components/NewTicketModal";

import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  MessageSquareMore,
  Folder,
} from "lucide-react";

import PageHeader from "../../../common/components/layout/PageHeader";

export default function SupportPage() {
  const dispatch = useAppDispatch();
  const { tickets } = useAppSelector((s) => s.support);

  // -------------------------------
  // Extract vendorId from JWT token
  // -------------------------------
  const token = localStorage.getItem("token");

  let vendorId: number | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      vendorId = payload.vendor_id;
    } catch (error) {
      console.error("Failed to decode JWT", error);
    }
  }

  // Fetch tickets on load
  useEffect(() => {
    if (vendorId) {
      dispatch(fetchTickets(vendorId));
    }
  }, [vendorId]);

  const [showModal, setShowModal] = useState(false);

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in-progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  const priorityColors: any = {
    high: "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
    critical: "bg-red-200 text-red-700",
  };

  const statusColors: any = {
    open: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
  };

  const icons: any = {
    technical: <AlertCircle size={20} className="text-gray-500" />,
    billing: <Folder size={20} className="text-gray-500" />,
    feature_request: <CheckCircle2 size={20} className="text-gray-500" />,
    general: <MessageSquare size={20} className="text-gray-500" />,
    others: <Clock size={20} className="text-gray-500" />,
  };

  return (
    <div className="p-6 space-y-6">

      {/* 🌟 Reusable Page Header */}
    <PageHeader
      title="Support Center"
      description="Get help and manage your support requests"
      addButtonLabel="New Ticket"
      onAdd={() => setShowModal(true)}
    />


      <div className="grid grid-cols-12 gap-6">

        {/* LEFT CONTENT */}
        <div className="col-span-8 space-y-5">

          {/* Tabs Section */}
          <div className="bg-white rounded-xl p-5 border">
            <div className="flex gap-8 border-b">
              <button className="text-purple-600 font-medium border-b-2 border-purple-600 pb-2">
                Support Tickets
              </button>
            </div>
          </div>

          {/* Ticket List */}
          <div className="space-y-5">
            {tickets.map((t: any) => (
              <div
                key={t.id}
                className="bg-white p-5 border rounded-xl shadow-sm flex justify-between hover:shadow-md transition"
              >
                <div className="flex gap-4">
                  {icons[t.category]}

                  <div>
                    <div className="flex gap-3 items-center mb-1">
                      <span className="text-sm text-gray-500 font-medium">
                        TKT-{t.id}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${statusColors[t.status]}`}
                      >
                        {t.status}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[t.priority]}`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg">{t.subject}</h3>

                    <p className="text-gray-600 text-sm">{t.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {t.created_at ?? "Just now"}
                      </span>
                      <span>Category: {t.category}</span>
                    </div>
                  </div>
                </div>

                <MessageSquareMore className="text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-4 space-y-6">
          {/* Stats */}
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Support Stats</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <AlertCircle className="text-blue-500" size={18} /> Open Tickets
                </span>
                <span className="font-semibold">{openTickets}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Clock className="text-orange-500" size={18} /> In Progress
                </span>
                <span className="font-semibold">{inProgress}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" size={18} /> Resolved
                </span>
                <span className="font-semibold">{resolved}</span>
              </div>
            </div>
          </div>

          {/* Help Resources */}
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold mb-3">Help Resources</h3>

            <button className="w-full bg-purple-50 hover:bg-purple-100 transition p-3 rounded-lg flex items-center gap-3">
              <Folder className="text-purple-600" size={18} />
              Documentation
            </button>

            <button className="w-full bg-orange-50 hover:bg-orange-100 transition p-3 rounded-lg flex items-center gap-3">
              <MessageSquare className="text-orange-600" size={18} />
              Community Forum
            </button>

            <button className="w-full bg-indigo-50 hover:bg-indigo-100 transition p-3 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="text-indigo-600" size={18} />
              Video Tutorials
            </button>
          </div>

          {/* Live Chat */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white space-y-4 shadow-lg">
            <h3 className="font-semibold text-lg">Need Immediate Help?</h3>
            <p className="text-purple-200 text-sm">
              Our support team is available 24/7
            </p>

            <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition p-3 rounded-lg flex items-center gap-3">
              <MessageSquare size={18} /> Start Live Chat
            </button>
          </div>
        </div>
      </div>

      <NewTicketModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
