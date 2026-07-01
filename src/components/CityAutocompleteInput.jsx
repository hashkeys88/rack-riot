import { useEffect, useId, useRef, useState } from 'react';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function CityAutocompleteInput({
  value,
  onChange,
  onBlur,
  inputId,
  placeholder = 'City',
  className = ''
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cacheRef = useRef(new Map());
  const listboxId = useId();

  useEffect(() => {
    const query = value.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const cachedSuggestions = cacheRef.current.get(query.toLowerCase());
    if (cachedSuggestions) {
      setSuggestions(cachedSuggestions);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);

      try {
        const mapboxParams = new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN || '',
          autocomplete: 'true',
          types: 'place',
          limit: '5'
        });
        const photonParams = new URLSearchParams({
          q: query,
          limit: '5',
          layer: 'city'
        });
        const response = await fetch(MAPBOX_ACCESS_TOKEN
          ? `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${mapboxParams.toString()}`
          : `https://photon.komoot.io/api/?${photonParams.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to fetch city suggestions');
        }

        const data = await response.json();
        const nextSuggestions = (data.features || [])
          .filter((feature) => (
            MAPBOX_ACCESS_TOKEN
              ? Array.isArray(feature.place_type) && feature.place_type.includes('place')
              : feature.properties?.type === 'city'
          ))
          .map((feature) => {
            if (MAPBOX_ACCESS_TOKEN) return feature.place_name;

            const { name, state, country } = feature.properties || {};
            return [name, state, country].filter(Boolean).join(', ');
          })
          .filter(Boolean);

        const uniqueSuggestions = [...new Set(nextSuggestions)];
        cacheRef.current.set(query.toLowerCase(), uniqueSuggestions);
        setSuggestions(uniqueSuggestions);
        setActiveIndex(-1);
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
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (!showSuggestions || !suggestions.length) {
      if (event.key === 'ArrowDown' && suggestions.length) setShowSuggestions(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
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
        onKeyDown={handleKeyDown}
        onBlur={() => {
          onBlur?.();
          window.setTimeout(() => setShowSuggestions(false), 120);
        }}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions && suggestions.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        className={className}
      />

      {loading ? (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-riotTextSecondary">
          Loading...
        </span>
      ) : null}

      {showSuggestions && suggestions.length > 0 ? (
        <div id={listboxId} role="listbox" className="absolute z-10 mt-2 max-h-60 w-full overflow-hidden border border-atelier-ink/20 bg-atelier-paper shadow-[8px_8px_0_rgba(23,33,25,0.16)]">
          {suggestions.map((city, index) => (
            <button
              key={city}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(city)}
              className={`block w-full px-4 py-3 text-left text-[14px] font-medium text-riotText transition ${
                activeIndex === index ? 'bg-atelier-citrus' : 'hover:bg-atelier-clay'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
