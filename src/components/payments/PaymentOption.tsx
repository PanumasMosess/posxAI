const PaymentOption = ({ icon: Icon, label, active, onClick, disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
      active
        ? "bg-white border-zinc-900 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:border-zinc-100 dark:text-white"
        : "bg-transparent border-zinc-200 text-zinc-400 hover:bg-white hover:border-zinc-300 dark:border-zinc-800"
    }`}
  >
    <Icon className="h-5 w-5 mb-1" />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);
export default PaymentOption;
