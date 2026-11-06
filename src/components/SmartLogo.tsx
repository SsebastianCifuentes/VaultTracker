"use client";

import { useState, useSyncExternalStore } from "react";

const subscribeToHydration = () => () => {};
const getHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

interface SmartLogoProps {
  domain: string;
  name: string;
  initial?: string;
  className?: string;
}

export default function SmartLogo({
  domain,
  name,
  initial,
  className = "",
}: SmartLogoProps) {
  const [imageSource, setImageSource] = useState<
    "favicon" | "avatars" | "initial"
  >("favicon");
  const fallbackInitial = initial ?? name.charAt(0).toUpperCase();
  const faviconSrc = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f8fafc&color=0f172a&bold=true&size=128`;
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  if (!isHydrated || imageSource === "initial") {
    return (
      <span
        aria-label={name}
        className={`flex items-center justify-center bg-slate-100 font-bold text-slate-500 ${className}`}
        role="img"
      >
        {fallbackInitial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSource === "favicon" ? faviconSrc : fallbackSrc}
      alt={name}
      className={`object-cover bg-white ${className}`}
      onError={() =>
        setImageSource((currentSource) =>
          currentSource === "favicon" ? "avatars" : "initial",
        )
      }
    />
  );
}
