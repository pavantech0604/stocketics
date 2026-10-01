import React from 'react';
import { LegacyKPIGrid, KPICardData, LegacyKPIGridProps } from './LegacyKPIGrid';

export type { KPICardData };
export type RefKPIGridProps = LegacyKPIGridProps;

/**
 * RefKPIGrid (Maintained for backward compatibility).
 * Directly delegates to the verified LegacyKPIGrid component.
 */
export const RefKPIGrid: React.FC<RefKPIGridProps> = (props) => {
  return <LegacyKPIGrid {...props} />;
};

export default RefKPIGrid;
