export function initAnalytics(measurementId: string): void {
  if (typeof document === 'undefined' || !measurementId) {
    return;
  }

  const existing = document.querySelector(`script[data-ga-id="${measurementId}"]`);
  if (!existing) {
    const scriptTag = document.createElement('script');
    scriptTag.async = true;
    scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    scriptTag.dataset.gaId = measurementId;
    document.head.appendChild(scriptTag);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  // Disable automatic page_view so SPA routes are tracked manually.
  window.gtag('config', measurementId, { send_page_view: false });
}

export function trackPageView(measurementId: string, path: string): void {
  if (!measurementId || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
    send_to: measurementId,
  });
}

export function trackAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params || {});
}
