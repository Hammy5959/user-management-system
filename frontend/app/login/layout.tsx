"use client";
import React from "react";
import FloatingLines from "@/components/Lines";
import DarkVeil from "@/components/DarkVeil";
export default function loginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <DarkVeil />
      </div>
      <div className="relative z-10 ">{children}</div>
    </>
  );
}
