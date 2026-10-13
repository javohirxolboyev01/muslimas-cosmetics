import type { CSSProperties } from 'react';
import './Skeleton.css';

export function Skeleton({ style, className }: { style?: CSSProperties; className?: string }) {
  return <span className={className ? `skel ${className}` : 'skel'} style={style} aria-hidden="true" />;
}

export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Yuklanmoqda">
      <span />
    </div>
  );
}
