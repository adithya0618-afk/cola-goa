import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cola Goa Resort — CRM Dashboard",
  description: "Reception & Admin CRM for Cola Goa Resort",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className} style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AdminTopbar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
