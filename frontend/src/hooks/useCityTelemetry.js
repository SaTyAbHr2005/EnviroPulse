import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

// Global cache instance (persists across component mounts)
const telemetryCache = {};

/**
 * Custom hook to fetch and cache city telemetry.
 * Implements a Stale-While-Revalidate (SWR) pattern for instant UI updates.
 */
export const useCityTelemetry = (districtName) => {
  // Initialize state with cache if available, otherwise null
  const [data, setData] = useState(() => telemetryCache[districtName]?.data || null);
  const [topPolluted, setTopPolluted] = useState(() => telemetryCache['GLOBAL_TOP']?.data || []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!telemetryCache[districtName]); // Only load if strictly no cache
  
  // Ref to track the currently requested district to prevent race conditions
  const activeDistrictRef = useRef(districtName);

  useEffect(() => {
    activeDistrictRef.current = districtName;
    
    // 1. Instantly swap to cached data if we have it
    if (telemetryCache[districtName]) {
      setData(telemetryCache[districtName].data);
      setTopPolluted(telemetryCache['GLOBAL_TOP']?.data || []);
      setLoading(false); // UI renders instantly
    } else {
      setLoading(true); // Needs a hard fetch
      setData(null);
    }

    // 2. Background Revalidation (Fetch fresh data silently)
    let isMounted = true;

    const fetchFreshData = async () => {
      try {
        const [districtRes, topRes] = await Promise.all([
           axios.get(`${BACKEND_URL}/analytics/district/${districtName}`),
           axios.get(`${BACKEND_URL}/analytics/top-polluted`)
        ]);

        // Guard against race conditions (user swapped cities while request was in-flight)
        if (isMounted && activeDistrictRef.current === districtName) {
           const freshDistrictData = districtRes.data;
           const freshTopData = topRes.data;

           // Update Cache
           telemetryCache[districtName] = { data: freshDistrictData, timestamp: Date.now() };
           telemetryCache['GLOBAL_TOP'] = { data: freshTopData, timestamp: Date.now() };

           // Update State (triggers React re-render with fresh numbers)
           setData(freshDistrictData);
           setTopPolluted(freshTopData);
           setError(null);
        }
      } catch (err) {
        if (isMounted && activeDistrictRef.current === districtName) {
           console.error(`Error fetching telemetry for ${districtName}:`, err);
           // Silent fail - we keep displaying the cached data and don't interrupt the UX
           // unless it's a hard 401 which implies Auth failure
           if(err.response?.status === 401) {
              setError("Unauthorized");
           }
        }
      } finally {
        if (isMounted && activeDistrictRef.current === districtName) {
           setLoading(false);
        }
      }
    };

    // Initial silent fetch
    fetchFreshData();

    // 3. Centralized Polling Loop (Every 3 seconds)
    const intervalId = setInterval(fetchFreshData, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [districtName]); // Re-run effect when selected city changes

  return { data, topPolluted, loading, error };
};
