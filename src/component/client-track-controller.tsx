"use client"

import Miusix from "@/infra/howler-instance";
import {TrackMetaData} from "@/types/types";
import {useState} from "react";

const miusix = Miusix.getInstance();

const ClientTrackController = () => {

  const [track, setTrack] = useState<TrackMetaData>({} as TrackMetaData);
  const [playlist, setPlaylist] = useState<TrackMetaData[]>([] as TrackMetaData[]);
  miusix.addHook({
    setTrack:(_track)=>{setTrack(_track)},
    setPlaylist:(_playlist)=>{setPlaylist(_playlist)},
    setLoop: (_loop)=>{console.log(_loop)},
  })
  return(
    <>
      <div className="hero  ">
        <div className="hero-content flex flex-row">

          <ul className="menu bg-base-200 rounded-box w-56">
            <li className="menu-title text-secondary text-2xl font-mono">PLAYLIST</li>
            {playlist.map(e => {
              return (
                <li key={e.id}><a
                  className={track.id == e.id ? " text-primary font-serif before:content-['>']" : "text-base-content font-serif"}>{e.title}</a>
                </li>
              )
            })}
          </ul>

          <div className="stack">
            <div className="avatar">
              <div className="md:w-48 lg:w-96 w-24 rounded-xl outline-secondary outline-dashed outline-4 outline-offset-2">
                <img
                  src={track.thumbnail ? track.thumbnail : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  alt=""
                />
              </div>
            </div>
            <div className="avatar">
              <div className="md:w-48 lg:w-96 w-24 rounded-xl outline-secondary outline-dashed outline-4 outline-offset-1">
                <img
                  src={track.thumbnail ? track.thumbnail : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  alt=""
                />
              </div>
            </div>
            <div className="avatar">
              <div className="md:w-48 lg:w-96 w-24 rounded-xl outline-secondary outline-dashed outline-4 outline-offset-0">
                <img
                  src={track.thumbnail ? track.thumbnail : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  alt=""
                />
              </div>
            </div>
          </div>

          <div className="max-w grid grid-cols-1 gap-4">
            <button className="btn btn-primary" onClick={() => {
              miusix.pause()
            }}>暂停
            </button>

            <button className="btn btn-primary" onClick={() => {
              miusix.resume()
            }}>播放
            </button>

            <button className="btn btn-primary" onClick={() => {

            }}>上一首
            </button>

            <button className="btn btn-primary" onClick={() => {
              miusix.playNext()
            }}>下一首
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClientTrackController