import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { adminLogin } from '../../services/storefront';
import { setAdminToken } from '../../services/api';
import { useStore } from '../../contexts/StoreContext';
import { StoreNotFound } from '../../components/StoreNotFound';

export function AdminLogin() {
  const navigate = useNavigate();
  const { storeID } = useParams();
  const parsedStoreID = Number(storeID || 0);
  const { storeNotFound } = useStore();

  const [email, setEmail] = useState('admin@lojamodelo.local');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedStoreID) {
      toast.error('store_id inválido');
      return;
    }

    try {
      setLoading(true);
      const result = await adminLogin(parsedStoreID, email, password);
      setAdminToken(parsedStoreID, result.token);
      navigate(`/stores/id/${parsedStoreID}/admin`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (storeNotFound) {
    return <StoreNotFound />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
