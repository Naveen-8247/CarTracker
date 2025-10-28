import React from "react";

function Controls({ isPlaying, onPlayPause, onReset, currentPosition, speed }) {
  return (
    <div className="controls-panel">
      <h3>Vehicle Tracker</h3>
      {currentPosition && (
        <div className="details">
          <p><strong>Latitude:</strong> {currentPosition.lat.toFixed(5)}</p>
          <p><strong>Longitude:</strong> {currentPosition.lng.toFixed(5)}</p>
          <p><strong>Speed:</strong> {speed.toFixed(2)} km/h</p>
        </div>
      )}
      <div className="buttons">
        <button onClick={onPlayPause}>
          {isPlaying ? "Pause" : "Start"}
        </button>
        <button onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}

export default Controls;
