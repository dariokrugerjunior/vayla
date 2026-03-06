import { createBrowserRouter } from "react-router";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: StorefrontLayout,
    children: [
      { index: true, Component: StoreHome },
      { path: "product/:slug", Component: ProductDetails },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: WhatsAppCheckout },
    ],
  },
  {
    path: "/admin",
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
