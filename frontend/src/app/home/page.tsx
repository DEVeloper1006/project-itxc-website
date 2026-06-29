"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("gate1") !== "open") {
      window.location.href = "/";
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-10">
      <h1 className="text-white text-4xl font-bold tracking-wider">
        INTOXICATED
      </h1>
      <Link
        href="/home/zine"
        className="px-6 py-3 border border-red-900/60 text-red-500 text-sm font-mono uppercase tracking-widest hover:bg-red-900/20 hover:border-red-700/60 transition-all"
      >
        Enter Zine
      </Link>
    </div>
  );
}
