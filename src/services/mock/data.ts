import type { Menu, MesaContexto, Pedido } from '../types';

/* Datos de ejemplo tomados del diseño (lienzo FoodSync, cap. 12 · Web Cliente).
   Solo se usan cuando no hay VITE_API_URL configurada. */

export const DEMO_TOKEN = 'casa-olivo-centro-m7';

export const mesaDemo: MesaContexto = {
  token: DEMO_TOKEN,
  restaurante: {
    id: 'rest_casa_olivo',
    nombre: 'Casa Olivo',
    descripcion: 'Cocina mediterránea',
    direccion: 'Calle 12 #9-40, Centro',
    horario: 'Lunes a domingo · 12:00 a 23:00',
    cierraA: '23:00',
    contacto: 'hola@casaolivo.co · @casaolivo',
    paraLlevarUrl: '#para-llevar',
    locale: 'es-CO',
    currency: 'COP',
    tasaImpuesto: 0.08,
    propinasSugeridas: [10, 15, 20],
  },
  sucursal: { id: 'suc_centro', nombre: 'Sucursal Centro' },
  mesa: { id: 'mesa_7', numero: '7', area: 'Terraza' },
};

export const menuDemo: Menu = {
  categorias: [
    { id: 'entradas', nombre: 'Entradas' },
    { id: 'fuertes', nombre: 'Fuertes' },
    { id: 'postres', nombre: 'Postres' },
    { id: 'bebidas', nombre: 'Bebidas' },
  ],
  productos: [
    {
      id: 'burrata', categoriaId: 'entradas', nombre: 'Burrata con tomates asados',
      descripcion: 'Albahaca del huerto y pistacho.', precio: 34_000, tono: 'paprika',
      etiquetas: [], destacado: 'De la casa', disponible: true, variantes: [], extras: [],
    },
    {
      id: 'limonada', categoriaId: 'bebidas', nombre: 'Limonada de hierbabuena',
      descripcion: 'Hierbabuena fresca y limón.', precio: 12_000, tono: 'salvia', etiquetas: [],
      promocion: { etiqueta: 'Promoción', detalle: '2 × 1 de 17:00 a 19:00.' }, disponible: true, variantes: [], extras: [],
    },
    {
      id: 'risotto', categoriaId: 'fuertes', nombre: 'Risotto de hongos',
      descripcion: 'Arroz arborio, hongos del bosque y parmesano.',
      descripcionLarga: 'Arroz arborio, hongos del bosque, parmesano y aceite de trufa.',
      precio: 42_000, tono: 'miel', etiquetas: ['Vegetariano'], destacado: 'De la casa', disponible: true,
      variantes: [
        { id: 'individual', nombre: 'Porción individual', precioExtra: 0 },
        { id: 'compartir', nombre: 'Para compartir', precioExtra: 18_000 },
      ],
      extras: [
        { id: 'parmesano', nombre: 'Parmesano extra', precioExtra: 4_000 },
        { id: 'trufa', nombre: 'Aceite de trufa', precioExtra: 6_000 },
      ],
    },
    {
      id: 'pesca', categoriaId: 'fuertes', nombre: 'Pesca del día',
      descripcion: 'Con puré de coliflor y alcaparras.', precio: 58_000, tono: 'pizarra', etiquetas: [], disponible: true,
      variantes: [
        { id: 'coliflor', nombre: 'Puré de coliflor', precioExtra: 0 },
        { id: 'ensalada', nombre: 'Ensalada de la huerta', precioExtra: 0 },
      ],
      extras: [],
    },
    {
      id: 'cordero', categoriaId: 'fuertes', nombre: 'Cordero a la brasa',
      descripcion: 'Hierbas de la casa y papas rústicas.', precio: 64_000, tono: 'tinto', etiquetas: [],
      disponible: false, variantes: [], extras: [],
    },
  ],
};

/** Pedido ya enviado, para que la vista previa abra directamente en Estado y Pago. */
export function pedidoDemo(): Pedido {
  const creado = new Date(Date.now() - 12 * 60_000);
  const prep = new Date(creado.getTime() + 3 * 60_000);
  return {
    id: 'ped_0418', numero: '0418', mesaToken: DEMO_TOKEN, estado: 'en_preparacion',
    creadoEn: creado.toISOString(),
    historial: [
      { estado: 'pendiente', en: creado.toISOString() },
      { estado: 'en_preparacion', en: prep.toISOString() },
    ],
    lineas: [
      { productoId: 'risotto', nombre: 'Risotto de hongos', cantidad: 2, varianteId: 'individual', extrasIds: ['parmesano'],
        detalle: 'Porción individual · Parmesano extra', observaciones: 'Sin cebolla en uno, por favor.', importe: 92_000 },
      { productoId: 'pesca', nombre: 'Pesca del día', cantidad: 1, varianteId: 'coliflor', extrasIds: [],
        detalle: 'Puré de coliflor', observaciones: '', importe: 58_000 },
    ],
    total: 150_000,
  };
}
