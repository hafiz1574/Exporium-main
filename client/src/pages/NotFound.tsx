import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="text-neutral-900 font-semibold dark:text-white">Page not found</div>
      <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">The page you requested does not exist.</div>
      <Link to="/" className="mt-4 inline-block text-sm text-neutral-900 underline dark:text-white">
        Go home
      </Link>
    </div>
  );
}
