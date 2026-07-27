"use client";

import type { Track } from "@miusix/contracts";
import { useEffect, useMemo, useState } from "react";

type Props = {
  initialTracks: Track[];
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function Artwork({ track, compact = false }: { track: Track; compact?: boolean }) {
  return (
    <div
      className={compact ? "artwork artwork--compact" : "artwork"}
      style={{
        "--art-bg": track.artwork.background,
        "--art-fg": track.artwork.accent
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <span>{track.artwork.label}</span>
      <i />
    </div>
  );
}

export default function MusicApp({ initialTracks }: Props) {
  const [activeId, setActiveId] = useState(initialTracks[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(38);
  const activeTrack = useMemo(
    () => initialTracks.find((track) => track.id === activeId) ?? initialTracks[0],
    [activeId, initialTracks]
  );

  useEffect(() => {
    if (!playing || !activeTrack) return;
    const duration = activeTrack.durationSeconds;
    const timer = window.setInterval(() => {
      setElapsed((current) =>
        current >= duration ? 0 : current + 1
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeTrack, playing]);

  if (!activeTrack) return null;
  const selectedTrack = activeTrack;

  function selectTrack(track: Track) {
    setActiveId(track.id);
    setElapsed(0);
    setPlaying(true);
  }

  function move(direction: number) {
    const current = initialTracks.findIndex((track) => track.id === selectedTrack.id);
    const next = (current + direction + initialTracks.length) % initialTracks.length;
    const track = initialTracks[next];
    if (track) selectTrack(track);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Miusix home">
          <span className="brand-mark">M</span>
          <span>MIUSIX</span>
        </a>
        <nav aria-label="Primary navigation">
          <a className="nav-link nav-link--active" href="#"><span>⌂</span>Home</a>
          <a className="nav-link" href="#library"><span>⌕</span>Discover</a>
          <a className="nav-link" href="#library"><span>▤</span>Library</a>
        </nav>
        <div className="sidebar-section">
          <p>Your space</p>
          <a className="nav-link" href="#mix"><span>✦</span>Daily mix</a>
          <a className="nav-link" href="#recent"><span>↺</span>Recently played</a>
          <a className="nav-link" href="#liked"><span>♡</span>Liked songs</a>
        </div>
        <div className="profile">
          <span className="avatar">SW</span>
          <span><strong>Shuo Wang</strong><small>Personal library</small></span>
          <button aria-label="Profile options">•••</button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="history-buttons">
            <button aria-label="Go back">←</button>
            <button aria-label="Go forward">→</button>
          </div>
          <label className="search">
            <span>⌕</span>
            <input aria-label="Search music" placeholder="Search tracks, artists, albums…" />
            <kbd>⌘ K</kbd>
          </label>
          <button className="ghost-button">Connect a server</button>
        </header>

        <div className="page-content">
          <section className="hero-card" id="mix">
            <div className="hero-copy">
              <span className="eyebrow">Miusix original mix · 04</span>
              <h1>Night drive,<br />no destination.</h1>
              <p>Soft edges, warm synths, and just enough static for the road home.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => setPlaying(true)}>
                  <span>▶</span> Play mix
                </button>
                <button className="circle-button" aria-label="More options">•••</button>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="sun" />
              <span className="hero-word">AFTER<br />DARK</span>
              <i className="road road--one" />
              <i className="road road--two" />
            </div>
          </section>

          <section className="section" id="library">
            <div className="section-heading">
              <div><span className="eyebrow">Curated for this hour</span><h2>Made for you</h2></div>
              <button>See all <span>→</span></button>
            </div>
            <div className="album-grid">
              {initialTracks.map((track, index) => (
                <button
                  className={`album-card ${track.id === activeTrack.id ? "album-card--active" : ""}`}
                  key={track.id}
                  onClick={() => selectTrack(track)}
                >
                  <Artwork track={track} />
                  <span className="album-index">0{index + 1}</span>
                  <strong>{track.title}</strong>
                  <small>{track.artist} · {track.album}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="section track-section" id="recent">
            <div className="section-heading">
              <div><span className="eyebrow">Your listening history</span><h2>Back in rotation</h2></div>
            </div>
            <div className="track-list">
              {initialTracks.map((track, index) => (
                <button className="track-row" key={track.id} onClick={() => selectTrack(track)}>
                  <span className="row-number">{(index + 1).toString().padStart(2, "0")}</span>
                  <Artwork track={track} compact />
                  <span className="track-title"><strong>{track.title}</strong><small>{track.artist}</small></span>
                  <span className="track-album">{track.album}</span>
                  <span className="track-time">{formatTime(track.durationSeconds)}</span>
                  <span className="row-more">•••</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="player" aria-label="Now playing">
        <div className="now-playing">
          <Artwork track={activeTrack} compact />
          <span><strong>{activeTrack.title}</strong><small>{activeTrack.artist}</small></span>
          <button aria-label="Like track">♡</button>
        </div>
        <div className="transport">
          <div className="transport-buttons">
            <button aria-label="Shuffle">⌘</button>
            <button aria-label="Previous track" onClick={() => move(-1)}>←</button>
            <button className="play-button" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>
              {playing ? "Ⅱ" : "▶"}
            </button>
            <button aria-label="Next track" onClick={() => move(1)}>→</button>
            <button aria-label="Repeat">↻</button>
          </div>
          <div className="timeline">
            <span>{formatTime(elapsed)}</span>
            <input
              aria-label="Playback position"
              type="range"
              min="0"
              max={activeTrack.durationSeconds}
              value={elapsed}
              onChange={(event) => setElapsed(Number(event.target.value))}
            />
            <span>{formatTime(activeTrack.durationSeconds)}</span>
          </div>
        </div>
        <div className="player-tools">
          <button aria-label="Queue">▤</button>
          <button aria-label="Devices">◫</button>
          <span>◖</span>
          <input aria-label="Volume" type="range" defaultValue="68" />
        </div>
      </section>
    </main>
  );
}
