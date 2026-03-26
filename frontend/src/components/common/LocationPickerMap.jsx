import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

const DEFAULT_CENTER = [23.8103, 90.4125];
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

if (L.Icon && L.Icon.Default) {
  // Prevent Leaflet from prefixing imagePath onto already-resolved Vite asset URLs.
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
}

const isValidCoordinate = (value) => Number.isFinite(Number(value));

const MapRecenter = ({ position, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, zoom, { animate: false });
  }, [map, position, zoom]);

  return null;
};

const MapClickListener = ({ onChange }) => {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

export const LocationPickerMap = ({
  latitude,
  longitude,
  onChange,
  readOnly = false,
  heightClass = 'h-56 sm:h-64',
  zoom = 13,
}) => {
  const hasCoordinates = useMemo(
    () => isValidCoordinate(latitude) && isValidCoordinate(longitude),
    [latitude, longitude]
  );

  const position = hasCoordinates
    ? [Number(latitude), Number(longitude)]
    : DEFAULT_CENTER;
  const coordinatesLabel = `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-[0_10px_28px_rgba(227,17,102,0.14)] ${heightClass}`}
    >
      <MapContainer
        center={position}
        zoom={zoom}
        className="h-full w-full [&_.leaflet-control-zoom]:border-none [&_.leaflet-control-zoom]:shadow-lg [&_.leaflet-control-zoom_a]:bg-white [&_.leaflet-control-zoom_a]:text-ink-700 [&_.leaflet-control-zoom_a]:transition-colors [&_.leaflet-control-zoom_a:hover]:bg-brand-50 [&_.leaflet-control-attribution]:bg-white/80 [&_.leaflet-control-attribution]:px-2 [&_.leaflet-control-attribution]:py-0.5 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-ink-500 [&_.leaflet-pane_.leaflet-marker-icon]:drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
        scrollWheelZoom
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_URL}
        />

        <MapRecenter position={position} zoom={zoom} />

        {!readOnly && onChange && <MapClickListener onChange={onChange} />}

        <Marker
          position={position}
          draggable={!readOnly}
          eventHandlers={
            !readOnly && onChange
              ? {
                  dragend(event) {
                    const marker = event.target;
                    const next = marker.getLatLng();
                    onChange(next.lat, next.lng);
                  },
                }
              : undefined
          }
        />
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/90 bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink-700 shadow-sm backdrop-blur">
        <span className="inline-flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${readOnly ? 'bg-emerald-500' : 'bg-brand-500'} animate-pulse`} />
          {readOnly ? 'Location Preview' : 'Pin Placement Mode'}
        </span>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 hidden rounded-full border border-white/90 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-ink-600 shadow-sm backdrop-blur sm:block">
        {readOnly ? 'Read Only' : 'Click map or drag marker'}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/90 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-ink-600 shadow-sm backdrop-blur">
        {coordinatesLabel}
      </div>
    </div>
  );
};
