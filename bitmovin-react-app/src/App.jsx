import React, { useEffect, useState } from 'react';
import Logger from '../lib/Logger';
import VideoPlayer from '../lib/VideoPlayer/VideoPlayer';
import BitmovinPlayer from '../lib/VideoPlayer/Bitmovin';

const log = new Logger();

function App() {
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);

  useEffect(() => {
    window.loadPlayer = () => {
      setIsPlayerLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (isPlayerLoaded) {
      if (typeof $ !== 'undefined') { // pages without jquery
        if (typeof $.viewerAction !== 'undefined') { // admin and OD studio
          if (typeof $.viewerAction.init !== 'undefined') { // pages where vieweraction init is overriden
            $.viewerAction.init();
          }
        }
        if (typeof $.viewerHTML5Player !== 'undefined') { // the hellish depths I go to to make the admin pages work.
          $.viewerHTML5Player.init();
        }
      }

      log.info('Entering VideoPlayer React App.jsx');
      var player = new BitmovinPlayer(window.g_sPlayerDiv, window.g_sVideoId);
      window.g_player = player;
      window.VideoPlayer = VideoPlayer;
      if (window.isHiveMulticast === true) {
        window.loadHiveJs();
      } else {
        player.load(window.g_sEventTitle, window.g_sPath);
      }
      log.info('VideoPlayer loaded');
    } 
  }, [isPlayerLoaded]);

  useEffect(() => {
    window.loadHiveJs = () => {
      if (window.isHiveMulticast === true) {
        log.info('Loading Hive JS');
        const hiveModule = document.createElement('script');
        hiveModule.src = '/include/hive/hive-module-bitmovin.js';
        hiveModule.async = true
        document.body.append(hiveModule);

        const cmcdIntegration = document.createElement('script');
        cmcdIntegration.src = '/include/hive/cmcd-integration.js';
        cmcdIntegration.async = true;
        document.body.append(cmcdIntegration);

        const hiveJS = document.createElement('script');
        hiveJS.src = '/include/hive/html5.java.hivejs.hive.min.js';
        hiveJS.async = true;
        document.body.appendChild(hiveJS);
        
        hiveJS.onload = () => {
          log.info('HiveJS loaded successfully');
          if (window.g_player) {
            window.g_player.createHive(window.g_sPlayerDiv);
          }
        }
        
        hiveJS.onerror = () => {
          log.error('Failed to load HiveJS');
        };
      }
    };
  }, []);

  return null;
}

export default App;
