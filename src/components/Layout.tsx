import { Link, useLocation } from "react-router-dom";
import { Mountain, BarChart3, List, BookOpen, MapPinned, Shirt, Users } from "lucide-react";

const navItems = [
  { to: "/", label: "대시보드", icon: BarChart3 },
  { to: "/mountains", label: "산 목록", icon: List },
  { to: "/map", label: "지도", icon: MapPinned },
  { to: "/records", label: "내 기록", icon: BookOpen },
  { to: "/gear", label: "장비", icon: Shirt },
  { to: "/social", label: "함께", icon: Users },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">백대명산</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
