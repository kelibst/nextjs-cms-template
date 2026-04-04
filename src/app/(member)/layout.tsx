import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Member Centre | GAPHTO",
    template: "%s | GAPHTO",
  },
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
