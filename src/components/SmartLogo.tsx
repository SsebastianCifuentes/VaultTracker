"use client";

import { useState } from "react";

interface SmartLogoProps {
  domain: string;
  name: string;
  className?: string;
}

export default function SmartLogo({
  domain,
  name,
  className = "",
}: SmartLogoProps) {
  const [imageSource, setImageSource] = useState<"clearbit" | "avatars" | "initial">(
    "clearbit",
  );
  const primarySrc = `https://logo.clearbit.com/${domain}`;
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f8fafc&color=0f172a&bold=true&size=128`;

  if (imageSource === "initial") {
    return (
      <span
        aria-label={name}
        className={`flex items-center justify-center bg-slate-100 font-bold text-slate-500 ${className}`}
        role="img"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSource === "clearbit" ? primarySrc : fallbackSrc}
      alt={name}
      className={`object-cover bg-white ${className}`}
      onError={() =>
        setImageSource((currentSource) =>
          currentSource === "clearbit" ? "avatars" : "initial",
        )
      }
    />
  );
}
