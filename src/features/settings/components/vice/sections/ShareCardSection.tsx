import QRCode from "qrcode";
import { Copy, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function ShareCardSection({ username, vendor }: { username?: string, vendor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  if (!username) return null;

  const baseUrl = window.location.origin;
  const cardUrl = `${baseUrl}/profile/${vendor}/${username}`;

  // 🔥 Generate QR
  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, cardUrl, {
      width: 100,      // 👈 Reduce size here (try 120–160)
      margin: 2,       // optional (default is 4)
    });
  }, [cardUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const url = canvasRef.current.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.png";
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* COPY LINK */}
      <div>
        <p className="text-sm font-medium mb-2">Copy Your Card Link</p>

        <div className="flex items-center border rounded-full px-4 py-2 bg-gray-50">
          <input
            value={cardUrl}
            readOnly
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={handleCopy}
            className="ml-2 text-gray-500 hover:text-black transition"
          >
            <Copy size={18} />
          </button>
        </div>

        {copied && (
          <p className="text-xs text-green-600 mt-1">Copied!</p>
        )}
      </div>

      {/* QR SECTION */}
      <div>
        <p className="text-sm font-medium mb-3">QR Code</p>

        {/* QR + Download */}
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gray-50 rounded-xl border">
            <canvas ref={canvasRef} />
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm hover:opacity-90 transition"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
