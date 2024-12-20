import React, { useState } from 'react';

const VideoPlayerTheme = ({ playerInstance }) => {

    const [themeSettings, setThemeSettings] = useState({
        bufferlevelColor: '#1fabe2',
        backdropColor: '#1fabe2',
        playbackpositionColor: '#1fabe2',
        playbackpositionmarkerColor:'#1fabe2',
        //playbacktimelabelSize:'10px',
        //seekbarMarkersSize:'.5625em',
    });

    // Temporarily store the new theme settings before applying them
    const [newThemeSettings, setNewThemeSettings] = useState({ ...themeSettings });

    const handleSeekbarBufferLevelColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, bufferlevelColor: e.target.value });
    };
    const handleSeekbarBackdropColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, backdropColor: e.target.value });
    };
    const handleSeekbarPlaybackPositionColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, playbackpositionColor: e.target.value });
    };
    const handlePlaybackpositionmarkerColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, playbackpositionmarkerColor: e.target.value });
    };

    // const handlePlaybacktimelabelSizeChange = (e) => {
    //     setNewThemeSettings({ ...newThemeSettings, playbacktimelabelSize: e.target.value });
    // };
    // const handleSeekbarMarkersSizeChange = (e) => {
    //     setNewThemeSettings({ ...newThemeSettings, seekbarMarkersSize: e.target.value });
    // };
    

    // Apply the new theme settings to the bitmovin player when the button is clicked
    const applyTheme = () => {
        console.log(" ...Apply theme...")
        
        setThemeSettings(newThemeSettings); // Persist the new theme settings in bitmovin player
        if (playerInstance) {
            console.log("Player Instance after Apply theme... to update theme ")
            playerInstance.updateTheme(newThemeSettings); // Apply the theme to the bitmovin player
        }
      
        const seekbarPlaybackposition = document.querySelectorAll('.bmpui-seekbar-playbackposition');
        seekbarPlaybackposition.forEach(playback => {
            playback.style.backgroundColor = newThemeSettings.playbackpositionColor;
        });
        const seekbarBackdrop = document.querySelectorAll('.bmpui-seekbar-backdrop');
        seekbarBackdrop.forEach(backdrop => {
            backdrop.style.backgroundColor = newThemeSettings.backdropColor;
        });
        const seekbarBufferlevel = document.querySelectorAll('.bmpui-seekbar-bufferlevel');
        seekbarBufferlevel.forEach(bufferlevel => {
            bufferlevel.style.backgroundColor = newThemeSettings.bufferlevelColor;
        });
        const seekbarMarker = document.querySelectorAll('.bmpui-seekbar-playbackposition-marker');
        seekbarMarker.forEach(marker => {
            marker.style.backgroundColor = newThemeSettings.playbackpositionmarkerColor;
        });

        // const seekbarplaybacktimelabelSize= document.querySelectorAll('.bmpui-ui-playbacktimelabel');
        // seekbarplaybacktimelabelSize.forEach(timelabelSize => {
        //     timelabelSize.style.size = newThemeSettings.playbacktimelabelSize;
        // });
        // const SeekbarMarkersSize= document.querySelectorAll('.bmpui-seekbar-markers');
        // SeekbarMarkersSize.forEach(markersSize => {
        //     markersSize.style.height = newThemeSettings.seekbarMarkersSize;
        // });

    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px', overflow: 'auto', display:'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 >Customize BitMovin Player Theme</h3>
            <h4>Seekbar</h4>
            <div style={{display:'flex', justifyContent: 'space-between'}}>
                <label>Bufferlevel:</label>
                <input
                    type="color"
                    value={newThemeSettings.bufferlevelColor}
                    onChange={handleSeekbarBufferLevelColorChange}
                />
            </div>
            <div style={{display:'flex', justifyContent: 'space-between'}}>
                <label>Backdrop:</label>
                <input
                    type="color"
                    value={newThemeSettings.seekbarPlabackdropColoryedColor}
                    onChange={handleSeekbarBackdropColorChange}
                />
            </div>
            <div style={{display:'flex', justifyContent: 'space-between'}}>
                <label>Playbckposition:</label>
                <input
                    type="color"
                    value={newThemeSettings.playbackpositionColor}
                    onChange={handleSeekbarPlaybackPositionColorChange}
                />
            </div>
            <div style={{display:'flex', justifyContent: 'space-between'}}>
                <label>Markerhead:</label>
                <input
                    type="color"
                    value={newThemeSettings.playbackpositionmarkerColor}
                    onChange={handlePlaybackpositionmarkerColorChange}
                />
            </div>
            <button onClick={applyTheme}>Apply Theme</button>
        </div>
    );
};

export default VideoPlayerTheme;
