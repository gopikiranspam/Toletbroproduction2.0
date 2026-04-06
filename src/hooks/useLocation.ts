/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { mapsService } from '../services/mapsService';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const getLocation = async () => {
      try {
        const pos = await mapsService.getCurrentLocation();
        if (mounted) {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to get location',
          }));
        }
      }
    };

    getLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return location;
};
