class VideoPlayerEvents {
  static EVENT_ERROR = 'VideoPlayerEvent_Error';
  static EVENT_READY = 'VideoPlayerEvent_Ready';
  static EVENT_PLAY = 'VideoPlayerEvent_Play';
  static EVENT_PLAYING = 'VideoPlayerEvent_Playing';
  static EVENT_PAUSED = 'VideoPlayerEvent_Paused';
  static EVENT_FINISHED = 'VideoPlayerEvent_Finished';    // Finished playback
  static EVENT_TIMECHANGED = 'VideoPlayerEvent_TimeChanged';
  static EVENT_SOURCE_LOAD_ERROR = 'VideoPlayerEvent_SourceLoadError';
  static EVENT_AUDIOBACKUP_CLICKED = 'VideoPlayerEvent_AudioBackup_Clicked';
  static EVENT_MUTED = 'VideoPlayerEvent_Muted';
  static EVENT_UNMUTED = 'VideoPlayerEvent_Unmuted';
  static SOURCE_LOADED = "VideoPlayerEvent_SourceLoaded";
}

export default VideoPlayerEvents;