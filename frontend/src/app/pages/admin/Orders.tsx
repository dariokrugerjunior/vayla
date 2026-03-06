import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Order } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { deleteAdminOrder, fetchAdminOrders, updateAdminOrderStatus } from '../../services/storefront';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  contacted: 'Contatado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

function buildWhatsAppURL(order: Order): string | null {
  const digits = (order.customerPhone || '').replace(/\D/g, '');
  if (!digits) return null;
  const message = `Olá ${order.customerName || ''}, sobre seu pedido #${order.orderNumber || order.id}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function OrderDetailsDialog({ order }: { order: Order }) {
  const whatsappURL = useMemo(() => buildWhatsAppURL(order), [order]);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Detalhes do Pedido #{order.id}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
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
                    src={item.product.images[0] || 'https://placehold.co/600x600?text=Produto'}
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

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">R$ {order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {whatsappURL ? (
            <Button asChild className="flex-1">
              <a href={whatsappURL} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                Abrir no WhatsApp
              </a>
            </Button>
          ) : (
            <Button className="flex-1" disabled>
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp indisponível
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

export function Orders() {
  const { store, storeID } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadOrders = async () => {
    if (!store) return;
    try {
      const data = await fetchAdminOrders(store.id, {
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setOrders(data);
    } catch {
      setOrders([]);
      toast.error('Não foi possível carregar pedidos');
    }
  };

  useEffect(() => {
    loadOrders();
  }, [store]);

  const handleDeleteOrder = async (order: Order) => {
    const ok = window.confirm(`Excluir o pedido #${order.orderNumber || order.id}?`);
    if (!ok) return;

    try {
      await deleteAdminOrder(storeID, order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.success('Pedido excluído com sucesso!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleStatusChange = async (
    order: Order,
    nextStatus: 'pending' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    let restoreStock: boolean | undefined = undefined;
    if (nextStatus === 'cancelled' && (order.status === 'confirmed' || order.status === 'completed')) {
      const proceedCancel = window.confirm(`Cancelar o pedido #${order.orderNumber || order.id}?`);
      if (!proceedCancel) {
        return;
      }
      restoreStock = window.confirm('Deseja devolver os itens deste pedido para o estoque?');
    }

    const previousStatus = order.status;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
    try {
      await updateAdminOrderStatus(storeID, order.id, nextStatus, restoreStock);
      toast.success('Status atualizado!');
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previousStatus } : o)));
      toast.error((err as Error).message);
    }
  };

  const clearFilters = async () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    if (!store) return;
    try {
      const data = await fetchAdminOrders(store.id);
      setOrders(data);
    } catch {
      setOrders([]);
      toast.error('Não foi possível carregar pedidos');
    }
  };

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pedidos</h1>
          <p className="text-neutral-600">Gerencie os pedidos iniciados via WhatsApp</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="contacted">Contatado</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>Limpar</Button>
            <Button className="flex-1" onClick={loadOrders}>Filtrar</Button>
          </div>
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
            {orders.map((order) => (
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
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order,
                          e.target.value as 'pending' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'
                        )
                      }
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                    >
                      <option value="pending">Pendente</option>
                      <option value="contacted">Contatado</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <OrderDetailsDialog order={order} />
                    </Dialog>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteOrder(order)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
