'use client';

import ClientLayout from "@/components/Layout/ClientLayout";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}
