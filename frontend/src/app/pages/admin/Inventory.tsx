import { useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
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
import { mockProducts } from '../../data/mockData';

export function Inventory() {
  const allVariations = mockProducts.flatMap((product) =>
    product.variations.map((variation) => ({
      product,
      variation,
    }))
  );

  const lowStock = allVariations.filter((item) => item.variation.stock <= 5);
  const outOfStock = allVariations.filter((item) => item.variation.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Controle de Estoque</h1>
        <p className="text-neutral-600">Gerencie o estoque de todas as variações</p>
      </div>

      {/* Stats */}
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

      {/* Inventory Table */}
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
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-neutral-500">{item.product.category}</p>
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
                        defaultValue={item.variation.stock}
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
                    <Button variant="outline" size="sm">
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
