import { useEffect, useMemo, useState } from 'react';

function formatValue(value, decimals) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export default function AnimatedNumber({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 900,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formatted = useMemo(
    () => `${prefix}${formatValue(displayValue, decimals)}${suffix}`,
    [displayValue, prefix, suffix, decimals]
  );

  return <>{formatted}</>;
}
