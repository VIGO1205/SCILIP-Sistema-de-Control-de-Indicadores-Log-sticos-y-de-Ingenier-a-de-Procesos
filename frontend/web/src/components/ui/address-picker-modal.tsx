'use client';

import React, { useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Dialog, DialogPanel } from '@tremor/react';
import { MapPin, Search, X, Check, Loader2 } from 'lucide-react';
import L from 'leaflet';

// Fix default icon issue with Leaflet in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface AddressPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
  initialAddress?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function AddressPickerModal({ isOpen, onClose, onSelect, initialAddress }: AddressPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [selected, setSelected] = useState<{ lat: number; lon: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.711, -74.0721]); // Bogotá default
  const abortRef = useRef<AbortController | null>(null);

  const searchAddress = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResults([]);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        { signal: abortRef.current.signal, headers: { 'Accept-Language': 'es' } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      if (data.length > 0) {
        const first = data[0];
        setMapCenter([parseFloat(first.lat), parseFloat(first.lon)]);
      }
    } catch {
      // ignore abort errors
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      const address = data.display_name || '';
      setSelected({ lat, lon, address });
    } catch {
      setSelected({ lat, lon, address: '' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      setMapCenter([lat, lon]);
      reverseGeocode(lat, lon);
    },
    [reverseGeocode]
  );

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setMapCenter([lat, lon]);
    setSelected({ lat, lon, address: result.display_name });
    setResults([]);
  };

  const handleConfirm = () => {
    if (selected?.address) {
      onSelect(selected.address);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col mx-4">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-gray-900">Seleccionar Ubicación</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar dirección, ciudad o país..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-9 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setResults([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={searchAddress}
              disabled={loading || !searchQuery.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}

          {/* Map */}
          <div className="h-80 rounded-lg overflow-hidden border border-gray-200 relative">
            <MapContainer
              center={mapCenter}
              zoom={selected ? 16 : 12}
              scrollWheelZoom={true}
              className="h-full w-full"
              key={`${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onClick={handleMapClick} />
              {selected && <Marker position={[selected.lat, selected.lon]} />}
            </MapContainer>

            {loading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[1000]">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            Haz clic en el mapa para obtener la dirección exacta, o usa la barra de búsqueda.
          </p>

          {/* Selected address */}
          {selected?.address && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">Dirección seleccionada:</p>
              <p className="text-sm text-gray-900">{selected.address}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 px-5 py-3 flex justify-end gap-2 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected?.address}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Check className="h-4 w-4" />
            Usar esta dirección
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
