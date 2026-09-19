interface ResearchVisualProps {
  className?: string;
}

/**
 * Lightweight "research intelligence" visual.
 * Pure inline SVG + CSS animation — loads instantly, no WebGL, no images.
 * Concentric rings, connected nodes and a pulsing core: knowledge / research /
 * connected information.
 */
export function ResearchVisual({ className = '' }: ResearchVisualProps) {
  const nodes = [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: 50 + 33 * Math.cos(rad), y: 50 + 33 * Math.sin(rad) };
  });
  const outerNodes = [30, 150, 270].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: 50 + 46 * Math.cos(rad), y: 50 + 46 * Math.sin(rad) };
  });

  return (
    <div className={`relative h-24 w-24 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
        {/* Concentric rings */}
        <circle cx="50" cy="50" r="46" stroke="#1D4ED8" strokeOpacity="0.10" strokeWidth="1" />
        <circle cx="50" cy="50" r="33" stroke="#1D4ED8" strokeOpacity="0.16" strokeWidth="1" />
        <circle cx="50" cy="50" r="19" stroke="#1D4ED8" strokeOpacity="0.22" strokeWidth="1" />

        {/* Rotating connected node network */}
        <g className="rv-spin" style={{ transformOrigin: '50px 50px' }}>
          {nodes.map((n, i) => (
            <line
              key={`l-${i}`}
              x1="50"
              y1="50"
              x2={n.x}
              y2={n.y}
              stroke="#172554"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          ))}
          {nodes.map((n, i) => (
            <circle key={`n-${i}`} cx={n.x} cy={n.y} r="2.4" fill="#1D4ED8" fillOpacity="0.75" />
          ))}
        </g>

        {/* Static outer satellite nodes */}
        {outerNodes.map((n, i) => (
          <circle key={`o-${i}`} cx={n.x} cy={n.y} r="1.8" fill="#172554" fillOpacity="0.35" />
        ))}

        {/* Core */}
        <circle cx="50" cy="50" r="7" fill="#1D4ED8" fillOpacity="0.12" className="rv-pulse" />
        <circle cx="50" cy="50" r="3.4" fill="#1D4ED8" className="rv-pulse" />
      </svg>
    </div>
  );
}
