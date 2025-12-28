import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-[url('https://source.unsplash.com/2400x1600/?sneakers,shoes')] bg-cover bg-center opacity-25 dark:opacity-35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white dark:from-black dark:via-black/70 dark:to-black"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-cyan-400/10 to-amber-400/10 mix-blend-screen"
          aria-hidden="true"
        />
      </div>

      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
