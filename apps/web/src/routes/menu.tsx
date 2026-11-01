import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout untuk seluruh rute /menu.
 *
 * Rute ini WAJIB merender <Outlet /> — tanpa itu, /menu/$slug (anak rute ini)
 * tidak pernah ditampilkan dan pengunjung hanya melihat katalog. Isi katalog
 * sendiri ada di menu.index.tsx.
 */
export const Route = createFileRoute("/menu")({
  component: MenuLayout,
});

function MenuLayout() {
  return <Outlet />;
}
