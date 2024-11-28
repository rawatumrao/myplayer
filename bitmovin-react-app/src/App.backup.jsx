
import Logger from '../lib/Logger';
import VideoPlayer from '../lib/VideoPlayer/VideoPlayer';
import { BitmovinPlayerPage } from './bitmovin/pages/BitmovinPlayerPage';
import { getCustomUiElements } from './bitmovin/utils/getCustomUiByClass';
import { testTagger } from './bitmovin/utils/testTagger';

//getCustomUiElements();


export const App = () => {
  const log = new Logger();

  log.debug(`g_sVideoId: ${window.g_sVideoId}`);
  /*This is for testing purposes*/ 
  const configs = {
    key: 'fee7301a-eb5a-4e9b-979f-147fdc1ba59f',
    title: `${window.g_sEventTitle}`,
    hls: `${window.g_sPath}`,
    //hls: 'https://streams.bitmovin.com/cnj1rst6ei2j6okoaud0/manifest.m3u8',
    //progressive: 'https://live-par-2-abr.livepush.io/vod/bigbuckbunnyclip.mp4',
    //poster: 'https://www.globalmeet.com/wp-content/uploads/2023/12/GlobalMeet-Sustainable-Office.jpg'
  }
  log.info('Starting Player')

  //var player = new BitmovinPlayer(window.g_sPlayerDiv, window.g_sVideoId);
  //player.load(window.g_sEventTitle, window.g_sPath);
  //window.g_player = player;
  window.VideoPlayer = VideoPlayer;
  
  return (
    <>
        <BitmovinPlayerPage configs={configs} />
    </>
  );
}

export default App;
