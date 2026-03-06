import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, MoreVertical, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useStore } from '../../contexts/StoreContext';
import { Product } from '../../types';
import { fetchAdminProducts } from '../../services/storefront';

export function Products() {
  const { store, storeID } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const baseAdminPath = `/stores/id/${storeID}/admin`;
  const baseStorePath = `/stores/id/${storeID}`;

  useEffect(() => {
    if (!store) return;
    fetchAdminProducts(store.id).then(setProducts).catch(() => setProducts([]));
  }, [store]);

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produtos</h1>
          <p className="text-neutral-600">Gerencie seu catálogo de produtos</p>
        </div>
        <Link to={`${baseAdminPath}/products/new`}>
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vendas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const totalStock = product.totalStock || 0;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] || 'https://placehold.co/600x600?text=Produto'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-neutral-500">ID: {product.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.categoryName || '-'}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">R$ {product.price.toFixed(2)}</p>
                      {product.discountPrice > 0 && (
                        <p className="text-sm text-green-600">
                          Desconto: R$ {product.discountPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={totalStock > 10 ? 'default' : 'secondary'}>
                      {totalStock} un
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm">{product.views || 0}</span>
                      <span className="text-sm text-neutral-500">/ {product.sales || 0} vendas</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`${baseAdminPath}/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`${baseStorePath}/product/${product.slug || product.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver na Loja
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
