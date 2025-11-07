"use client";
import Footer from "../layout/Footer";
import Navbar from "../layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
