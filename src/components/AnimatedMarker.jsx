import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { FaBell, FaLock, FaCog } from "react-icons/fa"; 

export default function AnimatedMarker({
  position,
  nextPosition,
  markerIcon,
  isPlaying,
  onMarkerClick,
  details,
}) {
  const markerRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    let rafId = null;
    let startTime = null;
    const duration = 1200; 

    const startLatLng = marker.getLatLng();
    const endLatLng = nextPosition
      ? L.latLng(nextPosition.lat, nextPosition.lng)
      : L.latLng(position.lat, position.lng);

    // Animation step function
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * t;
      const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * t;

      marker.setLatLng([lat, lng]);

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        marker.setLatLng(endLatLng);
      }
    }

    if (isPlaying && nextPosition) {
      rafId = requestAnimationFrame(step);
    } else {
      marker.setLatLng([position.lat, position.lng]);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [position, nextPosition, isPlaying]);

  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={markerIcon}
      eventHandlers={{
        click: () => {
          if (onMarkerClick) onMarkerClick();
        },
      }}
    >
      <Popup className="custom-popup" closeButton={true}>
        <div className="popup-card">
          {/* Header */}
          <div className="popup-header">
            <div className="popup-title">WIRELESS</div>
            <div className="popup-time">
              {details && details.timeString ? details.timeString : ""}
            </div>
          </div>

          {/* Location */}
          <div className="popup-location">Vijay Nagar Road, Example City</div>

          {/* Stats */}
          <div className="popup-stats">
            <div className="stat">
              <div className="stat-value">
                {details ? details.speed.toFixed(2) : "0.00"} km/h
              </div>
              <div className="stat-label">Speed</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {details ? details.distanceFromStart.toFixed(2) : "0.00"} km
              </div>
              <div className="stat-label">Distance</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {details ? `${details.battery}%` : "N/A"}
              </div>
              <div className="stat-label">Battery</div>
            </div>
          </div>

          <div className="popup-grid">
            <div className="grid-item">
              <div className="grid-value">00h:00m</div>
              <div className="grid-label">Running</div>
            </div>
            <div className="grid-item">
              <div className="grid-value">07h:10m</div>
              <div className="grid-label">Stopped</div>
            </div>
            <div className="grid-item">
              <div className="grid-value">00h:00m</div>
              <div className="grid-label">Idle</div>
            </div>
          </div>

          
          <div className="popup-actions">
            <button className="icon-btn" title="Notification">
              <FaBell />
            </button>
            <button className="icon-btn" title="Lock Vehicle">
              <FaLock />
            </button>
            <button className="icon-btn" title="Settings">
              <FaCog />
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
