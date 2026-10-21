import { useEffect, useState } from 'react';
import { obtenerMenu } from '../../../services/menuService';
import type { Menu } from '../../../services/types';

export function useMenu(token: string) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let vivo = true;
    obtenerMenu(token).then((m) => vivo && setMenu(m)).catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, [token]);
  return { menu, error };
}
