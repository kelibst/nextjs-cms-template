import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, className }: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-linear-to-br from-primary-deep via-primary-hover to-primary py-16 md:py-24",
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:1s]" />
        {/* Grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-4 flex items-center gap-2 text-sm text-primary-foreground/70">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-primary-foreground/50">/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-primary-foreground">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-primary-foreground/80">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
