import React, { useRef } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places'];

export default function AddressAutocomplete({ value, onChange, placeholder = "Entrez une adresse...", className }) {
  const autocompleteRef = useRef(null);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    }
  };

  if (!isLoaded) return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} className={className}/>
  );

  return (
    <Autocomplete
      onLoad={ref => autocompleteRef.current = ref}
      onPlaceChanged={onPlaceChanged}
      options={{ componentRestrictions: { country: 'cm' } }}
    >
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={className}/>
    </Autocomplete>
  );
}
