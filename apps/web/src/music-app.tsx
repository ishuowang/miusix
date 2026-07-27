"use client";

import type { MediaSearchResult, Track } from "@miusix/contracts";
import { createMiusixClient } from "@miusix/sdk";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  initialTracks: Track[];
};

type ViewMode = "web" | "ios";
type SearchStatus = "idle" | "searching" | "importing" | "error";

const apiBase = import.meta.env.VITE_API_URL?.trim() || "/api";
const api = createMiusixClient(apiBase);

function apiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${apiBase.replace(/\/$/, "")}${path}`;
}

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

function ViewToggle({
  value,
  onChange,
  inverse = false
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  inverse?: boolean;
}) {
  return (
    <div className={`view-toggle ${inverse ? "view-toggle--inverse" : ""}`} aria-label="Interface view">
      <button
        className={value === "web" ? "view-toggle__active" : ""}
        type="button"
        onClick={() => onChange("web")}
      >
        Web
      </button>
      <button
        className={value === "ios" ? "view-toggle__active" : ""}
        type="button"
        onClick={() => onChange("ios")}
      >
        iOS
      </button>
    </div>
  );
}

function SearchResults({
  results,
  localResults,
  status,
  message,
  compact = false,
  onSelect,
  onLocalSelect,
}: {
  results: MediaSearchResult[];
  localResults: Track[];
  status: SearchStatus;
  message: string;
  compact?: boolean;
  onSelect: (result: MediaSearchResult) => void;
  onLocalSelect: (track: Track) => void;
}) {
  if (status === "idle" && results.length === 0 && localResults.length === 0 && !message) return null;
  return (
    <section className={`search-results ${compact ? "search-results--compact" : ""}`} aria-live="polite">
      <div className="search-results__heading">
        <span className="eyebrow">YouTube results</span>
        <span>{status === "searching" ? "Searching…" : status === "importing" ? "Caching audio…" : message}</span>
      </div>
      {status === "error" && <p className="search-results__error">{message}</p>}
      <div className="search-results__list">
        {localResults.map((track) => (
          <button type="button" key={track.id} onClick={() => onLocalSelect(track)}>
            <Artwork track={track} compact />
            <span><strong>{track.title}</strong><small>{track.artist} · local demo</small></span>
            <time>{formatTime(track.durationSeconds)}</time>
            <b>▶</b>
          </button>
        ))}
        {results.map((result) => (
          <button type="button" key={result.sourceId} onClick={() => onSelect(result)} disabled={status === "importing"}>
            {result.thumbnailUrl
              ? <img src={result.thumbnailUrl} alt="" loading="lazy" />
              : <span className="search-results__fallback">YT</span>}
            <span><strong>{result.title}</strong><small>{result.artist}</small></span>
            <time>{formatTime(result.durationSeconds)}</time>
            <b>＋</b>
          </button>
        ))}
      </div>
    </section>
  );
}

type IosPreviewProps = {
  activeTrack: Track;
  tracks: Track[];
  playing: boolean;
  favorite: boolean;
  query: string;
  searchResults: MediaSearchResult[];
  localSearchResults: Track[];
  searchStatus: SearchStatus;
  searchMessage: string;
  onPlayPause: () => void;
  onFavorite: () => void;
  onQueryChange: (query: string) => void;
  onSearch: (event: React.FormEvent<HTMLFormElement>) => void;
  onSearchResult: (result: MediaSearchResult) => void;
  onLocalSearchResult: (track: Track) => void;
  onSelectTrack: (track: Track) => void;
  onViewChange: (mode: ViewMode) => void;
};

function IosPreview({
  activeTrack,
  tracks,
  playing,
  favorite,
  query,
  searchResults,
  localSearchResults,
  searchStatus,
  searchMessage,
  onPlayPause,
  onFavorite,
  onQueryChange,
  onSearch,
  onSearchResult,
  onLocalSearchResult,
  onSelectTrack,
  onViewChange
}: IosPreviewProps) {
  function scrollTo(selector: string) {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="ios-stage">
      <header className="ios-preview-header">
        <a className="ios-preview-brand" href="#" aria-label="Miusix home">
          <span className="brand-mark">M</span>
          <span>MIUSIX</span>
        </a>
        <span className="ios-preview-label">Interface preview</span>
        <ViewToggle value="ios" onChange={onViewChange} inverse />
      </header>

      <section className="iphone" aria-label="Miusix iOS application preview">
        <div className="iphone__island" aria-hidden="true" />
        <div className="iphone__screen">
          <div className="ios-statusbar" aria-hidden="true">
            <span>9:41</span>
            <span>● ᯤ ▰</span>
          </div>

          <div className="ios-app-header">
            <div>
              <span className="eyebrow">Good evening</span>
              <strong>MIUSIX</strong>
            </div>
            <span className="ios-avatar">SW</span>
          </div>

          <div className="ios-scroll">
            <form className="ios-search" onSubmit={onSearch}>
              <span>⌕</span>
              <input
                aria-label="Search music"
                placeholder="Artists, albums, tracks"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
              <button type="submit" aria-label="Submit search">→</button>
            </form>
            <SearchResults
              compact
              results={searchResults}
              localResults={localSearchResults}
              status={searchStatus}
              message={searchMessage}
              onSelect={onSearchResult}
              onLocalSelect={onLocalSearchResult}
            />

            <section className="ios-mix">
              <span className="eyebrow">Miusix original · 04</span>
              <i aria-hidden="true" />
              <h1>Night drive,<br />no destination.</h1>
              <p>Warm synths and soft static for the road home.</p>
              <button type="button" onClick={() => !playing && onPlayPause()}>
                ▶&nbsp;&nbsp; Play mix
              </button>
            </section>

            <section className="ios-section">
              <div className="ios-section-heading">
                <div><span className="eyebrow">Curated for this hour</span><h2>Made for you</h2></div>
                <button type="button" onClick={() => scrollTo(".ios-albums")}>See all →</button>
              </div>
              <div className="ios-albums">
                {tracks.map((track) => (
                  <button type="button" key={track.id} onClick={() => onSelectTrack(track)}>
                    <Artwork track={track} />
                    <strong>{track.title}</strong>
                    <small>{track.artist}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="ios-section ios-history">
              <div className="ios-section-heading">
                <div><span className="eyebrow">Your listening history</span><h2>Back in rotation</h2></div>
              </div>
              {tracks.map((track, index) => (
                <button type="button" className="ios-track" key={track.id} onClick={() => onSelectTrack(track)}>
                  <span>0{index + 1}</span>
                  <Artwork track={track} compact />
                  <span><strong>{track.title}</strong><small>{track.artist}</small></span>
                  <span>•••</span>
                </button>
              ))}
            </section>
          </div>

          <section className="ios-player" aria-label="Now playing">
            <Artwork track={activeTrack} compact />
            <span><strong>{activeTrack.title}</strong><small>{activeTrack.artist}</small></span>
            <button
              className={`ios-favorite ${favorite ? "ios-favorite--active" : ""}`}
              type="button"
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorite}
              onClick={onFavorite}
            >
              {favorite ? "♥" : "♡"}
            </button>
            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={onPlayPause}>
              {playing ? "Ⅱ" : "▶"}
            </button>
          </section>

          <nav className="ios-tabs" aria-label="iOS navigation">
            <button type="button" onClick={() => scrollTo(".ios-scroll")}><span>⌂</span>Home</button>
            <button type="button" onClick={() => scrollTo(".ios-search")}><span>⌕</span>Discover</button>
            <button type="button" onClick={() => scrollTo(".ios-history")}><span>▤</span>Library</button>
          </nav>
        </div>
      </section>
      <p className="ios-preview-note">A browser preview of the shared iOS product language.</p>
    </main>
  );
}

export default function MusicApp({ initialTracks }: Props) {
  const [tracks, setTracks] = useState(initialTracks);
  const [activeId, setActiveId] = useState(initialTracks[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(38);
  const [viewMode, setViewMode] = useState<ViewMode>("web");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MediaSearchResult[]>([]);
  const [localSearchResults, setLocalSearchResults] = useState<Track[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [searchMessage, setSearchMessage] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("miusix:favorites") ?? "[]") as string[]);
    } catch {
      return new Set();
    }
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ context: AudioContext; oscillators: OscillatorNode[] } | null>(null);
  const activeTrack = useMemo(
    () => tracks.find((track) => track.id === activeId) ?? tracks[0],
    [activeId, tracks]
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("timeupdate", () => setElapsed(audio.currentTime));
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("error", () => {
      setPlaying(false);
      setSearchStatus("error");
      setSearchMessage("Audio is not cached yet. Search and add a playable result first.");
    });
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audioRef.current = null;
      synthRef.current?.oscillators.forEach((oscillator) => oscillator.stop());
      void synthRef.current?.context.close();
      synthRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeTrack || !audioRef.current) return;
    synthRef.current?.oscillators.forEach((oscillator) => oscillator.stop());
    void synthRef.current?.context.close();
    synthRef.current = null;
    if (activeTrack.streamUrl.startsWith("/audio/")) {
      audioRef.current.removeAttribute("src");
    } else {
      audioRef.current.src = apiUrl(activeTrack.streamUrl);
    }
    setElapsed(0);
  }, [activeTrack]);

  useEffect(() => {
    if (!activeTrack) return;
    if (activeTrack.streamUrl.startsWith("/audio/")) {
      if (!playing) {
        synthRef.current?.oscillators.forEach((oscillator) => oscillator.stop());
        void synthRef.current?.context.close();
        synthRef.current = null;
        return;
      }
      if (!synthRef.current) {
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = 0.035;
        gain.connect(context.destination);
        const seed = activeTrack.artwork.label.charCodeAt(0);
        const oscillators = [0, 7, 12].map((offset, index) => {
          const oscillator = context.createOscillator();
          oscillator.type = index === 0 ? "sine" : "triangle";
          oscillator.frequency.value = 110 * 2 ** ((seed % 7 + offset) / 12);
          oscillator.connect(gain);
          oscillator.start();
          return oscillator;
        });
        synthRef.current = { context, oscillators };
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      void audio.play().catch(() => {
        setPlaying(false);
        setSearchStatus("error");
        setSearchMessage("Playback was blocked or the audio source is unavailable.");
      });
    } else {
      audio.pause();
    }
  }, [playing, activeTrack]);

  useEffect(() => {
    if (!playing || !activeTrack?.streamUrl.startsWith("/audio/")) return;
    const timer = window.setInterval(() => {
      setElapsed((current) => current >= activeTrack.durationSeconds ? 0 : current + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, activeTrack]);

  if (!activeTrack) return null;
  const selectedTrack = activeTrack;

  function selectTrack(track: Track) {
    setActiveId(track.id);
    setElapsed(0);
    setPlaying(true);
  }

  function move(direction: number) {
    const current = tracks.findIndex((track) => track.id === selectedTrack.id);
    const next = (current + direction + tracks.length) % tracks.length;
    const track = tracks[next];
    if (track) selectTrack(track);
  }

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value.length < 2) {
      setSearchStatus("error");
      setSearchMessage("Type at least two characters.");
      return;
    }
    setSearchStatus("searching");
    setSearchMessage("");
    try {
      const results = await api.search(value);
      setSearchResults(results);
      setLocalSearchResults([]);
      setSearchStatus("idle");
      setSearchMessage(results.length ? `${results.length} results` : "No results");
    } catch (error) {
      const normalized = value.toLocaleLowerCase();
      const matches = tracks.filter((track) =>
        [track.title, track.artist, track.album].some((field) =>
          field.toLocaleLowerCase().includes(normalized)));
      setSearchResults([]);
      setLocalSearchResults(matches);
      setSearchStatus(matches.length ? "idle" : "error");
      setSearchMessage(matches.length
        ? `API unavailable · ${matches.length} local result${matches.length === 1 ? "" : "s"}`
        : error instanceof Error ? error.message : "Search failed");
    }
  }

  async function importSearchResult(result: MediaSearchResult) {
    setSearchStatus("importing");
    setSearchMessage(`Caching “${result.title}”…`);
    try {
      const track = await api.importMedia(result);
      setTracks((current) => [track, ...current.filter((item) => item.id !== track.id)]);
      setActiveId(track.id);
      setSearchResults([]);
      setLocalSearchResults([]);
      setSearchStatus("idle");
      setSearchMessage("Ready to play");
      setPlaying(true);
    } catch (error) {
      setSearchStatus("error");
      setSearchMessage(error instanceof Error ? error.message : "Import failed");
    }
  }

  async function checkServer() {
    setSearchStatus("searching");
    setSearchMessage("Checking API…");
    setSearchResults([]);
    setLocalSearchResults([]);
    try {
      const health = await api.health();
      setSearchStatus("idle");
      setSearchMessage(`Connected to ${health.service} ${health.version}`);
    } catch (error) {
      setSearchStatus("error");
      setSearchMessage(error instanceof Error ? error.message : "API connection failed");
    }
  }

  function toggleFavorite() {
    const next = new Set(favorites);
    if (next.has(selectedTrack.id)) next.delete(selectedTrack.id);
    else next.add(selectedTrack.id);
    setFavorites(next);
    localStorage.setItem("miusix:favorites", JSON.stringify([...next]));
  }

  function seek(value: number) {
    setElapsed(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  }

  if (viewMode === "ios") {
    return (
      <IosPreview
        activeTrack={activeTrack}
        tracks={tracks}
        playing={playing}
        favorite={favorites.has(activeTrack.id)}
        query={query}
        searchResults={searchResults}
        localSearchResults={localSearchResults}
        searchStatus={searchStatus}
        searchMessage={searchMessage}
        onPlayPause={() => setPlaying(!playing)}
        onFavorite={toggleFavorite}
        onQueryChange={setQuery}
        onSearch={search}
        onSearchResult={importSearchResult}
        onLocalSearchResult={(track) => {
          setLocalSearchResults([]);
          setSearchMessage("");
          selectTrack(track);
        }}
        onSelectTrack={selectTrack}
        onViewChange={setViewMode}
      />
    );
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
          <button aria-label="Profile options (coming soon)" disabled>•••</button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="history-buttons">
            <button aria-label="Go back" onClick={() => window.history.back()}>←</button>
            <button aria-label="Go forward" onClick={() => window.history.forward()}>→</button>
          </div>
          <form className="search" onSubmit={search}>
            <span>⌕</span>
            <input
              aria-label="Search music"
              placeholder="Search YouTube Music…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>⌘ K</kbd>
          </form>
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <button className="ghost-button" onClick={checkServer}>Connect a server</button>
        </header>

        <div className="page-content">
          <SearchResults
            results={searchResults}
            localResults={localSearchResults}
            status={searchStatus}
            message={searchMessage}
            onSelect={importSearchResult}
            onLocalSelect={(track) => {
              setLocalSearchResults([]);
              setSearchMessage("");
              selectTrack(track);
            }}
          />
          <section className="hero-card" id="mix">
            <div className="hero-copy">
              <span className="eyebrow">Miusix original mix · 04</span>
              <h1>Night drive,<br />no destination.</h1>
              <p>Soft edges, warm synths, and just enough static for the road home.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => setPlaying(true)}>
                  <span>▶</span> Play mix
                </button>
                <button className="circle-button" aria-label="More options (coming soon)" disabled>•••</button>
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
              <button onClick={() => document.querySelector(".album-grid")?.scrollIntoView({ behavior: "smooth" })}>
                See all <span>→</span>
              </button>
            </div>
            <div className="album-grid">
              {tracks.map((track, index) => (
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
              {tracks.map((track, index) => (
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
          <button
            className={favorites.has(activeTrack.id) ? "favorite-button--active" : ""}
            aria-label={favorites.has(activeTrack.id) ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorites.has(activeTrack.id)}
            onClick={toggleFavorite}
          >
            {favorites.has(activeTrack.id) ? "♥" : "♡"}
          </button>
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
              onChange={(event) => seek(Number(event.target.value))}
            />
            <span>{formatTime(activeTrack.durationSeconds)}</span>
          </div>
        </div>
        <div className="player-tools">
          <button aria-label="Queue (coming soon)" disabled>▤</button>
          <button aria-label="Devices (coming soon)" disabled>◫</button>
          <span>◖</span>
          <input aria-label="Volume" type="range" defaultValue="68" />
        </div>
      </section>
    </main>
  );
}
