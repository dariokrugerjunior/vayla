import { createBrowserRouter, redirect } from "react-router";
import { STORE_ID, hasAdminToken } from "./services/api";
import { fetchStoreByDomain, fetchStoreByID, getDefaultStoreSlug } from "./services/storefront";
import { StorefrontLayout } from "./layouts/StorefrontLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { StoreHome } from "./pages/storefront/StoreHome";
import { ProductDetails } from "./pages/storefront/ProductDetails";
import { Cart } from "./pages/storefront/Cart";
import { WhatsAppCheckout } from "./pages/storefront/WhatsAppCheckout";
import { Dashboard } from "./pages/admin/Dashboard";
import { Products } from "./pages/admin/Products";
import { ProductEditor } from "./pages/admin/ProductEditor";
import { Categories } from "./pages/admin/Categories";
import { Orders } from "./pages/admin/Orders";
import { Customers } from "./pages/admin/Customers";
import { Inventory } from "./pages/admin/Inventory";
import { Analytics } from "./pages/admin/Analytics";
import { StoreSettings } from "./pages/admin/StoreSettings";
import { WhatsAppSettings } from "./pages/admin/WhatsAppSettings";
import { AdminLogin } from "./pages/admin/AdminLogin";

const defaultStoreSlug = getDefaultStoreSlug();
const adminBasePath = `/stores/id/${STORE_ID}/admin`;

function requireAdminAuth(storeIDParam: string | undefined) {
  const sid = Number(storeIDParam || 0);
  if (!sid) {
    return redirect(`/${defaultStoreSlug}`);
  }
  if (!hasAdminToken(sid)) {
    return redirect(`/stores/id/${sid}/admin/login`);
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    loader: async () => {
      if (typeof window !== "undefined") {
        try {
          const store = await fetchStoreByDomain(window.location.hostname);
          if (store.slug) {
            return redirect(`/${store.slug}`);
          }
        } catch {
          // fallback below
        }
      }
      return redirect(`/${defaultStoreSlug}`);
    },
  },
  { path: "/admin", loader: () => redirect(adminBasePath) },
  {
    path: "/stores/id/:storeID/*",
    loader: async ({ params }) => {
      const sid = Number(params.storeID || 0);
      if (!sid) return redirect(`/${defaultStoreSlug}`);
      const suffix = (params["*"] || "").replace(/^\/+/, "");
      try {
        const store = await fetchStoreByID(sid);
        return redirect(suffix ? `/${store.slug}/${suffix}` : `/${store.slug}`);
      } catch {
        return redirect(`/${defaultStoreSlug}`);
      }
    },
  },
  {
    path: "/:storeSlug",
    Component: StorefrontLayout,
    children: [
      { index: true, Component: StoreHome },
      { path: "product/:slug", Component: ProductDetails },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: WhatsAppCheckout },
    ],
  },
  {
    path: "/stores/id/:storeID/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/stores/id/:storeID/admin",
    loader: ({ params }) => requireAdminAuth(params.storeID),
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "products", Component: Products },
      { path: "products/new", Component: ProductEditor },
      { path: "products/:id/edit", Component: ProductEditor },
      { path: "categories", Component: Categories },
      { path: "orders", Component: Orders },
      { path: "customers", Component: Customers },
      { path: "inventory", Component: Inventory },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: StoreSettings },
      { path: "whatsapp", Component: WhatsAppSettings },
    ],
  },
]);
