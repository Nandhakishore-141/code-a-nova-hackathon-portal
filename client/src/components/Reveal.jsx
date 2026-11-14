import { useEffect, useRef, useState } from 'react';

/**
 * Gently animates elements into view once when scrolled into the viewport.
 * Respects prefers-reduced-motion and renders immediately if IntersectionObserver is unsupported.
 */
const Reveal = ({
  children,
  className = '',
  delay = 0,
  variant = 'up',
  as: Component = 'div',
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ||
      typeof IntersectionObserver === 'undefined'
    );
  });

  useEffect(() => {
    if (isVisible) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  const hiddenTransform =
    variant === 'scale'
      ? 'opacity-0 scale-[0.97]'
      : variant === 'fade'
        ? 'opacity-0'
        : 'opacity-0 translate-y-4';

  const visibleTransform = 'opacity-100 translate-y-0 scale-100';

  return (
    <Component
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] ${
        isVisible ? visibleTransform : hiddenTransform
      } ${className}`}
    >
      {children}
    </Component>
  );
};

export default Reveal;

