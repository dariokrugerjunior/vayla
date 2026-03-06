import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { useStore } from '../../contexts/StoreContext';
import { Category } from '../../types';
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from '../../services/storefront';

export function Categories() {
  const { store, storeID } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!store) return;
    fetchAdminCategories(store.id).then(setCategories).catch(() => setCategories([]));
  }, [store]);

  const handleCreateCategory = async () => {
    const name = window.prompt('Nome da nova categoria:');
    if (!name || !name.trim()) {
      return;
    }

    try {
      const created = await createAdminCategory(storeID, { name: name.trim() });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Categoria criada com sucesso!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleEditCategory = async (category: Category) => {
    const name = window.prompt('Novo nome da categoria:', category.name);
    if (!name || !name.trim()) {
      return;
    }

    try {
      const updated = await updateAdminCategory(storeID, category.id, {
        name: name.trim(),
        slug: category.slug,
      });
      setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, ...updated } : c)));
      toast.success('Categoria atualizada com sucesso!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const ok = window.confirm(`Excluir a categoria "${category.name}"?`);
    if (!ok) {
      return;
    }

    try {
      await deleteAdminCategory(storeID, category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success('Categoria excluída com sucesso!');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categorias</h1>
          <p className="text-neutral-600">Organize seu catálogo</p>
        </div>
        <Button className="rounded-full" onClick={handleCreateCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-neutral-500">ID: {category.id}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.productCount}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDeleteCategory(category)}
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
