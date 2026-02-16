import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AppShell({ children, title, subtitle }: Props) {
  const { user, logout, loading } = useAuth();
  const [location] = useLocation();

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "admin" || user?.role === "consultant";

  const nav = [
    { href: "/", label: "Home" },
    { href: "/simulator", label: "Simulatore" },
    { href: "/database", label: "Database CCNL" },
    { href: "/statistics", label: "Statistiche" },
    { href: "/legal", label: "Normativa" },
    { href: "/toolkit", label: "Toolkit" },
    { href: "/services", label: "Servizi" },
  ];

  const navAuth = [
    { href: "/my-ccnls", label: "I miei CCNL" },
    { href: "/requests", label: "Le mie richieste" },
  ];

  const navStaff = [{ href: "/admin/requests", label: "Gestione richieste" }];
  const navAdmin = [
    { href: "/admin", label: "Admin CCNL" },
    { href: "/admin/legal", label: "Admin Normativa" },
    { href: "/admin/users", label: "Utenti" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <a className="font-semibold tracking-tight">ENGEB • CCNL Simulator</a>
          </Link>
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {nav.map(item => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm hover:bg-muted transition",
                    location === item.href && "bg-muted"
                  )}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            {user && (
              <>
                <span className="mx-2 h-5 w-px bg-border" />
                {navAuth.map(item => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm hover:bg-muted transition",
                        location === item.href && "bg-muted"
                      )}
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
                {isStaff &&
                  navStaff.map(item => (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm hover:bg-muted transition",
                          location === item.href && "bg-muted"
                        )}
                      >
                        {item.label}
                      </a>
                    </Link>
                  ))}
                {isAdmin &&
                  navAdmin.map(item => (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm hover:bg-muted transition",
                          location === item.href && "bg-muted"
                        )}
                      >
                        {item.label}
                      </a>
                    </Link>
                  ))}
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:block text-xs text-muted-foreground">
                  {user.name ?? user.email}
                  {user.role ? ` • ${user.role}` : ""}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {(title || subtitle) && (
        <div className="mx-auto max-w-6xl px-4 py-6">
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 pb-10">{children}</main>
    </div>
  );
}
