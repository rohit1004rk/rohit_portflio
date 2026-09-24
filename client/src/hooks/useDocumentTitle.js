import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} — Rohit Kumar`
      : 'Rohit Kumar — Full Stack + AI/ML Developer';
  }, [title]);
}
