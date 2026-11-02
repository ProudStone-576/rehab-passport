"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function Qr({ value, size = 120 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let live = true;
    QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then((s) => {
      if (live) setSvg(s);
    });
    return () => {
      live = false;
    };
  }, [value]);

  return (
    <div
      className="qr"
      style={{ width: size, height: size }}
      aria-label="QR code linking to the exercise video"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
