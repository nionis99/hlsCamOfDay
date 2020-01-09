// All the config related to HLS
var config = {
  debug: false,
  startPosition: 0,
  maxBufferLength: 3600,
  maxMaxBufferLength: 6000,
  startFragPrefetch: true,
  liveSyncDurationCount:3,
}
var hls = new Hls(config);
new MediaElementPlayer('video', {
    features: ['playpause','currtime','range','time','speed','pictureInPicture','playlist','fullscreen'],
    success: function(media, node, instance) {
        // Use the conditional to detect if you are using `native_hls` renderer for that given media;
        // otherwise, you don't need it
        if (Hls !== undefined) {
            hls.loadSource("http://e21.plius.tv:64144/p127/mono.m3u8");
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED,function() {
                video.play();
            });
        }
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = 'http://e21.plius.tv:64144/p127/mono.m3u8';
            video.addEventListener('loadedmetadata',function() {
                video.play();
            });
        }
    }
});