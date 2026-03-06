import { useEffect, useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useStore } from '../../contexts/StoreContext';
import { fetchAdminInventory, updateAdminInventory } from '../../services/storefront';
import { Product, ProductVariation } from '../../types';

interface InventoryItem {
  product: Product;
  variation: ProductVariation;
}

export function Inventory() {
  const { store, storeID } = useStore();
  const [allVariations, setAllVariations] = useState<InventoryItem[]>([]);
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!store) return;
    fetchAdminInventory(store.id)
      .then((items) => {
        setAllVariations(items);
        const nextInputs: Record<number, string> = {};
        items.forEach((item) => {
          nextInputs[item.variation.id] = String(item.variation.stock);
        });
        setStockInputs(nextInputs);
      })
      .catch(() => setAllVariations([]));
  }, [store]);

  const handleUpdateStock = async (variantId: number) => {
    const raw = stockInputs[variantId] ?? '0';
    const stockQuantity = Number(raw);
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
      toast.error('Informe um estoque inteiro maior ou igual a 0');
      return;
    }

    try {
      const updated = await updateAdminInventory(storeID, variantId, stockQuantity);
      setAllVariations((prev) =>
        prev.map((item) =>
          item.variation.id === variantId
            ? { ...item, variation: { ...item.variation, stock: updated.stock_quantity } }
            : item
        )
      );
      setStockInputs((prev) => ({ ...prev, [variantId]: String(updated.stock_quantity) }));
      toast.success('Estoque atualizado!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const lowStock = allVariations.filter((item) => item.variation.stock <= 5);
  const outOfStock = allVariations.filter((item) => item.variation.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Controle de Estoque</h1>
        <p className="text-neutral-600">Gerencie o estoque de todas as variações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Total de Variações
            </CardTitle>
            <Package className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allVariations.length}</div>
            <p className="text-xs text-neutral-500 mt-1">variações cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStock.length}</div>
            <p className="text-xs text-yellow-600 mt-1">variações com estoque ≤ 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStock.length}</div>
            <p className="text-xs text-red-600 mt-1">variações esgotadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Variação</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Estoque Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVariations.map((item) => {
              const stockStatus =
                item.variation.stock === 0
                  ? 'out'
                  : item.variation.stock <= 5
                    ? 'low'
                    : 'good';

              return (
                <TableRow key={item.variation.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0] || 'https://placehold.co/600x600?text=Produto'}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-neutral-500">{item.product.categoryName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {item.variation.color} / {item.variation.size}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-sm">{item.variation.sku || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={stockInputs[item.variation.id] ?? ''}
                        onChange={(e) =>
                          setStockInputs((prev) => ({
                            ...prev,
                            [item.variation.id]: e.target.value,
                          }))
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-neutral-500">un</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {stockStatus === 'out' && (
                      <Badge variant="destructive">Esgotado</Badge>
                    )}
                    {stockStatus === 'low' && (
                      <Badge className="bg-yellow-100 text-yellow-800">Estoque Baixo</Badge>
                    )}
                    {stockStatus === 'good' && <Badge variant="secondary">Disponível</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStock(item.variation.id)}>
                      Atualizar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
