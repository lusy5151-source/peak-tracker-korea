import { Link, useLocation } from "react-router-dom";
import { Mountain, BarChart3, MapPinned, BookOpen, Shirt, Users, Home } from "lucide-react";

const navItems = [
  { to: "/", label: "홈", icon: Home },
  { to: "/map", label: "지도", icon: MapPinned },
  { to: "/records", label: "기록", icon: BookOpen },
  { to: "/gear", label: "장비", icon: Shirt },
  { to: "/social", label: "친구", icon: Users },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top header - minimal */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-foreground">백대명산</span>
          </Link>
          <Link
            to="/mountains"
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            산 목록
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-around px-2 py-1.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
