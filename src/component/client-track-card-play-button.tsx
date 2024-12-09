"use client";

import Miusix from "@/infra/howler-instance";
import {TrackMetaData} from "@/types/types";

const miusix = Miusix.getInstance();

const ClientTrackCardPlayButton = ({ data} : {data: TrackMetaData}) => {
  return (
    <>
      {/*Play music*/}
      <button onClick={() => {
        miusix.load(data);
        miusix.sound()
      }} className="swap swap-flip text-3xl">
        <input type="checkbox"/>
        <div className="swap-on align-middle font-mono">{'>'}</div>
        <div className="swap-off align-middle font-mono">{'>'}</div>
      </button>
      {/*Add music to track list*/}
      <button onClick={() => {
        miusix.add(data)
      }} className="swap swap-rotate text-3xl">
        <input type="checkbox"/>
        <div className="swap-on align-middle font-mono">+</div>
        <div className="swap-off align-middle font-mono">+</div>
      </button>
    </>
  )
}

export default ClientTrackCardPlayButton