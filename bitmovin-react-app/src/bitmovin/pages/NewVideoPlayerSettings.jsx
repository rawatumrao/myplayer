import React, { useState } from 'react';

const VideoPlayerSettings = ({ playerInstance }) => {
    const [themeSettings, setThemeSettings] = useState({
        seekbarColor: '#ff0000',
        seekbarPlayedColor: '#00ff00',
        volumeBarColor: '#ff6600',
        fontSize: '16px',
        fontColor: '#ffffff',
    });

    // Temporarily store the new theme settings before applying them
    const [newThemeSettings, setNewThemeSettings] = useState({ ...themeSettings });

    const handleSeekbarColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, seekbarColor: e.target.value });
    };

    const handleSeekbarPlayedColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, seekbarPlayedColor: e.target.value });
    };

    const handleVolumeBarColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, volumeBarColor: e.target.value });
    };

    const handleFontSizeChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, fontSize: `${e.target.value}px` });
    };

    const handleFontColorChange = (e) => {
        setNewThemeSettings({ ...newThemeSettings, fontColor: e.target.value });
    };

    // Apply the new theme settings to the player when the button is clicked
    const applyTheme = () => {
        setThemeSettings(newThemeSettings); // Persist the new theme settings
        if (playerInstance) {
            playerInstance.updateTheme(newThemeSettings); // Apply the theme to the player
        }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
            <h3>Customize Video Player Theme</h3>
            <div>
                <label>Seekbar Color:</label>
                <input
                    type="color"
                    value={newThemeSettings.seekbarColor}
                    onChange={handleSeekbarColorChange}
                />
            </div>
            <div>
                <label>Seekbar Played Color:</label>
                <input
                    type="color"
                    value={newThemeSettings.seekbarPlayedColor}
                    onChange={handleSeekbarPlayedColorChange}
                />
            </div>
            <div>
                <label>Volume Bar Color:</label>
                <input
                    type="color"
                    value={newThemeSettings.volumeBarColor}
                    onChange={handleVolumeBarColorChange}
                />
            </div>
            <div>
                <label>Font Size:</label>
                <input
                    type="range"
                    min="10"
                    max="30"
                    value={parseInt(newThemeSettings.fontSize)}
                    onChange={handleFontSizeChange}
                />
                <span>{newThemeSettings.fontSize}</span> {/* Show the selected font size */}
            </div>
            <div>
                <label>Font Color:</label>
                <input
                    type="color"
                    value={newThemeSettings.fontColor}
                    onChange={handleFontColorChange}
                />
            </div>

            {/* Button to apply the changes */}
            <button onClick={applyTheme}>Apply Theme</button>
        </div>
    );
};

export default VideoPlayerSettings;
