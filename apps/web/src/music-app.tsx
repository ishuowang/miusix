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
  favoriteCount: number;
  elapsed: number;
  query: string;
  searchResults: MediaSearchResult[];
  localSearchResults: Track[];
  searchStatus: SearchStatus;
  searchMessage: string;
  onPlayPause: () => void;
  onFavorite: () => void;
  onMove: (direction: number) => void;
  onSeek: (seconds: number) => void;
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
  favoriteCount,
  elapsed,
  query,
  searchResults,
  localSearchResults,
  searchStatus,
  searchMessage,
  onPlayPause,
  onFavorite,
  onMove,
  onSeek,
  onQueryChange,
  onSearch,
  onSearchResult,
  onLocalSearchResult,
  onSelectTrack,
  onViewChange
}: IosPreviewProps) {
  const [page, setPage] = useState<"play" | "search" | "me">("play");
  const remaining = Math.max(0, activeTrack.durationSeconds - elapsed);
  const visibleResults = searchResults.length
    ? searchResults
    : localSearchResults.length
      ? localSearchResults
      : tracks;

  return (
    <main className="ios-stage ios-stage--skeuo">
      <header className="ios-preview-header">
        <a className="ios-preview-brand" href="#" aria-label="Miusix home">
          <span className="brand-mark">M</span>
          <span>MIUSIX</span>
        </a>
        <span className="ios-preview-label">Interface preview</span>
        <ViewToggle value="ios" onChange={onViewChange} inverse />
      </header>

      <section className="iphone skeuo-phone" aria-label="Miusix iOS turntable interface">
        <div className="iphone__screen skeuo-screen">
          <div className="skeuo-leather">
            <div className="skeuo-stitch" aria-hidden="true" />
            <div className="skeuo-statusbar" aria-hidden="true">
              <span>9:41</span>
              <span>▮▮▮ ᯤ ▱</span>
            </div>

            <div className="skeuo-page">
              {page === "play" && (
                <>
                  <span className="skeuo-plaque">{playing ? "正 在 播 放" : "已 暂 停"}</span>
                  <section className="skeuo-turntable" aria-label="Turntable">
                    <button
                      type="button"
                      className={`skeuo-vinyl ${playing ? "skeuo-vinyl--playing" : ""}`}
                      aria-label={playing ? "Pause record" : "Play record"}
                      onClick={onPlayPause}
                    >
                      <span className="skeuo-vinyl__shine" />
                      <span
                        className="skeuo-vinyl__label"
                        style={{ "--label-color": activeTrack.artwork.background } as React.CSSProperties}
                      >
                        <strong>{activeTrack.title}</strong>
                        <small>{activeTrack.artist}</small>
                      </span>
                    </button>
                    <div className={`skeuo-tonearm ${playing ? "skeuo-tonearm--down" : ""}`} aria-hidden="true">
                      <i className="skeuo-tonearm__pivot" />
                      <i className="skeuo-tonearm__tube" />
                      <i className="skeuo-tonearm__head" />
                    </div>
                  </section>

                  <section className="skeuo-console">
                    <div className="skeuo-lcd">
                      <div className="skeuo-lcd__meta">
                        <strong>{formatTime(elapsed)}</strong>
                        <span>{tracks.findIndex((track) => track.id === activeTrack.id) + 1 || 1} / {tracks.length}</span>
                        <strong>-{formatTime(remaining)}</strong>
                      </div>
                      <input
                        aria-label="iOS playback position"
                        type="range"
                        min="0"
                        max={activeTrack.durationSeconds}
                        value={Math.min(elapsed, activeTrack.durationSeconds)}
                        onChange={(event) => onSeek(Number(event.target.value))}
                      />
                      <div className="skeuo-lcd__track">
                        <strong>{activeTrack.title}</strong>
                        <small>{activeTrack.artist}</small>
                      </div>
                    </div>
                    <button
                      className={`skeuo-heart ${favorite ? "skeuo-heart--active" : ""}`}
                      type="button"
                      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                      aria-pressed={favorite}
                      onClick={onFavorite}
                    >
                      {favorite ? "♥" : "♡"}
                    </button>
                    <div className="skeuo-transport">
                      <button type="button" aria-label="Previous track" onClick={() => onMove(-1)}>◀</button>
                      <button className="skeuo-play" type="button" aria-label={playing ? "Pause" : "Play"} onClick={onPlayPause}>
                        {playing ? "Ⅱ" : "▶"}
                      </button>
                      <button type="button" aria-label="Next track" onClick={() => onMove(1)}>▶</button>
                    </div>
                  </section>

                  <section className="skeuo-up-next">
                    <span>接下来</span>
                    {tracks.filter((track) => track.id !== activeTrack.id).slice(0, 2).map((track) => (
                      <button type="button" key={track.id} onClick={() => onSelectTrack(track)}>
                        <i style={{ "--disc-label": track.artwork.background } as React.CSSProperties} />
                        <span><strong>{track.title}</strong><small>{track.artist}</small></span>
                        <time>{formatTime(track.durationSeconds)}</time>
                      </button>
                    ))}
                  </section>
                </>
              )}

              {page === "search" && (
                <section className="skeuo-search-page">
                  <span className="skeuo-plaque">搜 索</span>
                  <form className="skeuo-search" onSubmit={onSearch}>
                    <span>⌕</span>
                    <input
                      aria-label="Search music"
                      placeholder="搜索歌曲、歌手…"
                      value={query}
                      onChange={(event) => onQueryChange(event.target.value)}
                    />
                    <button type="submit" aria-label="Submit search">↵</button>
                  </form>
                  <div className="skeuo-chips" aria-label="Search suggestions">
                    {["白鹭", "陈屿", "南方", "雾"].map((chip) => (
                      <button type="button" key={chip} onClick={() => onQueryChange(chip)}>{chip}</button>
                    ))}
                  </div>
                  <div className="skeuo-results-heading">
                    <strong>{query.trim() ? "搜索结果" : "热门歌曲"}</strong>
                    <span>{searchStatus === "searching" ? "搜索中…" : searchStatus === "importing" ? "缓存中…" : searchMessage}</span>
                  </div>
                  {searchStatus === "error" && <p className="skeuo-error">{searchMessage}</p>}
                  <div className="skeuo-results">
                    {visibleResults.map((item) => {
                      const isRemote = "sourceId" in item;
                      return (
                        <button
                          type="button"
                          key={isRemote ? item.sourceId : item.id}
                          disabled={searchStatus === "importing"}
                          onClick={() => {
                            if (isRemote) onSearchResult(item);
                            else onLocalSearchResult(item);
                            setPage("play");
                          }}
                        >
                          <i style={{ "--disc-label": isRemote ? "#e8933c" : item.artwork.background } as React.CSSProperties} />
                          <span><strong>{item.title}</strong><small>{item.artist}</small></span>
                          <time>{formatTime(isRemote ? item.durationSeconds : item.durationSeconds)}</time>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {page === "me" && (
                <section className="skeuo-profile-page">
                  <span className="skeuo-plaque">个 人 主 页</span>
                  <div className="skeuo-profile-card">
                    <span className="skeuo-profile-avatar">岚</span>
                    <span><strong>阿岚</strong><small>黑胶会员</small></span>
                    <b>›</b>
                  </div>
                  <div className="skeuo-stats">
                    <span><strong>{favoriteCount}</strong><small>收藏</small></span>
                    <span><strong>{tracks.length}</strong><small>歌曲</small></span>
                    <span><strong>0</strong><small>关注</small></span>
                  </div>
                  <strong className="skeuo-section-label">我的歌单</strong>
                  <button className="skeuo-playlist-card" type="button" onClick={() => setPage("play")}>
                    <i>♫</i>
                    <span><strong>我的最爱</strong><small>{favoriteCount ? `${favoriteCount} 首` : "尚未收藏"}</small></span>
                    <b>›</b>
                  </button>
                  <strong className="skeuo-section-label">设置</strong>
                  <div className="skeuo-settings">
                    <button type="button"><span>唱机定制</span><small>皮革 · 拉丝铝</small></button>
                    <button type="button"><span>音质设置</span><small>无损</small></button>
                    <button type="button"><span>设备连接</span><small>本机扬声器</small></button>
                  </div>
                </section>
              )}
            </div>

            <nav className="skeuo-tabs" aria-label="iOS navigation">
              {([
                ["play", "◉", "播放"],
                ["search", "⌕", "搜索"],
                ["me", "♙", "我的"],
              ] as const).map(([tab, icon, label]) => (
                <button
                  className={page === tab ? "skeuo-tab--active" : ""}
                  type="button"
                  key={tab}
                  onClick={() => setPage(tab)}
                >
                  <span>{icon}</span>
                  <strong>{label}</strong>
                  <i />
                </button>
              ))}
            </nav>
            <span className="skeuo-home-indicator" aria-hidden="true" />
          </div>
        </div>
      </section>
      <p className="ios-preview-note">A tactile turntable interface for the shared iOS player.</p>
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
  const favoriteTracks = useMemo(
    () => tracks.filter((track) => favorites.has(track.id)),
    [favorites, tracks]
  );

  useEffect(() => {
    let cancelled = false;
    void api.tracks()
      .then((remoteTracks) => {
        if (cancelled) return;
        setTracks((current) => {
          const remoteIds = new Set(remoteTracks.map((track) => track.id));
          return [...remoteTracks, ...current.filter((track) => !remoteIds.has(track.id))];
        });
      })
      .catch(() => {
        // Keep the built-in demo usable while a self-hosted API is offline.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (audioRef.current && activeTrack && !activeTrack.streamUrl.startsWith("/audio/")) {
      audioRef.current.currentTime = value;
    }
  }

  if (viewMode === "ios") {
    return (
      <IosPreview
        activeTrack={activeTrack}
        tracks={tracks}
        playing={playing}
        favorite={favorites.has(activeTrack.id)}
        favoriteCount={favorites.size}
        elapsed={elapsed}
        query={query}
        searchResults={searchResults}
        localSearchResults={localSearchResults}
        searchStatus={searchStatus}
        searchMessage={searchMessage}
        onPlayPause={() => setPlaying(!playing)}
        onFavorite={toggleFavorite}
        onMove={move}
        onSeek={seek}
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
            <button type="submit" aria-label="Submit search">Search</button>
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

          <section className="section track-section" id="liked">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Saved in this browser</span>
                <h2>Liked songs</h2>
              </div>
              <span className="section-count">{favoriteTracks.length}</span>
            </div>
            {favoriteTracks.length > 0 ? (
              <div className="track-list">
                {favoriteTracks.map((track, index) => (
                  <button className="track-row" key={track.id} onClick={() => selectTrack(track)}>
                    <span className="row-number">{(index + 1).toString().padStart(2, "0")}</span>
                    <Artwork track={track} compact />
                    <span className="track-title"><strong>{track.title}</strong><small>{track.artist}</small></span>
                    <span className="track-album">{track.album}</span>
                    <span className="track-time">{formatTime(track.durationSeconds)}</span>
                    <span className="row-more">▶</span>
                  </button>
                ))}
              </div>
            ) : (
              <button className="empty-library" type="button" onClick={toggleFavorite}>
                <span>♡</span>
                Save the current track to start your collection.
              </button>
            )}
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
