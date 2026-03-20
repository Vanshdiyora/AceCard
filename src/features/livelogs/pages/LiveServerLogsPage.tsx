import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../app/hooks";
import { useLiveLogs } from "../hooks/useLiveLogs";

export default function LiveServerLogsPage() {
  const token = useAppSelector((state: any) => state.auth.token);
  const { logs, connected } = useLiveLogs(token);

  const [paused, setPaused] = useState(false);
  const [clearedAt, setClearedAt] = useState<number | null>(null);
  const [snapshotLogs, setSnapshotLogs] = useState<typeof logs>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Handle pause logic
  useEffect(() => {
    if (paused) {
      queueMicrotask(() => setSnapshotLogs(filteredLogs));
    }
  }, [paused]);

  // Filter logs after clear
  const filteredLogs = clearedAt
    ? logs.filter(
        (log) => new Date(log.timestamp).getTime() > clearedAt
      )
    : logs;

  const logsToDisplay = paused ? snapshotLogs : filteredLogs;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logsToDisplay]);

  return (
    <div className="p-6 h-full flex flex-col">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Live Server Logs
          </h1>
          <p className="text-sm text-gray-500">
            Monitor real-time backend activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-gray-600">
              {connected ? "Live Connected" : "Disconnected"}
            </span>
          </div>

          {/* Pause */}
          <button
            onClick={() => setPaused((prev) => !prev)}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          >
            {paused ? "Resume" : "Pause"}
          </button>

          {/* Clear */}
          <button
            onClick={() => setClearedAt(Date.now())}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden flex-1">

        <div className="h-full overflow-y-auto p-6 bg-gray-50">

          {logsToDisplay.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">

              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                No Logs Available
              </h3>

              <p className="text-sm text-gray-500 max-w-sm">
                {connected
                  ? "Waiting for new server activity..."
                  : "Not connected to live server. Please check your connection."}
              </p>

              {connected && (
                <p className="text-xs text-gray-400 mt-3">
                  Logs will appear here in real-time.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {logsToDisplay.map((log) => {
                const levelStyles = {
                  info: "bg-blue-50 text-blue-600",
                  warn: "bg-yellow-50 text-yellow-600",
                  error: "bg-red-50 text-red-600",
                  debug: "bg-purple-50 text-purple-600",
                };

                const hasMethod = !!log.method;
                const hasStatus =
                  log.status !== undefined && log.status !== null;
                const hasPath = !!log.path;
                const hasIp = !!log.ip;
                const hasDuration = !!log.duration;
                const hasDevice = !!log.user_agent;

                return (
                  <div
                    key={log.id}
                    className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-wrap">

                        {log.level && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              levelStyles[log.level]
                            }`}
                          >
                            {log.level.toUpperCase()}
                          </span>
                        )}

                        {hasMethod && (
                          <span className="text-sm font-medium text-gray-700">
                            {log.method}
                          </span>
                        )}

                        {hasStatus && (
                          <span
                            className={`text-sm font-semibold ${
                              log.status >= 400
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {log.status}
                          </span>
                        )}
                      </div>

                      {log.timestamp && (
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {log.message && (
                      <p className="text-sm text-gray-800 mb-2">
                        {log.message}
                      </p>
                    )}

                    {(hasPath || hasIp || hasDuration || hasDevice) && (
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {hasPath && <span>Path: {log.path}</span>}
                        {hasIp && <span>IP: {log.ip}</span>}
                        {hasDuration && (
                          <span>Duration: {log.duration}</span>
                        )}
                        {hasDevice && (
                          <span>Device: {log.user_agent}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}