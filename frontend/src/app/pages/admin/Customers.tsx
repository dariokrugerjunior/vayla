import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { mockCustomers } from '../../data/mockData';

export function Customers() {
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
            {mockCustomers.map((customer) => (
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
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
