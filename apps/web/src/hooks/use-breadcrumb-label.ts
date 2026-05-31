import { useEffect } from 'react';
import { useBreadcrumbStore } from '../stores/breadcrumb.store';

export function useBreadcrumbLabel(id: string | undefined, label: string | undefined) {
  const setEntityLabel = useBreadcrumbStore((s) => s.setEntityLabel);
  const clearEntityLabel = useBreadcrumbStore((s) => s.clearEntityLabel);

  useEffect(() => {
    if (id && label) {
      setEntityLabel(id, label);
    }
    return () => {
      if (id) {
        clearEntityLabel(id);
      }
    };
  }, [id, label, setEntityLabel, clearEntityLabel]);
}
