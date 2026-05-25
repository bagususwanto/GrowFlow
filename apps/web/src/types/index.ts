import React from 'react';

/**
 * Standard Navigation Item layout structure.
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

/**
 * Custom wrapper for API Response data.
 */
export interface ClientResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
