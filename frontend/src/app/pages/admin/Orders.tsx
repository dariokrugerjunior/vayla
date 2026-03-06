import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, MessageCircle } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

const statusLabels = {
  pending: 'Pendente',
  contacted: 'Contatado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
};

function OrderDetailsDialog({ order }: { order: Order }) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Detalhes do Pedido #{order.id}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {/* Customer Info */}
        <div>
          <h3 className="font-semibold mb-3">Informações do Cliente</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-600">Nome</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-neutral-600">WhatsApp</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-neutral-600">Data do Pedido</p>
              <p className="font-medium">
                {format(new Date(order.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-neutral-600">Status</p>
              <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h3 className="font-semibold mb-3">Produtos</h3>
          <div className="space-y-3">
            {order.items.map((item) => {
              const price = item.product.discountPrice || item.product.price;
              return (
                <div
                  key={`${item.product.id}-${item.variation.id}`}
                  className="flex gap-4 p-3 bg-neutral-50 rounded-lg"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-neutral-600">
                      {item.variation.color} • {item.variation.size}
                    </p>
                    <p className="text-sm text-neutral-600">Qtd: {item.quantity}</p>
                  </div>
                  <div className="font-semibold">R$ {(price * item.quantity).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">R$ {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Abrir no WhatsApp
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pedidos</h1>
          <p className="text-neutral-600">Gerencie os pedidos iniciados via WhatsApp</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-neutral-500">{order.customerPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {format(new Date(order.createdAt), 'HH:mm', { locale: ptBR })}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <OrderDetailsDialog order={order} />
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
