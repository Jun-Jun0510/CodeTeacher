"use client";

import { Header } from "@/components/layout/Header";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBar } from "@/components/layout/StatusBar";

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <MainLayout />
      <StatusBar />
    </div>
  );
}
