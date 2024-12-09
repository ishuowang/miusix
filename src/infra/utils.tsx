import {TrackMetaData} from "@/types/types";

const getAudioUrl = (formats: any[]): string => {
  const arr = formats.filter(e => {return e.vcodec === "none" && e.acodec && e.acodec.includes("mp4")}).sort((a, b)=>{return b.filesize - a.filesize});
  // let arr = formats.filter(e => {return e.ext && e.ext === "mp4" && e.protocol && e.protocol.includes("http")}).sort((a, b)=>{return a.filesize - b.filesize});
  return arr[0].url;
}

const parser = (data: any) :TrackMetaData => {
  if (!data){ return {} as TrackMetaData};
  const res = {} as TrackMetaData;
  res.id = data.id;
  res.title = data.title;
  res.thumbnail = data.thumbnail;
  res.description = data.description;
  res.album = data.album;
  res.artists = data.artists;
  res.audio = getAudioUrl(data.formats);
  res.heatmap = data.heatmap
  res.duration = data.duration
  res.formats = data.formats
  res.thumbnails = data.thumbnails;
  return res
}

export default parser