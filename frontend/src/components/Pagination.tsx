export function Pagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[#1A3A43] px-4 py-3">
      <p className="text-sm text-[#A7B8BD]">
        Pagina {page} de {pages}
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-md border border-[#1A3A43] px-3 py-1 text-sm text-[#A7B8BD] hover:text-white disabled:opacity-40 transition"
        >
          Anterior
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="rounded-md border border-[#1A3A43] px-3 py-1 text-sm text-[#A7B8BD] hover:text-white disabled:opacity-40 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
