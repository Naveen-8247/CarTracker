export function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateSpeedKmH(pointA, pointB) {
  if (!pointA || !pointB) return 0;
  const distanceKm = haversineDistanceKm(pointA.lat, pointA.lng, pointB.lat, pointB.lng);
  const tA = new Date(pointA.timestamp).getTime();
  const tB = new Date(pointB.timestamp).getTime();
  const deltaHours = (tB - tA) / (1000 * 60 * 60);
  if (deltaHours <= 0) return 0;
  return distanceKm / deltaHours;
}

export function cumulativeDistanceKm(route) {
  if (!route || route.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistanceKm(route[i - 1].lat, route[i - 1].lng, route[i].lat, route[i].lng);
  }
  return total;
}
