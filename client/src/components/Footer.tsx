export function Footer() {
  const facebookUrl = "https://www.facebook.com/profile.php?id=61583223486613";

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div>Exporium — premium sneakers store</div>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Facebook page
            </a>
          </div>
          <div>© {new Date().getFullYear()} Exporium</div>
        </div>
      </div>
    </footer>
  );
}
