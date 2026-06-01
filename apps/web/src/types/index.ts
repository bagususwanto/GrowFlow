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


