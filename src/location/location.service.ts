import { Injectable } from '@nestjs/common';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

@Injectable()
export class LocationService {
  async getAddressFromCoords(lat: number, lng: number): Promise<string[]> {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'LocationApp/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Geocoding failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    const addresses: string[] = [];
    if (data.display_name) {
      addresses.push(data.display_name);
    }
    if (data.address) {
      const parts = [
        data.address.road,
        data.address.suburb,
        data.address.city,
        data.address.state,
        data.address.country,
      ].filter(Boolean);
      if (parts.length > 0) {
        const formatted = parts.join(', ');
        if (!addresses.includes(formatted)) {
          addresses.push(formatted);
        }
      }
    }
    return addresses.length > 0 ? addresses : ['Address not found'];
  }
}
