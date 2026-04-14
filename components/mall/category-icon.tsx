"use client";

import Image from "next/image";

type CategoryIconProps = {
  icon?: string | null;
  name: string;
  size?: number;
};

export function CategoryIcon({ icon, name, size = 24 }: CategoryIconProps) {
  if (!icon) {
    return (
      <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1 }}>
        🏷️
      </span>
    );
  }

  const trimmed = icon.trim();
  const looksLikeUrl = trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://");

  if (looksLikeUrl) {
    return (
      <Image
        src={trimmed}
        alt={name}
        width={size}
        height={size}
        unoptimized
        loader={() => trimmed}
      />
    );
  }

  return (
    <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1 }}>
      {trimmed}
    </span>
  );
}
