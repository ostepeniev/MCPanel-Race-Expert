'use client';

/**
 * SWR fetch wrapper with auth and error handling.
 *
 * @module shared/hooks/useFetch
 */

import useSWR from 'swr';
import { SWR_REFRESH_INTERVAL } from '@/src/shared/types';

/**
 * Standard fetcher with auth error handling.
 * On 401 → redirect to /login.
 */
async function fetcher(url) {
  const res = await fetch(url);

  if (res.status === 401) {
    // Session expired — redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = new Error('API error');
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch {
      error.info = { message: res.statusText };
    }
    throw error;
  }

  return res.json();
}

/**
 * Fetch dashboard data with SWR.
 *
 * @param {string} url - API endpoint (e.g., '/api/dashboard/orders')
 * @param {object} [options] - SWR options override
 * @returns {{ data: any, error: Error, isLoading: boolean, isValidating: boolean, mutate: Function }}
 */
export function useFetch(url, options = {}) {
  const {
    refreshInterval = SWR_REFRESH_INTERVAL,
    ...rest
  } = options;

  return useSWR(url, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    dedupingInterval: 2000,
    ...rest,
  });
}

/**
 * Fetch with custom period parameter.
 *
 * @param {string} baseUrl - e.g., '/api/dashboard/orders'
 * @param {string} [period='current_month']
 * @param {object} [options]
 */
export function useFetchPeriod(baseUrl, period = 'current_month', options = {}) {
  const url = `${baseUrl}?period=${period}`;
  return useFetch(url, options);
}
