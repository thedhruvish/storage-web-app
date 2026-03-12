import { createPlayer } from "@videojs/react";
import { VideoSkin, Video, videoFeatures } from "@videojs/react/video";
import "@videojs/react/video/skin.css";

const Player = createPlayer({ features: videoFeatures });

export function VideoPlayer() {
  return (
    <Player.Provider>
      <VideoSkin>
        <Video src='/videos/storeone-demo.webm' playsInline />
        {/* <Poster src='' /> */}
      </VideoSkin>
    </Player.Provider>
  );
}
