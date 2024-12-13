import React, { useState } from 'react';

const VideoPlayerSettings = ({ playerInstance }) => {
    const [themeSettings, setThemeSettings] = useState({
        seekbarColor: '#ff0000',
        seekbarPlayedColor: '#00ff00',
        volumeBarColor: '#ff6600',
        fontSize: '16px',
        fontColor: '#ffffff',
    });

    const handleSeekbarColorChange = (e) => {
        setThemeSettings({ ...themeSettings, seekbarColor: e.target.value });
    };

    const handleSeekbarPlayedColorChange = (e) => {
        setThemeSettings({ ...themeSettings, seekbarPlayedColor: e.target.value });
    };

    const handleVolumeBarColorChange = (e) => {
        setThemeSettings({ ...themeSettings, volumeBarColor: e.target.value });
    };

    const handleFontSizeChange = (e) => {
        setThemeSettings({ ...themeSettings, fontSize: `${e.target.value}px` });
    };

    const handleFontColorChange = (e) => {
        setThemeSettings({ ...themeSettings, fontColor: e.target.value });
    };

    const applyTheme = () => {
        playerInstance.updateTheme(themeSettings); // Apply theme to player
    };

    return (
        <div>
            <h3>Customize Video Player Theme</h3>
            <div>
                <label>Seekbar Color:</label>
                <input
                    type="color"
                    value={themeSettings.seekbarColor}
                    onChange={handleSeekbarColorChange}
                />
            </div>
            <div>
                <label>Seekbar Played Color:</label>
                <input
                    type="color"
                    value={themeSettings.seekbarPlayedColor}
                    onChange={handleSeekbarPlayedColorChange}
                />
            </div>
            <div>
                <label>Volume Bar Color:</label>
                <input
                    type="color"
                    value={themeSettings.volumeBarColor}
                    onChange={handleVolumeBarColorChange}
                />
            </div>
            <div>
                <label>Font Size:</label>
                <input
                    type="range"
                    min="10"
                    max="30"
                    value={parseInt(themeSettings.fontSize)}
                    onChange={handleFontSizeChange}
                />
            </div>
            <div>
                <label>Font Color:</label>
                <input
                    type="color"
                    value={themeSettings.fontColor}
                    onChange={handleFontColorChange}
                />
            </div>
            <button onClick={applyTheme}>Apply Theme</button>
        </div>
    );
};

export default VideoPlayerSettings;
