import { useEffect, useRef, useState } from 'react';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function CityAutocompleteInput({
  value,
  onChange,
  inputId,
  placeholder = 'City',
  className = ''
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const query = value.trim();

    if (!MAPBOX_ACCESS_TOKEN || query.length < 1) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const cachedSuggestions = cacheRef.current.get(query.toLowerCase());
    if (cachedSuggestions) {
      setSuggestions(cachedSuggestions);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN,
          autocomplete: 'true',
          types: 'place',
          limit: '5'
        });

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch city suggestions');
        }

        const data = await response.json();
        const nextSuggestions = (data.features || [])
          .filter((feature) => Array.isArray(feature.place_type) && feature.place_type.includes('place'))
          .map((feature) => feature.place_name)
          .filter(Boolean);

        cacheRef.current.set(query.toLowerCase(), nextSuggestions);
        setSuggestions(nextSuggestions);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  function handleSelect(city) {
    onChange(city);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  return (
    <div className="relative">
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          window.setTimeout(() => setShowSuggestions(false), 120);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />

      {loading ? (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-riotTextSecondary">
          Loading...
        </span>
      ) : null}

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute z-10 mt-2 max-h-60 w-full overflow-hidden rounded-[18px] border border-riotBorder bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          {suggestions.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(city)}
              className="block w-full px-4 py-3 text-left text-[14px] font-medium text-riotText transition hover:bg-[#f7f7f7]"
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
