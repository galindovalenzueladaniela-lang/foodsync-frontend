import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';

interface Props {
  platos: number;
  mesa: string;
  total: string;
  onOpen: () => void;
}

/** Barra flotante con el resumen del pedido en curso. */
export function CartBar({ platos, mesa, total, onOpen }: Props) {
  return (
    <div className="floating flex items-center gap-3 rounded-full py-2 pl-4 pr-2">
      <span className="relative inline-flex text-primary">
        <Icon name="carrito" />
        <span className="absolute -right-2 -top-1.5 h-[18px] min-w-[18px] rounded-full bg-accent text-center text-[11px] font-bold leading-[18px] text-ink">{platos}</span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
        <span className="text-[13px] font-semibold leading-4">{platos === 1 ? '1 plato' : `${platos} platos`} · Mesa {mesa}</span>
        <span className="text-xs leading-4 text-ink-secondary">{total}</span>
      </div>
      <Button onClick={onOpen} className="rounded-full px-5">Ver pedido</Button>
    </div>
  );
}
