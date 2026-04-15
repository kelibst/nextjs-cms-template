import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS';

export const metadata: Metadata = {
  title: {
    default: `Account | ${siteName}`,
    template: `%s | ${siteName}`,
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
