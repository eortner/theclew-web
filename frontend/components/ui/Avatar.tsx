export function Avatar({ name, src, size = 8 }: { name: string; src?: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  if (src) return <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full fire-bg flex items-center justify-center text-bg text-xs font-bold`}>
      {initials}
    </div>
  );
}
