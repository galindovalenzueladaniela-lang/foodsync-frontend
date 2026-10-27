import { z } from 'zod';

/* Contratos de datos del cliente. Se validan con Zod al llegar del API Gateway (Anexo D: Zod). */

export const OpcionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precioExtra: z.number().int().nonnegative(),
});

/** RF10: área de cocina que prepara el producto; separa las comandas en el KDS. */
export const AreaSchema = z.enum(['caliente', 'fria', 'barra']);

/** Paleta de respaldo cuando el producto aún no tiene fotografía en MediaAAS. */
export const TonoSchema = z.enum(['paprika', 'salvia', 'miel', 'tinto', 'pizarra']);

export const ProductoSchema = z.object({
  id: z.string(),
  categoriaId: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  descripcionLarga: z.string().optional(),
  precio: z.number().int().nonnegative(),
  fotoUrl: z.string().url().optional(),
  tono: TonoSchema.default('miel'),
  area: AreaSchema,
  etiquetas: z.array(z.string()).default([]),
  /** RF4: productos destacados ("De la casa"). */
  destacado: z.string().optional(),
  /** RF4: descuentos o promociones temporales. */
  promocion: z.object({ etiqueta: z.string(), detalle: z.string() }).optional(),
  /** RF4: disponibilidad en tiempo real (agotado). */
  disponible: z.boolean(),
  /** RF4: opción obligatoria (p. ej. tamaño). La primera es la predeterminada. */
  variantes: z.array(OpcionSchema).default([]),
  /** RF4: extras con costo adicional. */
  extras: z.array(OpcionSchema).default([]),
});

export const CategoriaSchema = z.object({ id: z.string(), nombre: z.string() });

export const MenuSchema = z.object({
  categorias: z.array(CategoriaSchema),
  productos: z.array(ProductoSchema),
});

export const RestauranteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  logoUrl: z.string().url().optional(),
  fotoUrl: z.string().url().optional(),
  direccion: z.string(),
  horario: z.string(),
  cierraA: z.string(),
  contacto: z.string(),
  /** RF9: página de pedidos para llevar del restaurante (flujo aparte, aún sin diseño). */
  paraLlevarUrl: z.string().optional(),
  locale: z.string(),
  currency: z.string(),
  /** Los precios de la carta ya incluyen impuestos; la cuenta desglosa la parte de impuestos. */
  tasaImpuesto: z.number().min(0).max(1),
  /** RF11: porcentajes sugeridos configurables por el restaurante. */
  propinasSugeridas: z.array(z.number().int().min(0).max(100)),
});

export const MesaContextoSchema = z.object({
  token: z.string(),
  restaurante: RestauranteSchema,
  sucursal: z.object({ id: z.string(), nombre: z.string() }),
  mesa: z.object({ id: z.string(), numero: z.string(), area: z.string() }),
});

/** Estados del pedido, únicos para cliente y cocina (ver README: diferencia con "Nuevo/Aceptado" del Anexo E). */
export const EstadoPedidoSchema = z.enum(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado']);

/** RF10: platillo cancelado en cocina (p. ej. por falta de ingredientes), con su motivo. */
export const CancelacionSchema = z.object({ motivo: z.string(), en: z.string() });

export const LineaPedidoSchema = z.object({
  productoId: z.string(),
  nombre: z.string(),
  cantidad: z.number().int().positive(),
  varianteId: z.string().optional(),
  extrasIds: z.array(z.string()),
  detalle: z.string(),
  observaciones: z.string(),
  importe: z.number().nonnegative(),
  /** Área de cocina del producto. */
  area: AreaSchema.optional(),
  cancelada: CancelacionSchema.optional(),
});

export const PedidoSchema = z.object({
  id: z.string(),
  numero: z.string(),
  mesaToken: z.string(),
  estado: EstadoPedidoSchema,
  creadoEn: z.string(),
  historial: z.array(z.object({ estado: EstadoPedidoSchema, en: z.string() })),
  lineas: z.array(LineaPedidoSchema),
  total: z.number().nonnegative(),
});

/* ---------- Cocina · KDS (RF10) ---------- */

/** Por dónde llegó el pedido. */
export const CanalSchema = z.enum(['qr', 'mesero', 'para_llevar']);

/** Comanda: la parte de un pedido que prepara un área (un pedido con platos de varias áreas genera varias). */
export const ComandaSchema = z.object({
  id: z.string(),
  pedidoId: z.string(),
  numero: z.string(),
  /** "Mesa 7" o "Para llevar". */
  mesa: z.string(),
  canal: CanalSchema,
  area: AreaSchema,
  estado: EstadoPedidoSchema,
  creadoEn: z.string(),
  historial: z.array(z.object({ estado: EstadoPedidoSchema, en: z.string() })),
  /** Indicaciones del pedido completo (p. ej. "Recogen a las 22:00"). */
  nota: z.string().optional(),
  lineas: z.array(z.object({
    /** Posición de la línea dentro del pedido. */
    indice: z.number().int().nonnegative(),
    nombre: z.string(),
    cantidad: z.number().int().positive(),
    detalle: z.string(),
    observaciones: z.string(),
    cancelada: CancelacionSchema.optional(),
  })),
});

export const NotificacionCocinaSchema = z.object({
  id: z.string(),
  tipo: z.enum(['nuevo_pedido', 'cancelacion', 'retraso']),
  titulo: z.string(),
  detalle: z.string(),
  comandaId: z.string().optional(),
  en: z.string(),
  leida: z.boolean(),
});

/** RF2: persona del personal autenticada con Original Auth. */
export const PersonalSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  correo: z.string(),
  rol: z.string(),
  /** Área asignada; "todas" para quien coordina el pase. */
  area: z.union([AreaSchema, z.literal('todas')]),
  turno: z.object({ nombre: z.string(), horario: z.string(), equipo: z.array(z.string()) }),
});

/** Eventos en vivo entre cliente y cocina (mock: BroadcastChannel; backend: SSE o WebSocket, ver README). */
export const EventoTiempoRealSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('pedido.creado'), pedidoId: z.string(), comandaIds: z.array(z.string()) }),
  z.object({ tipo: z.literal('comanda.actualizada'), pedidoId: z.string(), comandaId: z.string(), estado: EstadoPedidoSchema }),
  z.object({ tipo: z.literal('platillo.cancelado'), pedidoId: z.string(), comandaId: z.string(), linea: z.number().int(), motivo: z.string() }),
  z.object({ tipo: z.literal('notificaciones.actualizadas') }),
]);

export const MetodoPagoSchema = z.enum(['original_pay', 'efectivo', 'terminal', 'transferencia']);

export type Opcion = z.infer<typeof OpcionSchema>;
export type Tono = z.infer<typeof TonoSchema>;
export type Producto = z.infer<typeof ProductoSchema>;
export type Categoria = z.infer<typeof CategoriaSchema>;
export type Menu = z.infer<typeof MenuSchema>;
export type Restaurante = z.infer<typeof RestauranteSchema>;
export type MesaContexto = z.infer<typeof MesaContextoSchema>;
export type EstadoPedido = z.infer<typeof EstadoPedidoSchema>;
export type LineaPedido = z.infer<typeof LineaPedidoSchema>;
export type Pedido = z.infer<typeof PedidoSchema>;
export type MetodoPago = z.infer<typeof MetodoPagoSchema>;
export type Area = z.infer<typeof AreaSchema>;
export type Canal = z.infer<typeof CanalSchema>;
export type Comanda = z.infer<typeof ComandaSchema>;
export type NotificacionCocina = z.infer<typeof NotificacionCocinaSchema>;
export type Personal = z.infer<typeof PersonalSchema>;
export type EventoTiempoReal = z.infer<typeof EventoTiempoRealSchema>;
