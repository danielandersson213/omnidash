import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import * as sat from 'satellite.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ZenithApp.css';
import AppShell from '../../portal/AppShell';

// ── Constants ─────────────────────────────────────────────────────────────────

const CITIES = [
  // Americas
  { name: 'New York',     country: 'US',           timezone: 'America/New_York',                  lat: 40.71,  lon: -74.01,   coastal: false },
  { name: 'Los Angeles',  country: 'US',           timezone: 'America/Los_Angeles',               lat: 34.05,  lon: -118.24,  coastal: true  },
  { name: 'Chicago',      country: 'US',           timezone: 'America/Chicago',                   lat: 41.85,  lon: -87.65,   coastal: false },
  { name: 'Miami',        country: 'US',           timezone: 'America/New_York',                  lat: 25.77,  lon: -80.19,   coastal: true  },
  { name: 'Toronto',      country: 'Canada',       timezone: 'America/Toronto',                   lat: 43.65,  lon: -79.38,   coastal: false },
  { name: 'Vancouver',    country: 'Canada',       timezone: 'America/Vancouver',                 lat: 49.28,  lon: -123.12,  coastal: true  },
  { name: 'Denver',       country: 'US',           timezone: 'America/Denver',                    lat: 39.74,  lon: -104.99,  coastal: false },
  { name: 'Honolulu',     country: 'US',           timezone: 'Pacific/Honolulu',                  lat: 21.31,  lon: -157.86,  coastal: true  },
  { name: 'Mexico City',  country: 'Mexico',       timezone: 'America/Mexico_City',               lat: 19.43,  lon: -99.13,   coastal: false },
  { name: 'Bogotá',       country: 'Colombia',     timezone: 'America/Bogota',                    lat: 4.71,   lon: -74.07,   coastal: false },
  { name: 'Lima',         country: 'Peru',         timezone: 'America/Lima',                      lat: -12.05, lon: -77.04,   coastal: true  },
  { name: 'São Paulo',    country: 'Brazil',       timezone: 'America/Sao_Paulo',                 lat: -23.55, lon: -46.63,   coastal: false },
  { name: 'Buenos Aires', country: 'Argentina',    timezone: 'America/Argentina/Buenos_Aires',    lat: -34.60, lon: -58.38,   coastal: true  },
  { name: 'Santiago',     country: 'Chile',        timezone: 'America/Santiago',                  lat: -33.45, lon: -70.67,   coastal: false },
  // Europe
  { name: 'London',       country: 'UK',           timezone: 'Europe/London',                     lat: 51.51,  lon: -0.13,    coastal: true  },
  { name: 'Paris',        country: 'France',       timezone: 'Europe/Paris',                      lat: 48.85,  lon: 2.35,     coastal: false },
  { name: 'Berlin',       country: 'Germany',      timezone: 'Europe/Berlin',                     lat: 52.52,  lon: 13.40,    coastal: false },
  { name: 'Amsterdam',    country: 'Netherlands',  timezone: 'Europe/Amsterdam',                  lat: 52.37,  lon: 4.90,     coastal: true  },
  { name: 'Madrid',       country: 'Spain',        timezone: 'Europe/Madrid',                     lat: 40.42,  lon: -3.70,    coastal: false },
  { name: 'Rome',         country: 'Italy',        timezone: 'Europe/Rome',                       lat: 41.90,  lon: 12.50,    coastal: false },
  { name: 'Vienna',       country: 'Austria',      timezone: 'Europe/Vienna',                     lat: 48.21,  lon: 16.37,    coastal: false },
  { name: 'Warsaw',       country: 'Poland',       timezone: 'Europe/Warsaw',                     lat: 52.23,  lon: 21.01,    coastal: false },
  { name: 'Stockholm',    country: 'Sweden',       timezone: 'Europe/Stockholm',                  lat: 59.33,  lon: 18.07,    coastal: true  },
  { name: 'Oslo',         country: 'Norway',       timezone: 'Europe/Oslo',                       lat: 59.91,  lon: 10.75,    coastal: true  },
  { name: 'Athens',       country: 'Greece',       timezone: 'Europe/Athens',                     lat: 37.98,  lon: 23.73,    coastal: true  },
  { name: 'Lisbon',       country: 'Portugal',     timezone: 'Europe/Lisbon',                     lat: 38.72,  lon: -9.14,    coastal: true  },
  { name: 'Istanbul',     country: 'Türkiye',      timezone: 'Europe/Istanbul',                   lat: 41.01,  lon: 28.95,    coastal: true  },
  { name: 'Moscow',       country: 'Russia',       timezone: 'Europe/Moscow',                     lat: 55.75,  lon: 37.62,    coastal: false },
  // Africa
  { name: 'Cairo',        country: 'Egypt',        timezone: 'Africa/Cairo',                      lat: 30.04,  lon: 31.24,    coastal: false },
  { name: 'Casablanca',   country: 'Morocco',      timezone: 'Africa/Casablanca',                 lat: 33.59,  lon: -7.62,    coastal: true  },
  { name: 'Lagos',        country: 'Nigeria',      timezone: 'Africa/Lagos',                      lat: 6.52,   lon: 3.38,     coastal: true  },
  { name: 'Accra',        country: 'Ghana',        timezone: 'Africa/Accra',                      lat: 5.56,   lon: -0.20,    coastal: true  },
  { name: 'Nairobi',      country: 'Kenya',        timezone: 'Africa/Nairobi',                    lat: -1.29,  lon: 36.82,    coastal: false },
  { name: 'Addis Ababa',  country: 'Ethiopia',     timezone: 'Africa/Addis_Ababa',                lat: 9.03,   lon: 38.74,    coastal: false },
  { name: 'Johannesburg', country: 'S. Africa',    timezone: 'Africa/Johannesburg',               lat: -26.20, lon: 28.04,    coastal: false },
  // Asia
  { name: 'Tehran',       country: 'Iran',         timezone: 'Asia/Tehran',                       lat: 35.69,  lon: 51.39,    coastal: false },
  { name: 'Riyadh',       country: 'Saudi Arabia', timezone: 'Asia/Riyadh',                       lat: 24.69,  lon: 46.72,    coastal: false },
  { name: 'Dubai',        country: 'UAE',          timezone: 'Asia/Dubai',                        lat: 25.20,  lon: 55.27,    coastal: true  },
  { name: 'Karachi',      country: 'Pakistan',     timezone: 'Asia/Karachi',                      lat: 24.86,  lon: 67.01,    coastal: true  },
  { name: 'Mumbai',       country: 'India',        timezone: 'Asia/Kolkata',                      lat: 19.08,  lon: 72.88,    coastal: true  },
  { name: 'Dhaka',        country: 'Bangladesh',   timezone: 'Asia/Dhaka',                        lat: 23.72,  lon: 90.41,    coastal: false },
  { name: 'Bangkok',      country: 'Thailand',     timezone: 'Asia/Bangkok',                      lat: 13.75,  lon: 100.52,   coastal: false },
  { name: 'Kuala Lumpur', country: 'Malaysia',     timezone: 'Asia/Kuala_Lumpur',                 lat: 3.14,   lon: 101.69,   coastal: false },
  { name: 'Singapore',    country: 'Singapore',    timezone: 'Asia/Singapore',                    lat: 1.35,   lon: 103.82,   coastal: true  },
  { name: 'Jakarta',      country: 'Indonesia',    timezone: 'Asia/Jakarta',                      lat: -6.21,  lon: 106.85,   coastal: true  },
  { name: 'Manila',       country: 'Philippines',  timezone: 'Asia/Manila',                       lat: 14.60,  lon: 120.98,   coastal: true  },
  { name: 'Hong Kong',    country: 'China',        timezone: 'Asia/Hong_Kong',                    lat: 22.32,  lon: 114.17,   coastal: true  },
  { name: 'Taipei',       country: 'Taiwan',       timezone: 'Asia/Taipei',                       lat: 25.05,  lon: 121.56,   coastal: true  },
  { name: 'Beijing',      country: 'China',        timezone: 'Asia/Shanghai',                     lat: 39.91,  lon: 116.39,   coastal: false },
  { name: 'Seoul',        country: 'S. Korea',     timezone: 'Asia/Seoul',                        lat: 37.57,  lon: 126.98,   coastal: true  },
  { name: 'Tokyo',        country: 'Japan',        timezone: 'Asia/Tokyo',                        lat: 35.69,  lon: 139.69,   coastal: true  },
  // Oceania
  { name: 'Brisbane',     country: 'Australia',    timezone: 'Australia/Brisbane',                lat: -27.47, lon: 153.02,   coastal: true  },
  { name: 'Sydney',       country: 'Australia',    timezone: 'Australia/Sydney',                  lat: -33.87, lon: 151.21,   coastal: true  },
  { name: 'Melbourne',    country: 'Australia',    timezone: 'Australia/Melbourne',               lat: -37.81, lon: 144.96,   coastal: true  },
  { name: 'Perth',        country: 'Australia',    timezone: 'Australia/Perth',                   lat: -31.95, lon: 115.86,   coastal: true  },
  { name: 'Auckland',     country: 'New Zealand',  timezone: 'Pacific/Auckland',                  lat: -36.87, lon: 174.77,   coastal: true  },
];

const KNOWN_NEW_MOON  = new Date('2000-01-06T18:14:00Z');
const LUNAR_CYCLE_MS  = 29.530588853 * 86400000;

const TRACKED_SATS = [
  { id: 25544, name: 'ISS',         symbol: '🛸' },
  { id: 48274, name: 'Tiangong',    symbol: '🛸' },
  { id: 20580, name: 'Hubble',      symbol: '🔭' },
  { id: 41866, name: 'GOES-16',     symbol: '🌩️' },
  { id: 25994, name: 'Terra',       symbol: '🌍' },
  { id: 27424, name: 'Aqua',        symbol: '💧' },
  { id: 43013, name: 'NOAA-20',     symbol: '📡' },
  { id: 33591, name: 'NOAA-19',     symbol: '📡' },
  { id: 40697, name: 'Sentinel-2A', symbol: '🛰️' },
  { id: 49260, name: 'Landsat-9',   symbol: '🛰️' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function decodeWeather(code) {
  if (code === 0)                 return { label: 'Clear',         icon: '☀️'  };
  if (code === 1)                 return { label: 'Mainly clear',  icon: '🌤️'  };
  if (code === 2)                 return { label: 'Partly cloudy', icon: '⛅'   };
  if (code === 3)                 return { label: 'Overcast',      icon: '☁️'  };
  if (code === 45 || code === 48) return { label: 'Fog',           icon: '🌫️'  };
  if (code >= 51 && code <= 55)   return { label: 'Drizzle',       icon: '🌦️'  };
  if (code >= 61 && code <= 65)   return { label: 'Rain',          icon: '🌧️'  };
  if (code >= 71 && code <= 77)   return { label: 'Snow',          icon: '🌨️'  };
  if (code >= 80 && code <= 82)   return { label: 'Showers',       icon: '🌧️'  };
  if (code >= 85 && code <= 86)   return { label: 'Snow showers',  icon: '🌨️'  };
  if (code === 95)                return { label: 'Thunderstorm',  icon: '⛈️'  };
  if (code >= 96)                 return { label: 'Thunderstorm',  icon: '⛈️'  };
  return { label: 'Unknown', icon: '—' };
}

function decodeUV(uv) {
  if (uv == null) return null;
  if (uv <= 2)  return { label: 'Low',     color: '#4a9e5c', bg: 'rgba(74,158,92,0.14)'   };
  if (uv <= 5)  return { label: 'Mod',     color: '#c8a020', bg: 'rgba(200,160,32,0.14)'  };
  if (uv <= 7)  return { label: 'High',    color: '#c87020', bg: 'rgba(200,112,32,0.14)'  };
  if (uv <= 10) return { label: 'V.High',  color: '#b83030', bg: 'rgba(184,48,48,0.14)'   };
  return               { label: 'Extreme', color: '#8040a0', bg: 'rgba(128,64,160,0.14)'  };
}

function decodeAQI(aqi) {
  if (aqi == null) return null;
  if (aqi <= 20)  return { label: 'Good',    color: '#4a9e5c', bg: 'rgba(74,158,92,0.14)'   };
  if (aqi <= 40)  return { label: 'Fair',    color: '#7a9e30', bg: 'rgba(122,158,48,0.14)'  };
  if (aqi <= 60)  return { label: 'Mod',     color: '#c8a020', bg: 'rgba(200,160,32,0.14)'  };
  if (aqi <= 80)  return { label: 'Poor',    color: '#c87020', bg: 'rgba(200,112,32,0.14)'  };
  if (aqi <= 100) return { label: 'V.Poor',  color: '#b83030', bg: 'rgba(184,48,48,0.14)'   };
  return                 { label: 'Extreme', color: '#8040a0', bg: 'rgba(128,64,160,0.14)'  };
}

function decodePollen(v) {
  if (v == null || v < 0) return null;
  if (v < 10)  return { label: 'Low',    color: '#4a9e5c' };
  if (v < 30)  return { label: 'Mod',    color: '#c8a020' };
  if (v < 100) return { label: 'High',   color: '#c87020' };
  return              { label: 'V.High', color: '#b83030' };
}

function getMoonPhase() {
  const elapsed = Date.now() - KNOWN_NEW_MOON.getTime();
  const phase   = ((elapsed % LUNAR_CYCLE_MS) + LUNAR_CYCLE_MS) % LUNAR_CYCLE_MS / LUNAR_CYCLE_MS;
  const illumination = Math.round(phase <= 0.5 ? phase * 2 * 100 : (1 - phase) * 2 * 100);
  let emoji, label;
  if (phase < 0.033 || phase > 0.967) { emoji = '🌑'; label = 'New Moon';       }
  else if (phase < 0.25)              { emoji = '🌒'; label = 'Wax. Crescent';   }
  else if (phase < 0.283)             { emoji = '🌓'; label = 'First Quarter';   }
  else if (phase < 0.467)             { emoji = '🌔'; label = 'Wax. Gibbous';    }
  else if (phase < 0.533)             { emoji = '🌕'; label = 'Full Moon';       }
  else if (phase < 0.717)             { emoji = '🌖'; label = 'Wan. Gibbous';    }
  else if (phase < 0.783)             { emoji = '🌗'; label = 'Last Quarter';    }
  else                                { emoji = '🌘'; label = 'Wan. Crescent';   }
  return { emoji, label, illumination };
}

function tempToColor(temp) {
  if (temp <= 0)  return '#5a8ab0';
  if (temp <= 15) return '#6aaa88';
  if (temp <= 25) return '#c4943a';
  if (temp <= 35) return '#c87020';
  return '#b83030';
}

function isDaytime(city, sunrise, sunset) {
  if (!sunrise || !sunset) return true;
  try {
    const t = new Intl.DateTimeFormat('en-GB', {
      timeZone: city.timezone, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date());
    return t >= sunrise && t < sunset;
  } catch { return true; }
}

function degreesToCardinal(deg) {
  if (deg == null) return '—';
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

function getTzAbbr(timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
      .formatToParts(new Date())
      .find(p => p.type === 'timeZoneName')?.value ?? '';
  } catch { return ''; }
}

function fmtTime(timezone) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date());
  } catch { return '--:--:--'; }
}

function fmtDate(timezone) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, weekday: 'long', month: 'short', day: 'numeric',
    }).format(new Date());
  } catch { return '---'; }
}

function fmtDay(isoDate, timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, weekday: 'short',
    }).format(new Date(isoDate + 'T12:00:00'));
  } catch { return '---'; }
}

const toHHMM = iso => iso?.slice(11, 16) ?? null;

// Sun position & terminator (no external API — pure math)
function getSunPosition() {
  const d  = Date.now() / 86400000 + 2440587.5 - 2451545.0; // days from J2000
  const L  = (280.46 + 0.9856474 * d) % 360;
  const g  = ((357.528 + 0.9856003 * d) % 360) * Math.PI / 180;
  const lm = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  const e  = (23.439 - 0.0000004 * d)  * Math.PI / 180;
  const decl = Math.asin(Math.sin(e) * Math.sin(lm)) * 180 / Math.PI;
  const RA   = Math.atan2(Math.cos(e) * Math.sin(lm), Math.cos(lm)) * 180 / Math.PI;
  const GMST = (18.697374558 + 24.06570982441908 * d) % 24;
  const lon  = ((RA - GMST * 15) % 360 + 540) % 360 - 180;
  return { lat: decl, lon };
}

function getNightPolygon() {
  const { lat: sunLat, lon: sunLon } = getSunPosition();
  const sunLatRad = Math.abs(sunLat) < 0.1 ? (sunLat >= 0 ? 0.1 : -0.1) : sunLat;
  const slr = sunLatRad * Math.PI / 180;
  const pts = [];
  for (let lon = -180; lon <= 180; lon += 2) {
    const h   = (lon - sunLon) * Math.PI / 180;
    const lat = Math.atan(-Math.cos(h) / Math.tan(slr)) * 180 / Math.PI;
    pts.push([lat, lon]);
  }
  const pole = sunLat > 0 ? -90 : 90;
  return [...pts, [pole, 180], [pole, -180]];
}

function decodeKp(kp) {
  if (kp == null) return null;
  if (kp <= 2) return { label: `Kp ${kp.toFixed(1)}`, color: '#4a9e5c', level: 'Quiet'           };
  if (kp <= 3) return { label: `Kp ${kp.toFixed(1)}`, color: '#7a9e30', level: 'Unsettled'       };
  if (kp <= 4) return { label: `Kp ${kp.toFixed(1)}`, color: '#c8a020', level: 'Active'          };
  if (kp <= 5) return { label: `Kp ${kp.toFixed(1)}`, color: '#c87020', level: 'Minor storm'     };
  if (kp <= 6) return { label: `Kp ${kp.toFixed(1)}`, color: '#b83030', level: 'Moderate storm'  };
  return             { label: `Kp ${kp.toFixed(1)}`, color: '#8040a0', level: 'Severe storm'    };
}

function eqStyle(mag) {
  const color = mag >= 6 ? '#d04040' : mag >= 5 ? '#c87020' : '#c8a020';
  return { color, fillColor: color, fillOpacity: 0.55, weight: 1 };
}

function eqRadius(mag) {
  if (mag >= 7) return 18;
  if (mag >= 6) return 13;
  if (mag >= 5) return 8;
  return 5;
}

// ── Marker icon factories ─────────────────────────────────────────────────────

function makeCityIcon(city, w, selected) {
  if (!w) {
    const sel  = selected ? ' sel' : '';
    const html = `<div class="cb${sel}"><div class="cb-dot"></div><span class="cb-n">${city.name}</span></div>`;
    return L.divIcon({ html, className: '', iconSize: [60, 24], iconAnchor: [30, 6] });
  }
  const color = tempToColor(w.temp);
  const sel   = selected ? ' sel' : '';
  const html  = `<div class="cb${sel}" style="--bc:${color}"><div class="cb-box"><span class="cb-i">${w.icon}</span><span class="cb-t">${Math.round(w.temp)}°</span></div><span class="cb-n">${city.name}</span></div>`;
  return L.divIcon({ html, className: '', iconSize: [72, 40], iconAnchor: [36, 14] });
}

function makeFlightIcon(headingBucket) {
  const html = `<div class="fm" style="transform:rotate(${headingBucket}deg)">✈</div>`;
  return L.divIcon({ html, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
}

function makeSatIcon(sat) {
  const html = `<div class="sat-marker"><span class="sat-sym">${sat.symbol}</span><span class="sat-name">${sat.name}</span></div>`;
  return L.divIcon({ html, className: '', iconSize: [64, 28], iconAnchor: [32, 14] });
}

// ── API ───────────────────────────────────────────────────────────────────────

async function fetchWeatherForCity(city) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    `&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,uv_index,wind_speed_10m,wind_direction_10m` +
    `&daily=sunrise,sunset,temperature_2m_mean,weather_code,temperature_2m_max,temperature_2m_min` +
    `&hourly=temperature_2m` +
    `&temperature_unit=celsius&timezone=auto&past_days=1&forecast_days=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const yMean  = data.daily.temperature_2m_mean?.[0];
  const tMean  = data.daily.temperature_2m_mean?.[1];
  const delta  = yMean != null && tMean != null
    ? Math.round((tMean - yMean) * 10) / 10
    : null;
  const forecast = [];
  for (let i = 2; i < Math.min(7, data.daily.time?.length ?? 0); i++) {
    const wc = decodeWeather(data.daily.weather_code?.[i]);
    forecast.push({
      date:  data.daily.time?.[i],
      icon:  wc.icon,
      label: wc.label,
      max:   Math.round(data.daily.temperature_2m_max?.[i] ?? 0),
      min:   Math.round(data.daily.temperature_2m_min?.[i] ?? 0),
    });
  }
  // past_days=1 → index 0 = yesterday 00:00; today starts at index 24
  const hourlyTemps = data.hourly?.temperature_2m?.slice(24, 48) ?? [];
  const wc = decodeWeather(data.current.weather_code);
  return {
    temp:       Math.round(data.current.temperature_2m),
    feelsLike:  Math.round(data.current.apparent_temperature),
    humidity:   Math.round(data.current.relative_humidity_2m),
    uv:         Math.round(data.current.uv_index),
    windSpeed:  Math.round(data.current.wind_speed_10m),
    windDir:    Math.round(data.current.wind_direction_10m),
    sunrise:    toHHMM(data.daily?.sunrise?.[1]),
    sunset:     toHHMM(data.daily?.sunset?.[1]),
    delta,
    forecast,
    hourlyTemps,
    label: wc.label,
    icon:  wc.icon,
  };
}

async function fetchAirQuality(city) {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    `&current=european_aqi,birch_pollen,grass_pollen`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    aqi:         data.current?.european_aqi   != null ? Math.round(data.current.european_aqi)  : null,
    birchPollen: data.current?.birch_pollen   != null ? Math.round(data.current.birch_pollen)  : null,
    grassPollen: data.current?.grass_pollen   != null ? Math.round(data.current.grass_pollen)  : null,
  };
}

async function fetchWave(city) {
  const url =
    `https://marine-api.open-meteo.com/v1/marine` +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    `&current=wave_height,wave_direction,wave_period`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.current?.wave_height == null) return null;
  return {
    height: Math.round(data.current.wave_height  * 10) / 10,
    dir:    Math.round(data.current.wave_direction ?? 0),
    period: Math.round(data.current.wave_period   ?? 0),
  };
}

async function fetchFlights() {
  const res = await fetch('https://opensky-network.org/api/states/all');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.states ?? [])
    .filter(s => s[8] === false && s[6] != null && s[5] != null)
    .slice(0, 2000)
    .map(s => ({ lat: s[6], lon: s[5], heading: s[10] ?? 0, callsign: (s[1] ?? '').trim() }));
}

// Fetch TLEs via tle.ivanstanojevic.me — CORS-friendly, one request per satellite
async function fetchTLEs() {
  const results = await Promise.allSettled(
    TRACKED_SATS.map(s =>
      fetch(`https://tle.ivanstanojevic.me/api/tle/${s.id}`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    )
  );
  const recs = {};
  results.forEach(r => {
    if (r.status !== 'fulfilled') return;
    const { line1, line2 } = r.value;
    if (!line1?.startsWith('1') || !line2?.startsWith('2')) return;
    const norad = parseInt(line2.slice(2, 7), 10);
    try { recs[norad] = sat.twoline2satrec(line1, line2); } catch { /* bad TLE */ }
  });
  if (Object.keys(recs).length === 0) throw new Error('No TLE data received');
  return recs;
}

function propagateSatellites(tleRecs) {
  const now  = new Date();
  const gmst = sat.gstime(now);
  return TRACKED_SATS.map(s => {
    const rec = tleRecs[s.id];
    if (!rec) return null;
    try {
      const pv = sat.propagate(rec, now);
      if (!pv.position) return null;
      const geo = sat.eciToGeodetic(pv.position, gmst);
      const vx  = pv.velocity.x, vy = pv.velocity.y, vz = pv.velocity.z;
      return {
        ...s,
        lat: sat.degreesLat(geo.latitude),
        lon: sat.degreesLong(geo.longitude),
        alt: Math.round(geo.height),
        vel: Math.round(Math.sqrt(vx*vx + vy*vy + vz*vz) * 3600),
      };
    } catch { return null; }
  }).filter(Boolean);
}

async function fetchEarthquakes() {
  const res = await fetch(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.features.map(f => ({
    type:  'quake',
    lat:   f.geometry.coordinates[1],
    lon:   f.geometry.coordinates[0],
    depth: Math.round(f.geometry.coordinates[2]),
    mag:   f.properties.mag,
    place: f.properties.place,
    time:  f.properties.time,
  }));
}

const EONET_CATEGORIES = {
  wildfires:      { label: 'Wildfire',     icon: '🔥', color: '#e85d04', fillColor: '#e85d04' },
  volcanoes:      { label: 'Volcano',      icon: '🌋', color: '#ff6b35', fillColor: '#ff6b35' },
  severeStorms:   { label: 'Severe Storm', icon: '🌀', color: '#4cc9f0', fillColor: '#4cc9f0' },
  floods:         { label: 'Flood',        icon: '🌊', color: '#4361ee', fillColor: '#4361ee' },
  seaLakeIce:     { label: 'Sea/Lake Ice', icon: '🧊', color: '#90e0ef', fillColor: '#90e0ef' },
};

async function fetchEonetEvents() {
  const res = await fetch(
    'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200'
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const events = [];
  for (const ev of data.events) {
    const catId = ev.categories[0]?.id;   // e.g. "wildfires"
    const meta  = EONET_CATEGORIES[catId];
    if (!meta) continue;
    // geometry is an array ordered newest-first; use the latest point
    const geo = ev.geometry?.find(g => g.type === 'Point');
    if (!geo) continue;
    events.push({
      type:  'eonet',
      catId,
      label: meta.label,
      icon:  meta.icon,
      title: ev.title,
      lat:   geo.coordinates[1],
      lon:   geo.coordinates[0],
      date:  geo.date,
    });
  }
  return events;
}

async function fetchAllEvents() {
  const [quakes, eonet] = await Promise.allSettled([
    fetchEarthquakes(),
    fetchEonetEvents(),
  ]);
  return [
    ...(quakes.status === 'fulfilled' ? quakes.value : []),
    ...(eonet.status  === 'fulfilled' ? eonet.value  : []),
  ];
}

async function fetchKpIndex() {
  const res  = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // data[0] is the header row; last entry is most recent 3-hour block
  const last = data[data.length - 1];
  return parseFloat(last[1]);
}

// ── Map utilities ─────────────────────────────────────────────────────────────

function MapController({ selectedCity }) {
  const map      = useMap();
  const prevName = useRef(null);
  useEffect(() => {
    if (selectedCity && selectedCity.name !== prevName.current) {
      prevName.current = selectedCity.name;
      map.flyTo([selectedCity.lat, selectedCity.lon], 7, { duration: 1.3, easeLinearity: 0.4 });
    }
  }, [selectedCity, map]);
  return null;
}

const CityLayer = memo(
  function CityLayer({ cities, weatherMap, selectedCityName, onCityClick }) {
    const iconCache = useRef(new Map());
    return cities.map(city => {
      const w   = weatherMap.get(city.name) ?? null;
      const sel = city.name === selectedCityName;
      const key = w
        ? `${city.name}-${Math.round(w.temp)}-${isDaytime(city, w.sunrise, w.sunset)}-${sel}`
        : `${city.name}-dot-${sel}`;
      if (!iconCache.current.has(key)) {
        iconCache.current.set(key, makeCityIcon(city, w, sel));
      }
      return (
        <Marker
          key={city.name}
          position={[city.lat, city.lon]}
          icon={iconCache.current.get(key)}
          eventHandlers={{ click: () => onCityClick(city) }}
        />
      );
    });
  },
  (prev, next) =>
    prev.weatherMap       === next.weatherMap      &&
    prev.selectedCityName === next.selectedCityName
);

const FlightLayer = memo(
  function FlightLayer({ flights }) {
    const iconCache = useRef(new Map());
    return flights.map((f, i) => {
      const bucket = Math.round((f.heading ?? 0) / 15) * 15;
      const key    = `h${bucket}`;
      if (!iconCache.current.has(key)) {
        iconCache.current.set(key, makeFlightIcon(bucket));
      }
      return (
        <Marker
          key={i}
          position={[f.lat, f.lon]}
          icon={iconCache.current.get(key)}
        />
      );
    });
  },
  (prev, next) => prev.flights === next.flights
);

function NightLayer() {
  const [poly, setPoly] = useState(() => getNightPolygon());
  useEffect(() => {
    const id = setInterval(() => setPoly(getNightPolygon()), 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <Polygon
      positions={poly}
      pathOptions={{ fillColor: '#000814', fillOpacity: 0.42, stroke: false }}
    />
  );
}

const SatelliteLayer = memo(
  function SatelliteLayer({ satellites }) {
    const iconCache = useRef(new Map());
    return satellites.map(sat => {
      if (!iconCache.current.has(sat.name)) {
        iconCache.current.set(sat.name, makeSatIcon(sat));
      }
      return (
        <Marker key={sat.id} position={[sat.lat, sat.lon]} icon={iconCache.current.get(sat.name)}>
          <Tooltip direction="top" offset={[0, -10]} opacity={0.92}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
              {sat.name} · {sat.alt} km · {sat.vel.toLocaleString()} km/h
            </span>
          </Tooltip>
        </Marker>
      );
    });
  },
  (prev, next) => prev.satellites === next.satellites
);

const EventsLayer = memo(
  function EventsLayer({ events }) {
    return events.map((ev, i) => {
      if (ev.type === 'quake') {
        return (
          <CircleMarker
            key={i}
            center={[ev.lat, ev.lon]}
            radius={eqRadius(ev.mag)}
            pathOptions={eqStyle(ev.mag)}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={0.93}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                🌍 M{ev.mag.toFixed(1)} · {ev.place}
                <br />Depth {ev.depth} km · {new Date(ev.time).toLocaleDateString()}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      }
      // EONET event
      const meta = EONET_CATEGORIES[ev.catId] ?? { color: '#aaa', fillColor: '#aaa' };
      return (
        <CircleMarker
          key={i}
          center={[ev.lat, ev.lon]}
          radius={7}
          pathOptions={{ color: meta.color, fillColor: meta.fillColor, fillOpacity: 0.7, weight: 1.5 }}
        >
          <Tooltip direction="top" offset={[0, -4]} opacity={0.93}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
              {ev.icon} {ev.label} · {ev.title}
              <br />{new Date(ev.date).toLocaleDateString()}
            </span>
          </Tooltip>
        </CircleMarker>
      );
    });
  },
  (prev, next) => prev.events === next.events
);

// ── UI Components ─────────────────────────────────────────────────────────────

function Sparkline({ data }) {
  if (!data || data.length < 2) return <div className="sparkline-empty">—</div>;
  const W = 340, H = 54, P = 6;
  const vals  = data.map(Number);
  const min   = Math.min(...vals);
  const max   = Math.max(...vals);
  const range = max - min || 1;
  const pts   = vals.map((v, i) => [
    P + (i / (vals.length - 1)) * (W - P * 2),
    H - P - ((v - min) / range) * (H - P * 2),
  ]);
  const path  = pts.map((p, i) => {
    if (i === 0) return `M ${p[0]},${p[1]}`;
    const cp = pts[i - 1];
    const mx = (cp[0] + p[0]) / 2;
    return `C ${mx},${cp[1]} ${mx},${p[1]} ${p[0]},${p[1]}`;
  }).join(' ');
  const area = `${path} L ${pts.at(-1)[0]},${H} L ${pts[0][0]},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c4943a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#c4943a" stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={path} fill="none" stroke="#c4943a" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <text x={pts[0][0]}     y={pts[0][1] - 5}     textAnchor="middle" fontSize="9" fill="#7a8a9a">{Math.round(vals[0])}°</text>
      <text x={pts.at(-1)[0]} y={pts.at(-1)[1] - 5} textAnchor="middle" fontSize="9" fill="#7a8a9a">{Math.round(vals.at(-1))}°</text>
    </svg>
  );
}

function WindCompass({ direction, speed }) {
  if (direction == null) return null;
  const rad = ((direction - 90) * Math.PI) / 180;
  const cx = 32, cy = 32, r = 21;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);
  return (
    <div className="wind-wrap">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        {['N','E','S','W'].map((d, i) => {
          const a  = (i * 90 - 90) * Math.PI / 180;
          const tx = cx + (r + 8) * Math.cos(a);
          const ty = cy + (r + 8) * Math.sin(a);
          return <text key={d} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="rgba(255,255,255,0.28)">{d}</text>;
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#c4943a" strokeWidth="2" strokeLinecap="round" />
        <circle cx={nx} cy={ny} r="3"   fill="#c4943a" />
        <circle cx={cx} cy={cy} r="2.5" fill="#0c1520" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      </svg>
      <div className="wind-info">
        <span className="wind-dir">{degreesToCardinal(direction)}</span>
        <span className="wind-speed">{speed} km/h</span>
      </div>
    </div>
  );
}

function SunBar({ sunrise, sunset, timezone }) {
  if (!sunrise || !sunset) return null;
  const toMin = t => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3, 5));
  let pct = 0;
  try {
    const now    = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date());
    const nowMin  = toMin(now);
    const riseMin = toMin(sunrise);
    const setMin  = toMin(sunset);
    const dayLen  = setMin - riseMin;
    pct = dayLen > 0 ? Math.min(100, Math.max(0, ((nowMin - riseMin) / dayLen) * 100)) : 0;
  } catch { /* */ }
  return (
    <div className="sun-bar">
      <span className="sun-label">🌅 {sunrise}</span>
      <div className="sun-track">
        <div className="sun-fill" style={{ width: `${pct}%` }} />
        <div className="sun-dot"  style={{ left:  `${pct}%` }} />
      </div>
      <span className="sun-label">🌇 {sunset}</span>
    </div>
  );
}

function ForecastStrip({ forecast, timezone }) {
  if (!forecast?.length) return null;
  return (
    <div className="forecast-strip">
      {forecast.map((d, i) => (
        <div key={i} className="forecast-day">
          <span className="fc-day">{fmtDay(d.date, timezone)}</span>
          <span className="fc-icon">{d.icon}</span>
          <span className="fc-label">{d.label}</span>
          <span className="fc-max">{d.max}°</span>
          <span className="fc-min">{d.min}°</span>
        </div>
      ))}
    </div>
  );
}

function LiveClock({ timezone }) {
  const [t, setT] = useState(() => fmtTime(timezone));
  useEffect(() => {
    setT(fmtTime(timezone));
    const id = setInterval(() => setT(fmtTime(timezone)), 1000);
    return () => clearInterval(id);
  }, [timezone]);
  return <span className="live-clock">{t}</span>;
}

function CityPanel({ city, w, aqi, wave, loading, onClose }) {
  if (!city) return null;
  const uvInfo    = decodeUV(w?.uv);
  const aqiInfo   = decodeAQI(aqi?.aqi);
  const birchInfo = decodePollen(aqi?.birchPollen);
  const grassInfo = decodePollen(aqi?.grassPollen);
  const hasPollen = aqi?.birchPollen != null || aqi?.grassPollen != null;
  return (
    <div className="city-panel">
      <button className="panel-close" onClick={onClose} aria-label="Close">✕</button>

      <div className="panel-header">
        <div className="panel-city-name">{city.name}</div>
        <div className="panel-city-sub">{city.country} · {getTzAbbr(city.timezone)}</div>
        <LiveClock timezone={city.timezone} />
        <div className="panel-date">{fmtDate(city.timezone)}</div>
      </div>

      {w ? (
        <>
          {/* Weather */}
          <div className="panel-section">
            <div className="weather-main">
              <span className="wm-icon">{w.icon}</span>
              <span className="wm-temp">{w.temp}°C</span>
              <span className="wm-label">{w.label}</span>
            </div>
            <div className="weather-meta">
              <span>Feels like {w.feelsLike}°</span>
              <span>Humidity {w.humidity}%</span>
              {w.delta != null && (
                <span style={{ color: w.delta > 0 ? '#c87020' : '#5a8ab0' }}>
                  {w.delta > 0 ? '▲' : '▼'} {Math.abs(w.delta)}° vs yesterday
                </span>
              )}
            </div>
            <div className="badge-row">
              {uvInfo && (
                <span className="badge" style={{ color: uvInfo.color, background: uvInfo.bg }}>
                  UV {w.uv} · {uvInfo.label}
                </span>
              )}
              {aqiInfo && (
                <span className="badge" style={{ color: aqiInfo.color, background: aqiInfo.bg }}>
                  AQI {aqi.aqi} · {aqiInfo.label}
                </span>
              )}
            </div>
          </div>

          {/* Wind + Wave */}
          <div className="panel-section panel-row">
            <WindCompass direction={w.windDir} speed={w.windSpeed} />
            {wave && (
              <div className="wave-block">
                <span className="wave-h">🌊 {wave.height}m</span>
                <span className="wave-d">{degreesToCardinal(wave.dir)} swell · {wave.period}s</span>
              </div>
            )}
          </div>

          {/* Pollen */}
          {hasPollen && (
            <div className="panel-section">
              <span className="section-label">Pollen</span>
              <div className="pollen-row">
                {aqi.birchPollen != null && birchInfo && (
                  <span className="badge" style={{ color: birchInfo.color, background: 'rgba(255,255,255,0.04)' }}>
                    Birch {aqi.birchPollen} µg/m³ · {birchInfo.label}
                  </span>
                )}
                {aqi.grassPollen != null && grassInfo && (
                  <span className="badge" style={{ color: grassInfo.color, background: 'rgba(255,255,255,0.04)' }}>
                    Grass {aqi.grassPollen} µg/m³ · {grassInfo.label}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sunrise/Sunset */}
          <div className="panel-section">
            <SunBar sunrise={w.sunrise} sunset={w.sunset} timezone={city.timezone} />
          </div>

          {/* Sparkline */}
          {w.hourlyTemps?.length > 0 && (
            <div className="panel-section">
              <span className="section-label">24h Temperature</span>
              <Sparkline data={w.hourlyTemps} />
            </div>
          )}

          {/* Forecast */}
          {w.forecast?.length > 0 && (
            <div className="panel-section">
              <span className="section-label">5-Day Forecast</span>
              <ForecastStrip forecast={w.forecast} timezone={city.timezone} />
            </div>
          )}
        </>
      ) : loading ? (
        <div className="panel-loading">Fetching weather data…</div>
      ) : (
        <div className="panel-loading">No data available.</div>
      )}
    </div>
  );
}

function SearchBox({ onSelect }) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const filtered = query.length > 0
    ? CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];
  return (
    <div className="search-wrap">
      <input
        className="search-input"
        placeholder="Search city…"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && filtered.length > 0 && (
        <div className="search-dropdown">
          {filtered.map(c => (
            <button
              key={c.name}
              className="search-item"
              onMouseDown={() => { onSelect(c); setQuery(''); setOpen(false); }}
            >
              {c.name} <span className="search-sub">{c.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Header({
  showCities, showFlights, flightsLoading, flightsError, flightCount,
  showNight, showSatellites, satellitesLoading, satellitesError, satelliteCount,
  showEvents, eventCount, kpIndex,
  onToggleCities, onToggleFlights, onToggleNight, onToggleSatellites, onToggleEvents,
  onSearch,
}) {
  const moon = getMoonPhase();
  const kp   = decodeKp(kpIndex);
  const [utc, setUtc] = useState('');
  useEffect(() => {
    const tick = () => setUtc(new Date().toUTCString().slice(17, 22) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="dash-header">
      <div className="header-logo">ZENITH</div>
      <div className="header-utc">{utc}</div>
      <SearchBox onSelect={onSearch} />
      <div className="layer-toggles">
        <button className={`toggle-btn${showCities      ? ' active' : ''}`} onClick={onToggleCities}>Cities</button>
        <button className={`toggle-btn${showNight       ? ' active' : ''}`} onClick={onToggleNight}>Night</button>
        <button
          className={`toggle-btn${showFlights ? ' active' : ''}${flightsError ? ' error' : ''}`}
          onClick={onToggleFlights} title={flightsError ?? undefined}
        >
          {flightsLoading ? 'Loading…' : flightsError ? 'Flights ✕'
            : showFlights && flightCount > 0 ? `Flights · ${flightCount.toLocaleString()}` : 'Flights'}
        </button>
        <button
          className={`toggle-btn${showSatellites ? ' active' : ''}${satellitesError ? ' error' : ''}`}
          onClick={onToggleSatellites} title={satellitesError ?? undefined}
        >
          {satellitesLoading ? 'Loading…' : satellitesError ? 'Sats ✕'
            : showSatellites && satelliteCount > 0 ? `Sats · ${satelliteCount}` : 'Satellites'}
        </button>
        <button className={`toggle-btn${showEvents ? ' active' : ''}`} onClick={onToggleEvents}>
          {showEvents && eventCount > 0 ? `Events · ${eventCount}` : 'Events'}
        </button>
      </div>
      {kp && (
        <div className="aurora-badge" style={{ color: kp.color }} title={kp.level}>
          ☀ <span>{kp.label}</span>
        </div>
      )}
      <div className="moon-phase" title={`${moon.label} · ${moon.illumination}% illuminated`}>
        {moon.emoji} <span>{moon.label}</span>
      </div>
    </header>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [weatherMap,     setWeatherMap]     = useState(new Map());
  const [aqiMap,         setAqiMap]         = useState(new Map());
  const [waveMap,        setWaveMap]        = useState(new Map());
  const [flights,        setFlights]        = useState([]);
  const [selectedCity,   setSelectedCity]   = useState(null);
  const [showCities,     setShowCities]     = useState(true);
  const [showFlights,    setShowFlights]    = useState(false);
  const [flightsLoading,  setFlightsLoading]  = useState(false);
  const [flightsError,    setFlightsError]    = useState(null);
  const [tleRecs,           setTleRecs]           = useState(null);
  const [satellites,        setSatellites]        = useState([]);
  const [showSatellites,    setShowSatellites]    = useState(false);
  const [satellitesLoading, setSatellitesLoading] = useState(false);
  const [satellitesError,   setSatellitesError]   = useState(null);
  const [events,     setEvents]     = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [showNight,       setShowNight]       = useState(true);
  const [kpIndex,         setKpIndex]         = useState(null);
  const [loadingCity,    setLoadingCity]    = useState(null);

  // Use a ref so the async click handler always sees the latest weatherMap
  const weatherMapRef = useRef(weatherMap);
  useEffect(() => { weatherMapRef.current = weatherMap; }, [weatherMap]);

  // Lazy-load city data on first click, cache forever
  const loadCityData = useCallback(async (city) => {
    if (weatherMapRef.current.has(city.name)) return;
    setLoadingCity(city.name);
    try {
      const [w, aqi] = await Promise.all([
        fetchWeatherForCity(city),
        fetchAirQuality(city),
      ]);
      setWeatherMap(prev => { const m = new Map(prev); m.set(city.name, w);   return m; });
      setAqiMap(prev     => { const m = new Map(prev); m.set(city.name, aqi); return m; });
      if (city.coastal) {
        const wave = await fetchWave(city);
        if (wave) setWaveMap(prev => { const m = new Map(prev); m.set(city.name, wave); return m; });
      }
    } catch (e) {
      console.warn('Failed to load city data:', e.message);
    } finally {
      setLoadingCity(null);
    }
  }, []);

  // Flights — only when layer is active, refresh every 15 min
  useEffect(() => {
    if (!showFlights) return;
    async function loadFlights() {
      setFlightsLoading(true);
      setFlightsError(null);
      try {
        const result = await fetchFlights();
        setFlights(result);
        if (result.length === 0) setFlightsError('No data returned');
      } catch (e) {
        console.warn('Flights fetch failed:', e.message);
        setFlightsError(e.message);
      } finally {
        setFlightsLoading(false);
      }
    }
    loadFlights();
    const id = setInterval(loadFlights, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [showFlights]);

  // Fetch TLEs from Celestrak once when layer first enabled
  useEffect(() => {
    if (!showSatellites || tleRecs) return;
    setSatellitesLoading(true);
    setSatellitesError(null);
    fetchTLEs().then(recs => {
      setTleRecs(recs);
      setSatellites(propagateSatellites(recs));
    }).catch(e => {
      console.warn('TLE fetch failed:', e);
      setSatellitesError(e.message);
    }).finally(() => setSatellitesLoading(false));
  }, [showSatellites, tleRecs]);

  // Propagate positions locally every 5 seconds (no API call)
  useEffect(() => {
    if (!showSatellites || !tleRecs) return;
    const id = setInterval(() => setSatellites(propagateSatellites(tleRecs)), 5_000);
    return () => clearInterval(id);
  }, [showSatellites, tleRecs]);

  // Events (earthquakes + EONET) — fetch on toggle, refresh every 10 min
  useEffect(() => {
    if (!showEvents) return;
    fetchAllEvents().then(setEvents).catch(console.warn);
    const id = setInterval(() => fetchAllEvents().then(setEvents).catch(console.warn), 10 * 60_000);
    return () => clearInterval(id);
  }, [showEvents]);

  // Kp index — fetch on mount, refresh every 30 min
  useEffect(() => {
    fetchKpIndex().then(setKpIndex).catch(console.warn);
    const id = setInterval(() => fetchKpIndex().then(setKpIndex).catch(console.warn), 30 * 60_000);
    return () => clearInterval(id);
  }, []);

  const handleCityClick = useCallback(city => {
    setSelectedCity(city);
    loadCityData(city);
  }, [loadCityData]);

  const handleSearch = useCallback(city => {
    setSelectedCity(city);
    loadCityData(city);
  }, [loadCityData]);

  const handleClose = useCallback(() => setSelectedCity(null), []);

  return (
    <AppShell bodyStyle={{ background: '#060a10', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#ddd8cc' }}>
    <div className="app-root">
      <Header
        showCities={showCities}
        showFlights={showFlights}
        flightsLoading={flightsLoading}
        flightsError={flightsError}
        flightCount={flights.length}
        showNight={showNight}
        showSatellites={showSatellites}
        satellitesLoading={satellitesLoading}
        satellitesError={satellitesError}
        satelliteCount={satellites.length}
        showEvents={showEvents}
        eventCount={events.length}
        kpIndex={kpIndex}
        onToggleCities={() => setShowCities(v => !v)}
        onToggleFlights={() => setShowFlights(v => !v)}
        onToggleNight={() => setShowNight(v => !v)}
        onToggleSatellites={() => setShowSatellites(v => !v)}
        onToggleEvents={() => setShowEvents(v => !v)}
        onSearch={handleSearch}
      />

      <div className="map-root">
        <MapContainer
          center={[20, 10]}
          zoom={2}
          minZoom={2}
          maxZoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <MapController selectedCity={selectedCity} />
          {showNight && <NightLayer />}
          {showCities && (
            <CityLayer
              cities={CITIES}
              weatherMap={weatherMap}
              selectedCityName={selectedCity?.name}
              onCityClick={handleCityClick}
            />
          )}
          {showFlights     && <FlightLayer     flights={flights}         />}
          {showSatellites  && <SatelliteLayer  satellites={satellites}   />}
          {showEvents && <EventsLayer events={events} />}
        </MapContainer>
      </div>

      {selectedCity && (
        <CityPanel
          city={selectedCity}
          w={weatherMap.get(selectedCity.name)}
          aqi={aqiMap.get(selectedCity.name)}
          wave={waveMap.get(selectedCity.name)}
          loading={loadingCity === selectedCity.name}
          onClose={handleClose}
        />
      )}
    </div>
    </AppShell>
  );
}
