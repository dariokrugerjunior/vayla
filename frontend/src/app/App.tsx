import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './contexts/CartContext';
import { StoreProvider } from './contexts/StoreContext';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CartProvider>
    </StoreProvider>
  );
}

export default App;
