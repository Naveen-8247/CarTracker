import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import L from "leaflet";
import AnimatedMarker from "./AnimatedMarker";
import { calculateSpeedKmH, cumulativeDistanceKm } from "./utils";
import { FaBatteryFull, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/styles.css";

export default function VehicleMap() {
  const [route, setRoute] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [traveled, setTraveled] = useState([]);
  const [selectedRange, setSelectedRange] = useState("Today");
  const [speed, setSpeed] = useState(0);
  const [battery] = useState(76);
  const intervalRef = useRef(null);

  const markerIcon = L.divIcon({
    className: "vehicle-icon",
    html: "🚗",
    iconSize: [30, 30],
  });

  // Load route data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/dummy-route.json");
        const data = await res.json();
        const points = data.route.map((p) => ({
          lat: p.lat,
          lng: p.lng,
          timestamp: p.timestamp,
        }));
        setRoute(points);
        if (points.length > 0) {
          setTraveled([points[0]]);
          setIndex(0);
        }
      } catch (err) {
        console.error("Error loading route data:", err);
      }
    }
    loadData();
  }, []);

  // Animate movement
  useEffect(() => {
    if (!isPlaying || route.length === 0 || index >= route.length - 1) return;
    const next = index + 1;
    intervalRef.current = setTimeout(() => {
      const currentPoint = route[index];
      const nextPoint = route[next];
      const spd = calculateSpeedKmH(currentPoint, nextPoint);
      setSpeed(spd);
      setTraveled((prev) => [...prev, nextPoint]);
      setIndex(next);
    }, 1800);
    return () => clearTimeout(intervalRef.current);
  }, [isPlaying, index, route]);

  // Controls
  function handlePlayPause() {
    if (route.length === 0) return;
    setIsPlaying((p) => !p);
  }

  function handleReset() {
    setIsPlaying(false);
    if (route.length > 0) {
      setIndex(0);
      setTraveled([route[0]]);
      setSpeed(0);
    }
  }

  function handleShow() {
    alert("Show clicked for range: " + selectedRange);
  }

  const currentPoint = route[index] || null;
  const nextPoint = route[index + 1] || null;
  const distanceFromStart = cumulativeDistanceKm(traveled);

  return (
    <div className="map-root">
      <MapContainer
        center={[17.385044, 78.486671]}
        zoom={15}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {route.length > 0 && (
          <Polyline
            positions={route.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "gray", weight: 3, opacity: 0.6 }}
          />
        )}

        {traveled.length > 0 && (
          <Polyline
            positions={traveled.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "red", weight: 5, opacity: 0.9 }}
          />
        )}

        {currentPoint && (
          <AnimatedMarker
            position={currentPoint}
            nextPosition={nextPoint}
            markerIcon={markerIcon}
            isPlaying={isPlaying}
            details={{
              speed: speed,
              battery: battery,
              distanceFromStart: distanceFromStart,
              timeString: currentPoint
                ? new Date(currentPoint.timestamp).toLocaleString()
                : "",
            }}
          />
        )}
      </MapContainer>

      {/* Status Panel */}
      <div className="top-right-panel">
        <div className="panel-title">
          <FaMapMarkerAlt /> Vehicle Status
        </div>
        <div className="panel-row">
          <div className="label">Coords</div>
          <div className="value">
            {currentPoint
              ? `${currentPoint.lat.toFixed(6)}, ${currentPoint.lng.toFixed(6)}`
              : "N/A"}
          </div>
        </div>
        <div className="panel-row">
          <div className="label">Time</div>
          <div className="value">
            {currentPoint
              ? new Date(currentPoint.timestamp).toLocaleTimeString()
              : "N/A"}
          </div>
        </div>
        <div className="panel-row">
          <div className="label">Speed</div>
          <div className="value">{speed.toFixed(2)} km/h</div>
        </div>
        <div className="panel-row battery-row">
          <FaBatteryFull />
          <div className="value battery-text">{battery}%</div>
        </div>
        <div className="panel-buttons">
          <button
            className={isPlaying ? "btn pause" : "btn play"}
            onClick={handlePlayPause}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button className="btn reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {/* Range Selector */}
      <div className="bottom-right-panel">
        <div className="config-row">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>Previous Week</option>
            <option>This Month</option>
            <option>Previous Month</option>
            <option>Custom</option>
          </select>
          <button className="btn show" onClick={handleShow}>
            SHOW
          </button>
        </div>
      </div>
    </div>
  );
}
