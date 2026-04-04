import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Account | GAPHTO",
    template: "%s | GAPHTO",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-950 via-green-900 to-green-800">
      {children}
    </div>
  );
}
