"use client";

import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <h1 className="text-white text-4xl font-bold tracking-wider">
        INTOXICATED
      </h1>
    </div>
  );
}
