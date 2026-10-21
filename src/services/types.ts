import { z } from 'zod';

/* Contratos de datos del cliente. Se validan con Zod al llegar del API Gateway (Anexo D: Zod). */

export const OpcionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precioExtra: z.number().int().nonnegative(),
});

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

export const EstadoPedidoSchema = z.enum(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado']);

export const LineaPedidoSchema = z.object({
  productoId: z.string(),
  nombre: z.string(),
  cantidad: z.number().int().positive(),
  varianteId: z.string().optional(),
  extrasIds: z.array(z.string()),
  detalle: z.string(),
  observaciones: z.string(),
  importe: z.number().int().nonnegative(),
});

export const PedidoSchema = z.object({
  id: z.string(),
  numero: z.string(),
  mesaToken: z.string(),
  estado: EstadoPedidoSchema,
  creadoEn: z.string(),
  historial: z.array(z.object({ estado: EstadoPedidoSchema, en: z.string() })),
  lineas: z.array(LineaPedidoSchema),
  total: z.number().int().nonnegative(),
});

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
