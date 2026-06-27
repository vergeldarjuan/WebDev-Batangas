// useRevealAnimation.js - adds reveal animation class when elements enter viewport
import { useEffect } from 'react';

export function useRevealAnimation(refreshKey = '') {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal:not(.visible)');

    if (!elements.length) {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [refreshKey]);
}
