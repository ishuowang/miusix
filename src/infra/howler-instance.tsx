
import { Howl, Howler } from "howler";
import {TrackMetaData} from "@/types/types";

class Miusix {
  private static instance: Miusix;

  public howler: Howl;
  public tracks: Playlist;
  private loop: boolean;
  public hooks : MiusixHooks;

  private constructor() {
    Howler.usingWebAudio = true;
    this.howler = new Howl({
      src: [""],
      html5: true,
      onend: ()=>{
        this.playNext()
      },
      onplay: ()=>{
        navigator.mediaSession.playbackState = 'playing';
        this.setupMediaSession()
      },
      onpause: ()=>{
        navigator.mediaSession.playbackState = 'paused';
      }
    })
    this.tracks = new Playlist()
    this.loop = false

    this.hooks = {
      setTrack: ()=>{},
      setLoop:()=>{},
      setPlaylist:()=>{},
    };
  }

  public static getInstance(): Miusix {
    if (!Miusix.instance) {
      Miusix.instance = new Miusix();
    }
    return Miusix.instance;
  }

  public load(track: TrackMetaData) {
    this.howler.unload()
    this.howler._duration = 0; // init duration
    // this.howler._sprite = {};// init sprite
    this.howler._src = track.audio
    // AudioManager.howler._format = typeof o.format !== 'string' ? o.format : [o.format];
    this.howler.load(); // => update duration, sprite(var timeout)

    this.add(track);
  }

  public sound() {
    this.howler.play()
    this.setupMediaSession()
    this.hooks.setTrack(JSON.parse(JSON.stringify(this.tracks.getCurrentTrack())))
  }

  public resume() {
    this.howler.play()
  }

  public pause() {
    this.howler.pause();
  }

  public playNext() {
    const next = this.tracks.getNext()
    if (next == null) {
      return;
    }
    this.load(next)
    // this.hook(next)
    this.sound()
  }

  public add(track: TrackMetaData) {
    this.tracks.add(track)
    this.hooks.setPlaylist(Array.from(this.tracks.playlist))
  }

  public toggleLoop() {
    this.loop = !this.loop;
    this.hooks.setLoop(this.loop);
  }

  public addHook(hooks: MiusixHooks) {
    this.hooks = {...this.hooks, ...hooks};
  }

  private setupMediaSession() {
    const track = this.tracks.getCurrentTrack();
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artists?.join(","),
      album: track.album,
      artwork: track.thumbnail? [{src: track.thumbnail}] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("seekto", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("skipad", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("togglecamera", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("togglemicrophone", () => {
      /* Code excerpted. */
    });
    navigator.mediaSession.setActionHandler("hangup", () => {
      /* Code excerpted. */
    });
  
  }
}

class Playlist {
  public playlist: TrackMetaData[];
  public idx: number;

  constructor() {
    this.playlist = [];
    this.idx = 0;
  }

  public add(track: TrackMetaData): number {
    if (this.playlist.indexOf(track) >= 0) {
      this.idx = this.playlist.indexOf(track);
    } else {
      this.idx = this.playlist.push(track) - 1;
    }
    return this.idx;
  }

  public get(): TrackMetaData[] {
    return this.playlist;
  }

  public getCurrentTrack(): TrackMetaData {
    console.log('[getCurrentTrack]', this.playlist, this.idx);
    return this.playlist[this.idx]
  }

  public getNext(): TrackMetaData | null {
    if (this.playlist.length == 0) {
      return null;
    }
    this.idx = (this.idx + 1) % this.playlist.length;
    console.log('[getNext]', this.playlist[this.idx]);
    return this.playlist[this.idx];
  }

  public getPrevious(): TrackMetaData {
    this.idx = this.idx == 0 ? this.playlist.length - 1 : this.idx - 1;
    return this.playlist[this.idx];
  }

  public clear(): void {
    this.playlist = [];
  }

  public remove(): void {

  }
}

type MiusixHooks = {
  setTrack: (track: TrackMetaData) => void;
  setLoop: (loop: boolean) => void;
  setPlaylist: (playlist: TrackMetaData[]) => void;
}

export default Miusix;