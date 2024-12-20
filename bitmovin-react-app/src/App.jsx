import React, { useEffect, useState } from 'react';
import Logger from '../lib/Logger';
import VideoPlayer from '../lib/VideoPlayer/VideoPlayer';
import BitmovinPlayer from '../lib/VideoPlayer/Bitmovin';
import VideoPlayerTheme from '../lib/VideoPlayer/VideoPlayerTheme';

const log = new Logger();

function App() {
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const [themeSettings, setThemeSettings] = useState({
    seekbarColor: '#ff0000',
    seekbarPlayedColor: '#00ff00',
    volumeBarColor: '#ff6600',
    fontSize: '16px',
    fontColor: '#ffffff',
  });

  useEffect(() => {
    window.loadPlayer = (playerDiv, videoId, eventTitle, streamPath, autoPlay) => {
      log.info('Entering VideoPlayer React App.jsx');
      var player = new BitmovinPlayer(playerDiv, videoId);
      window.VideoPlayer = VideoPlayer;
      if (window.isHiveMulticast === true) {
        window.loadHiveJs();
      } else {
        player.load(eventTitle, streamPath);
      }
      log.info('VideoPlayer loaded');

      if (typeof $ !== 'undefined') { // pages without jquery
        if (typeof $.viewerHTML5Player !== 'undefined') { // the hellish depths I go to to make the admin pages work.
          /*if (window.g_player) {
            console.log('window.g_player DEFINED');
            $.viewerHTML5Player.init();
          } else {
            console.log('window.g_player UNDEFINED -- ADDING EVENT LISTENER');
            document.addEventListener(VideoPlayer.STATUS_LOADED, () => {
              console.log('STATUS_LOADED EVENT FIRED');
              $.viewerHTML5Player.init();
            })
          }*/
        } else if (typeof $.viewerAction !== 'undefined') { // admin and OD studio
          if (typeof $.viewerAction.init !== 'undefined') { // pages where vieweraction init is overriden
            $.viewerAction.init();
          }
        }
      }

      return player;
    };
  }, []);

  useEffect(() => {
    if (isPlayerLoaded) {
      log.info('Entering VideoPlayer React App.jsx');
      var player = new BitmovinPlayer(window.g_sPlayerDiv, window.g_sVideoId);
      window.g_player = player;
      window.VideoPlayer = VideoPlayer;
      player.updateTheme(themeSettings); // Apply the theme settings to the player
      if (window.isHiveMulticast === true) {
        window.loadHiveJs();
      } else {
        player.load(window.g_sEventTitle, window.g_sPath);
      }
      log.info('VideoPlayer loaded');

      if (typeof $ !== 'undefined') { // pages without jquery
        if (typeof $.viewerAction !== 'undefined') { // admin and OD studio
          if (typeof $.viewerAction.init !== 'undefined') { // pages where vieweraction init is overriden
            $.viewerAction.init();
          }
        }
        if (typeof $.viewerHTML5Player !== 'undefined') { // the hellish depths I go to to make the admin pages work.
          if (window.g_player) {
            console.log('window.g_player DEFINED');
            $.viewerHTML5Player.init();
          } else {
            console.log('window.g_player UNDEFINED -- ADDING EVENT LISTENER');
            document.addEventListener(VideoPlayer.STATUS_LOADED, () => {
              console.log('STATUS_LOADED EVENT FIRED');
              $.viewerHTML5Player.init();
            })
          }
        }
      }
    } 
  }, [isPlayerLoaded, themeSettings]);

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

  const toggleSettingsVisibility = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  return (
    <div>
      {/* "Theme Controls" button */}
      <button onClick={toggleSettingsVisibility}>PlayerThemeControls</button>

      {/* Conditionally render the VideoPlayerTheme panel */}
      {isSettingsVisible && (
        <VideoPlayerTheme 
          themeSettings={themeSettings} 
          setThemeSettings={setThemeSettings} 
        />
      )}
    </div>
  );
}

export default App;
