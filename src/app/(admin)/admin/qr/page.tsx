"use client";

import { useRef, useState } from "react";
import QRCode from "qrcode";

export default function QRGeneratorPage() {
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    if (!url) {
      alert("Please enter the menu URL.");
      return;
    }

    if (!url.startsWith("http")) {
      alert("Please enter a valid URL starting with https://");
      return;
    }

    try {
      const qr = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#0a0a08",
          light: "#ffffff",
        },
      });

      setQrDataUrl(qr);
    } catch (error) {
      console.error(error);
      alert("Failed to generate QR.");
    }
  };

  const downloadQR = async () => {
    if (!qrDataUrl) {
      alert("Generate QR first.");
      return;
    }

    const out = document.createElement("canvas");
    out.width = 400;
    out.height = 460;

    const ctx = out.getContext("2d");

    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 460);

    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 80, 40, 240, 240);

      ctx.fillStyle = "#0a0a08";
      ctx.font = "bold 18px serif";
      ctx.textAlign = "center";
      ctx.fillText("COLA GOA", 200, 330);

      ctx.fillStyle = "#888";
      ctx.font = "12px sans-serif";
      ctx.fillText("Scan to view our menu", 200, 355);

      ctx.fillStyle = "#c9a852";
      ctx.fillRect(120, 370, 160, 1);

      const link = document.createElement("a");
      link.download = "cola-goa-menu-qr.png";
      link.href = out.toDataURL("image/png");
      link.click();
    };

    img.src = qrDataUrl;
  };

  return (
    <div className="min-h-screen bg-[#0a0a08] flex items-center justify-center p-6">
      <div className="w-full max-w-[500px] rounded-[20px] border border-[#c9a85233] bg-[#1a1b17] p-10">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[4px] text-[#c9a852]">
          Internal Tool
        </p>

        <h1 className="mb-2 text-4xl text-[#f5f0e3]">
          Cola <span className="italic text-[#c9a852]">Goa</span>
        </h1>

        {/* <p className="mb-10 text-sm leading-7 text-[#f5f0e380]">
          Generate and download a QR code that links guests directly to the
          menu. Place the printed QR on tables, room folders, or at reception.
        </p> */}

        <div className="mb-8 h-px bg-[#c9a85222]" />

        <div className="mb-5">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2.5px] text-[#c9a852]">
            Menu URL
          </label>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://colagoa.com/dine"
            className="w-full rounded-lg border border-[#c9a85233] bg-[#0f100d] px-4 py-3 text-sm text-[#f5f0e3] outline-none focus:border-[#c9a852]"
          />
        </div>

        <button
          onClick={generateQR}
          className="w-full rounded-md border border-[#c9a852] py-4 text-xs font-semibold uppercase tracking-[3px] text-[#c9a852] transition hover:bg-[#c9a852] hover:text-black"
        >
          Generate QR Code
        </button>

        {qrDataUrl && (
          <div className="mt-10">
            <div className="mb-5 flex justify-center rounded-xl bg-white p-6">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="h-[240px] w-[240px]"
              />
            </div>

            <div className="mb-4 break-all rounded-lg border border-[#c9a85222] bg-[#0f100d] p-4 text-xs text-[#c9a852]">
              {url}
            </div>

            <button
              onClick={downloadQR}
              className="w-full rounded-md border border-green-700 py-4 text-xs font-semibold uppercase tracking-[3px] text-green-400 transition hover:bg-green-700 hover:text-white"
            >
              Download QR as PNG
            </button>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-teal-900/40 bg-teal-900/10 p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-cyan-300">
            How To Deploy
          </p>

          <div className="space-y-2 text-sm leading-7 text-[#f5f0e380]">
            <p>1. Upload your menu page to production</p>
            <p>2. Enter the public URL above</p>
            <p>3. Generate and download QR</p>
            <p>4. Print and place on dining tables</p>
            <p>5. Guest scans → menu opens → tells waiter</p>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}