export default function SocialLinks({ items }: { items: any[] }) {
  return (
    <div className="flex gap-3 justify-center">
      {items.map((s) => (
        <a key={s.id} href={s.url} target="_blank">
          {s.label}
        </a>
      ))}
    </div>
  );
}
