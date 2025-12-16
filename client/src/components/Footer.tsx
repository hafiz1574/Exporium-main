export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-400">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>Exporium — premium sneakers store</div>
          <div>© {new Date().getFullYear()} Exporium</div>
        </div>
      </div>
    </footer>
  );
}
