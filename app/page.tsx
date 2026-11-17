"use client";

import Player from "@/components/Player";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          🎵 DJ Pocket 🎵 
        </h1>
        <Player />
      </div>
    </main>
  );
}
