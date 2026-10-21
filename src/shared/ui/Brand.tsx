import isotipo from '../../assets/foodsync-isotipo.svg';

/** Firma discreta al pie: el restaurante es el protagonista; FoodSync solo firma. */
export function HospitalidadFoodSync() {
  return (
    <p className="flex items-center justify-center gap-2 text-xs text-ink-muted">
      <img src={isotipo} alt="" width={16} height={16} />
      Con la hospitalidad de FoodSync
    </p>
  );
}
