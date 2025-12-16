import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-6">
      <div className="text-white font-semibold">Page not found</div>
      <div className="mt-2 text-sm text-neutral-400">The page you requested does not exist.</div>
      <Link to="/" className="mt-4 inline-block text-sm text-white underline">
        Go home
      </Link>
    </div>
  );
}
