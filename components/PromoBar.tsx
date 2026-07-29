export default function PromoBar() {
  return (
    <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-white py-3 px-4 text-center shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="text-lg sm:text-xl font-bold">🎉</span>
        <span className="text-sm sm:text-base font-semibold">
          Envío gratis a todo el país • Compra mínima $1.000
        </span>
        <span className="text-lg sm:text-xl font-bold">🎉</span>
      </div>
    </div>
  );
}
