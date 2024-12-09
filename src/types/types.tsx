export type TrackMetaDataFormat = {
  format_id: string,

}
export type TrackMetaDataHeatMap = {
  start_time: number,
  end_time: number,
  value: number
}
export type TrackMetaDataThumbnail = {
  url: string,
  resolution?: string,
}

export type TrackMetaData = {
  id: string,
  title: string,
  album: string,
  artists: string[],
  description: string,
  audio: string,
  thumbnail: string,
  duration: number,
  formats: TrackMetaDataFormat[],
  heatmap: TrackMetaDataHeatMap[],
  thumbnails: TrackMetaDataThumbnail[],
  webpage_url: string,
}