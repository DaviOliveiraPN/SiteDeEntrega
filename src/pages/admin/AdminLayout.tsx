import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { RequireAdmin } from "../../lib/auth.tsx";
import { supabase } from "../../lib/supabase.ts";
import "./admin.css";

// Sidebar entries. New admin feature = one more item here + its route in router.tsx.
const NAV = [
  { to: "/admin/entregas", label: "Entregas" },
  { to: "/admin/site", label: "Página inicial" },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <RequireAdmin>
      <div className="admin">
        <header className="admin-topbar">
          <button
            className="admin-menu-btn"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="admin-sidebar"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
          <span className="admin-brand">Painel</span>
        </header>

        {open && <div className="admin-backdrop" onClick={() => setOpen(false)} />}

        <nav id="admin-sidebar" className={`admin-sidebar${open ? " is-open" : ""}`} aria-label="Menu do painel">
          <div className="admin-brand admin-sidebar-brand">Painel</div>
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="admin-nav-link" onClick={() => setOpen(false)}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
          <button className="admin-nav-link admin-signout" onClick={() => supabase.auth.signOut()}>Sair</button>
        </nav>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </RequireAdmin>
  );
}
