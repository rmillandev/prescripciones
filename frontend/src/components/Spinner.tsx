export function Spinner({ size = 6 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="animate-spin rounded-full border-2 border-[#00D9FF] border-t-transparent"
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
      />
    </div>
  );
}
