import { useRef } from 'react';
export function useIdCompat() {
  var idRef = useRef(null);
  if (idRef.current === null) {
    idRef.current = 'custom-id-' + Math.random().toString(36).substr(2, 9);
  }
  return idRef.current;
}