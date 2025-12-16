import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-full">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-[url('https://source.unsplash.com/2400x1600/?sneakers,shoes')] bg-cover bg-center opacity-35"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-cyan-400/10 to-amber-400/10 mix-blend-screen"
          aria-hidden="true"
        />
      </div>

      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
