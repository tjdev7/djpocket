"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
}

interface PlayerState {
  isPlaying: boolean;
  track: Track | null;
  progress_ms: number;
  device: { name: string } | null;
}

export default function Player() {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchPlayerState = useCallback(async () => {
    try {
      const response = await fetch("/api/player");

      if (response.status === 401) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (response.status === 204) {
        setPlayerState(null);
        setError("No active device. Open Spotify and start playing something.");
        setLoading(false);
        setIsAuthenticated(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch player state");
      }

      const data = await response.json();
      setPlayerState({
        isPlaying: data.is_playing,
        track: data.item,
        progress_ms: data.progress_ms,
        device: data.device,
      });
      setError(null);
      setIsAuthenticated(true);
    } catch (err) {
      setError("Unable to load player state");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendCommand = async (command: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/player?action=${command}`, {
        method: "POST",
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to ${command}`);
      }

      await fetchPlayerState();
    } catch (err) {
      console.error(err);
      setError(`Failed to ${command}`);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerState();
    intervalRef.current = setInterval(fetchPlayerState, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPlayerState]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <p className="text-white mb-6">Please log in with Spotify to control playback</p>
        <a
          href="/api/auth/login"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all transform hover:scale-105"
        >
          Login with Spotify
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="text-white mt-4">Loading player...</p>
      </div>
    );
  }

  if (error || !playerState || !playerState.track) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <p className="text-yellow-300 mb-4">⚠️ {error || "No track currently playing"}</p>
        <p className="text-gray-300 text-sm">
          Make sure Spotify is open and playing on any device.
        </p>
        <button
          onClick={fetchPlayerState}
          className="mt-4 text-white underline hover:no-underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  const { track, isPlaying, progress_ms, device } = playerState;
  const albumImage = track.album.images[0]?.url || "/default-album.png";
  const progressPercent = (progress_ms / track.duration_ms) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transition-all">
      <div className="relative mb-4">
        <img
          src={albumImage}
          alt={track.album.name}
          className="w-full aspect-square object-cover rounded-xl shadow-lg"
        />
        {isPlaying && (
          <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <h2 className="text-white font-bold text-lg truncate">{track.name}</h2>
        <p className="text-gray-300 text-sm truncate">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
        <p className="text-gray-400 text-xs mt-1">{track.album.name}</p>
      </div>

      <div className="mb-4">
        <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-green-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-gray-400 text-xs mt-1">
          <span>{formatTime(progress_ms)}</span>
          <span>{formatTime(track.duration_ms)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => sendCommand("previous")}
          disabled={actionLoading}
          className="text-white hover:text-green-400 transition-colors disabled:opacity-50"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={() => sendCommand(isPlaying ? "pause" : "play")}
          disabled={actionLoading}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transition-all transform hover:scale-105 disabled:opacity-50"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => sendCommand("next")}
          disabled={actionLoading}
          className="text-white hover:text-green-400 transition-colors disabled:opacity-50"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {device && (
        <p className="text-center text-gray-400 text-xs mt-4">
          Playing on: {device.name}
        </p>
      )}
    </div>
  );
}
