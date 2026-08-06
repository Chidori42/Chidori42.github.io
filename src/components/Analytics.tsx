import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '@/lib/analytics';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

export const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) {
      return;
    }

    initAnalytics(GA_ID);
  }, []);

  useEffect(() => {
    if (!GA_ID) {
      return;
    }

    const routePath = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(GA_ID, routePath);
  }, [location.pathname, location.search, location.hash]);

  return null;
};
