import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Cola Goa Resort",
  description: "Your premium beach escape in Goa",
};

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
