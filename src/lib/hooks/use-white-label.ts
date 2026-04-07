"use client";

import { useState, useEffect } from "react";

export interface WhiteLabelConfig {
  enabled: boolean;
  logoUrl: string | null;
  primaryColor: string | null;
  companyName: string | null;
  customDomain: string | null;
}

const DEFAULT_CONFIG: WhiteLabelConfig = {
  enabled: false,
  logoUrl: null,
  primaryColor: null,
  companyName: null,
  customDomain: null,
};

let cache: WhiteLabelConfig | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export function useWhiteLabel(): { config: WhiteLabelConfig; loading: boolean } {
  const [config, setConfig] = useState<WhiteLabelConfig>(cache ?? DEFAULT_CONFIG);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    const now = Date.now();
    if (cache && now - cacheTime < CACHE_TTL) {
      setConfig(cache);
      setLoading(false);
      return;
    }

    fetch("/api/settings/white-label")
      .then(async (res) => {
        if (!res.ok) {
          setConfig(DEFAULT_CONFIG);
          return;
        }
        const json = await res.json();
        const data = json.data as Partial<WhiteLabelConfig> | null;
        const result: WhiteLabelConfig = {
          enabled: data?.enabled ?? false,
          logoUrl: data?.logoUrl ?? null,
          primaryColor: data?.primaryColor ?? null,
          companyName: data?.companyName ?? null,
          customDomain: data?.customDomain ?? null,
        };
        cache = result;
        cacheTime = Date.now();
        setConfig(result);
      })
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
