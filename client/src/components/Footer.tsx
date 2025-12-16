export function Footer() {
  const facebookUrl = "https://www.facebook.com/profile.php?id=61583223486613";

  return (
    <footer className="border-t border-neutral-800 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-400">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div>Exporium — premium sneakers store</div>
            <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white">
              Facebook page
            </a>
          </div>
          <div>© {new Date().getFullYear()} Exporium</div>
        </div>
      </div>
    </footer>
  );
}
