import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS';

export const metadata: Metadata = {
  title: {
    default: `Member Centre | ${siteName}`,
    template: `%s | ${siteName}`,
  },
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
