export default function YouTubeCard({ url }: { url: string }) {
  return (
    <a href={url} className="block rounded-xl shadow">
      <img
        src={`https://img.youtube.com/vi/${url.split("v=")[1]}/hqdefault.jpg`}
      />
    </a>
  );
}
