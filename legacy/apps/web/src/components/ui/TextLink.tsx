"use client";

import React from "react";
import Link from "next/link";

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  arrow?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

export function TextLink({
  href,
  arrow = true,
  active = false,
  className = "",
  children,
  ...props
}: TextLinkProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  const content = (
    <span className={`editorial-link group ${active ? "active" : ""} ${className}`}>
      <span>{children}</span>
      {arrow && (
        <span
          className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </span>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} {...props}>
      {content}
    </Link>
  );
}
