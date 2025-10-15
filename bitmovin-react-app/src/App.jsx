import { useEffect } from 'react';
import Logger from '../lib/Logger';
import VideoPlayer from '../lib/VideoPlayer/VideoPlayer';

function App() {
  const LOGGER = new Logger();
  
  useEffect(() => {
    window.loadPlayer = (config) => {
      LOGGER.info('Entering VideoPlayer React App.jsx');
     
      let player = new VideoPlayer(config);

      LOGGER.info('VideoPlayer loaded');

      //Bitmovin autoplay config does not consistently work, so also try to play here
      if (config.autoplay == true) {
        player.play();
      }

      return player;
    };
  }, []);

  return null;
}

export default App;
