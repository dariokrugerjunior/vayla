import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, MessageCircle, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useStore } from '../../contexts/StoreContext';
import { Customer } from '../../types';
import { deleteAdminCustomer, fetchAdminCustomers, updateAdminCustomer } from '../../services/storefront';

function buildWhatsAppURL(phone: string): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function Customers() {
  const { store, storeID } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!store) return;
    fetchAdminCustomers(store.id).then(setCustomers).catch(() => setCustomers([]));
  }, [store]);

  const handleEditCustomer = async (customer: Customer) => {
    const name = window.prompt('Nome do cliente:', customer.name)?.trim();
    if (!name) return;

    const phone = window.prompt('WhatsApp do cliente:', customer.phone)?.trim();
    if (!phone) return;

    try {
      const updated = await updateAdminCustomer(storeID, customer.id, { name, phone });
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, name: updated.name, phone: updated.phone } : c))
      );
      toast.success('Cliente atualizado!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    const ok = window.confirm(`Excluir cliente ${customer.name}?`);
    if (!ok) return;

    try {
      await deleteAdminCustomer(storeID, customer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      toast.success('Cliente excluído!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleWhatsApp = (customer: Customer) => {
    const url = buildWhatsAppURL(customer.phone);
    if (!url) {
      toast.error('Cliente sem número de WhatsApp válido');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clientes</h1>
          <p className="text-neutral-600">Clientes que iniciaram conversas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Total de Pedidos</TableHead>
              <TableHead>Última Interação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-neutral-500">ID: {customer.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-sm">{customer.phone}</p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">{customer.totalOrders}</p>
                  <p className="text-sm text-neutral-500">
                    {customer.totalOrders === 1 ? 'pedido' : 'pedidos'}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {format(new Date(customer.lastInteraction), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleWhatsApp(customer)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDeleteCustomer(customer)}
                    >
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
