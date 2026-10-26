import type { Menu, MesaContexto } from '../types';

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
    locale: 'es-MX',
    currency: 'MXN',
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
      descripcion: 'Albahaca del huerto y pistacho.', precio: 165, tono: 'paprika', area: 'fria',
      etiquetas: [], destacado: 'De la casa', disponible: true, variantes: [], extras: [],
    },
    {
      id: 'limonada', categoriaId: 'bebidas', nombre: 'Limonada de hierbabuena',
      descripcion: 'Hierbabuena fresca y limón.', precio: 45, tono: 'salvia', area: 'barra', etiquetas: [],
      promocion: { etiqueta: 'Promoción', detalle: '2 × 1 de 17:00 a 19:00.' }, disponible: true, variantes: [], extras: [],
    },
    {
      id: 'risotto', categoriaId: 'fuertes', nombre: 'Risotto de hongos',
      descripcion: 'Arroz arborio, hongos del bosque y parmesano.',
      descripcionLarga: 'Arroz arborio, hongos del bosque, parmesano y aceite de trufa.',
      precio: 185, tono: 'miel', area: 'caliente', etiquetas: ['Vegetariano'], destacado: 'De la casa', disponible: true,
      variantes: [
        { id: 'individual', nombre: 'Porción individual', precioExtra: 0 },
        { id: 'compartir', nombre: 'Para compartir', precioExtra: 80 },
      ],
      extras: [
        { id: 'parmesano', nombre: 'Parmesano extra', precioExtra: 25 },
        { id: 'trufa', nombre: 'Aceite de trufa', precioExtra: 35 },
      ],
    },
    {
      id: 'pesca', categoriaId: 'fuertes', nombre: 'Pesca del día',
      descripcion: 'Con puré de coliflor y alcaparras.', precio: 245, tono: 'pizarra', area: 'caliente', etiquetas: [], disponible: true,
      variantes: [
        { id: 'coliflor', nombre: 'Puré de coliflor', precioExtra: 0 },
        { id: 'ensalada', nombre: 'Ensalada de la huerta', precioExtra: 0 },
      ],
      extras: [],
    },
    {
      id: 'cordero', categoriaId: 'fuertes', nombre: 'Cordero a la brasa',
      descripcion: 'Hierbas de la casa y papas rústicas.', precio: 290, tono: 'tinto', area: 'caliente', etiquetas: [],
      disponible: false, variantes: [], extras: [],
    },
  ],
};
