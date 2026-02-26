'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type LocationState = {
  lat: number;
  lng: number;
} | null;

type SearchResponse = {
  success: boolean;
  address?: string;
  addresses?: string[];
  error?: string;
};

export default function Home() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<LocationState>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAsked, setLocationAsked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Ask for location permission on mount
  useEffect(() => {
    if (locationAsked) return;
    setLocationAsked(true);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
      },
      (err) => {
        setLocationError(err.message || 'Failed to get location.');
      },
      { enableHighAccuracy: true }
    );
  }, [locationAsked]);

  async function handleSearch() {
    if (!location) {
      setSearchError('Please allow location access first.');
      return;
    }
    setSearchError(null);
    setAddresses([]);
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://location-app-befq.onrender.com';
    try {
      const res = await fetch(`${apiUrl}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          lat: location.lat,
          lng: location.lng
        })
      });
      const data: SearchResponse = await res.json();

      if (!res.ok) {
        setSearchError(data.error || 'Request failed.');
        return;
      }
      if (data.addresses && data.addresses.length > 0) {
        setAddresses(data.addresses);
      } else if (data.address) {
        setAddresses([data.address]);
      } else {
        setAddresses([]);
        setSearchError(data.error || 'No address returned.');
      }
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400">
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        {/* Glass card: search box */}
        <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-white/90">Your name</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-white/15 border-white/30 text-white placeholder:text-white/60"
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !location}
                className="shrink-0 bg-white/20 text-white hover:bg-white/30 border border-white/30"
              >
                {loading ? 'Searching…' : 'Search Location'}
              </Button>
            </div>
            {locationError && <p className="text-sm text-red-200">{locationError}</p>}
            {!location && !locationError && (
              <p className="text-sm text-white/80">Requesting location…</p>
            )}
            {searchError && <p className="text-sm text-red-200">{searchError}</p>}
          </div>
        </div>

        {/* Results box (below search) */}
        {addresses.length > 0 && (
          <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white/90 mb-3">Location address(es)</h3>
            <ul className="space-y-2">
              {addresses.map((addr, i) => (
                <li
                  key={i}
                  className="text-sm text-white/90 py-2 px-3 rounded-lg bg-white/10 border border-white/10"
                >
                  {addr}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
