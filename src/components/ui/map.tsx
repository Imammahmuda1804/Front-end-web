'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from 'next-themes';

const MAP_STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

type MapContextType = {
  map: maplibregl.Map | null;
  loaded: boolean;
};

const MapContext = createContext<MapContextType>({ map: null, loaded: false });

export const useMap = () => useContext(MapContext);

interface MapProps extends HTMLAttributes<HTMLDivElement> {
  center: [number, number];
  zoom?: number;
  children?: ReactNode;
}

export function Map({ center, zoom = 12, className, children, ...props }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle = resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;

    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyle,
      center: centerRef.current,
      zoom: zoomRef.current,
      attributionControl: false,
    });

    mapInstance.on('load', () => {
      setLoaded(true);
    });

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [resolvedTheme]);

  useEffect(() => {
    if (!map || !loaded) return;
    const targetStyle = resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;
    map.setStyle(targetStyle);
  }, [resolvedTheme, map, loaded]);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden rounded-lg ${className}`} {...props}>
      <MapContext.Provider value={{ map, loaded }}>
        {loaded && children}
      </MapContext.Provider>
    </div>
  );
}

interface MapMarkerProps {
  longitude: number;
  latitude: number;
  color?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export function MapMarker({ longitude, latitude, color = '#f97316', onClick, children }: MapMarkerProps) {
  const { map } = useMap();
  const [markerEl] = useState(() => {
    const el = document.createElement('div');
    el.className = 'cursor-pointer';
    return el;
  });

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!map) return;

    const marker = new maplibregl.Marker({
      element: children ? markerEl : undefined,
      color: children ? undefined : color,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    const clickHandler = () => {
      if (onClickRef.current) onClickRef.current();
    };

    marker.getElement().addEventListener('click', clickHandler);

    return () => {
      marker.getElement().removeEventListener('click', clickHandler);
      marker.remove();
    };
  }, [map, longitude, latitude, color, children, markerEl]);

  return children ? createPortal(children, markerEl) : null;
}

interface MapPopupProps {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children: ReactNode;
}

export function MapPopup({ longitude, latitude, onClose, children }: MapPopupProps) {
  const { map } = useMap();
  const [container] = useState(() => document.createElement('div'));

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!map) return;

    const popup = new maplibregl.Popup({ closeOnClick: false, offset: 15 })
      .setLngLat([longitude, latitude])
      .setDOMContent(container)
      .addTo(map);

    const closeHandler = () => {
      if (onCloseRef.current) onCloseRef.current();
    };

    popup.on('close', closeHandler);

    return () => {
      popup.off('close', closeHandler);
      popup.remove();
    };
  }, [map, longitude, latitude, container]);

  return createPortal(children, container);
}

interface MapRouteProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  id?: string;
}

export function MapRoute({ coordinates, color = '#f97316', width = 4, opacity = 0.8, id = 'route-path' }: MapRouteProps) {
  const { map, loaded } = useMap();

  useEffect(() => {
    if (!map || !loaded || coordinates.length < 2) return;

    const sourceId = `source-${id}`;
    const layerId = `layer-${id}`;

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
    });

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-opacity': opacity,
      },
    });

    const bounds = coordinates.reduce(
      (acc, coord) => acc.extend(coord),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
    );
    map.fitBounds(bounds, { padding: 40 });

    return () => {
      if (map && map.getStyle()) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      }
    };
  }, [map, loaded, coordinates, color, width, opacity, id]);

  return null;
}
