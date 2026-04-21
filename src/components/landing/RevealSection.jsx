import { useEffect, useRef, useState } from 'react';

export default function RevealSection({ children, className = '', as: Tag = 'section' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal-section ${isVisible ? 'is-visible' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
