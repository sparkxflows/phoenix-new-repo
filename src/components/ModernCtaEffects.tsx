import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Tags CTA-style buttons and links at runtime so every current and future CTA
// receives the same smooth golden hover treatment without editing each component.
const CTA_PATTERN = /book|appointment|whatsapp|call|contact|submit|send|claim|join|sign|save|upload|add|delete|view|explore|get started|rewards|review|gallery|menu|close|login|register|consultation|enquiry|inquiry/i;

const isGold = (el: HTMLElement) => {
  const className = typeof el.className === 'string' ? el.className : '';
  return /FFD60A|ffe033|amber-4|yellow-4|bg-\[#FFD/i.test(className);
};

const isEmerald = (el: HTMLElement) => {
  const className = typeof el.className === 'string' ? el.className : '';
  return /emerald/i.test(className);
};

export function ModernCtaEffects() {
  const location = useLocation();

  useEffect(() => {
    let frame = 0;

    const mark = () => {
      document.querySelectorAll<HTMLElement>('button, a').forEach((el) => {
        if (el.closest('[data-no-modern-cta]')) return;
        // Header pills already have their own gold capsule hover effect.
        if (el.closest('.nav-capsule')) return;

        const already = el.dataset.modernCta;
        if (!already) {
          const text = (el.textContent || '').trim();
          const aria = el.getAttribute('aria-label') || '';
          const href = el.getAttribute('href') || '';
          const haystack = `${text} ${aria} ${href}`;
          const hasCtaCopy = CTA_PATTERN.test(haystack);
          const hasCtaHref = /wa\.me|tel:|mailto:/i.test(href);
          const hasPointerClass = el.classList.contains('cursor-pointer');

          if (hasCtaCopy || hasCtaHref || hasPointerClass) {
            el.dataset.modernCta = isGold(el) ? 'gold' : 'dark';
          } else {
            return;
          }
        }

        if (isEmerald(el)) el.classList.add('cta-whatsapp');
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        mark();
      });
    };

    mark();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [location.pathname, location.hash, location.search]);

  return null;
}
