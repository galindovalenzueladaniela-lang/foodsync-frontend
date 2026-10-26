/* Rutas del cliente. Todas cuelgan del token de la mesa que viene en el QR. */
export const rutas = {
  escanear: () => '/escanear',
  qr: (t: string) => `/qr/${t}`,
  bienvenida: (t: string) => `/m/${t}`,
  menu: (t: string) => `/m/${t}/menu`,
  producto: (t: string, id: string, lineaId?: string) => `/m/${t}/menu/producto/${id}${lineaId ? `?linea=${lineaId}` : ''}`,
  pedido: (t: string) => `/m/${t}/pedido`,
  confirmacion: (t: string, pedidoId: string) => `/m/${t}/pedido/${pedidoId}/confirmacion`,
  estado: (t: string, pedidoId: string) => `/m/${t}/pedido/${pedidoId}`,
  cuenta: (t: string) => `/m/${t}/cuenta`,
};

/* Rutas de la cocina (KDS · RF10). Pantalla de tablet horizontal o escritorio. */
export const rutasCocina = {
  login: () => '/cocina/login',
  comandas: () => '/cocina',
  comanda: (id: string) => `/cocina/comanda/${encodeURIComponent(id)}`,
  pedidos: () => '/cocina/pedidos',
  notificaciones: () => '/cocina/notificaciones',
  perfil: () => '/cocina/perfil',
};
