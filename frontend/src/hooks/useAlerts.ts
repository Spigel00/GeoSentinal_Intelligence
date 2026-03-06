import { useQuery } from '@tanstack/react-query';
import { getAllAlerts, getAlertsByRegion, getHighRiskAlerts } from '@/services/api';

/**
 * Hook to fetch all alerts
 */
export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: getAllAlerts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

/**
 * Hook to fetch alerts for a specific region
 */
export const useAlertsByRegion = (regionName: string, enabled = true) => {
  return useQuery({
    queryKey: ['alerts', regionName],
    queryFn: () => getAlertsByRegion(regionName),
    enabled: enabled && !!regionName,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch only high-risk alerts
 */
export const useHighRiskAlerts = () => {
  return useQuery({
    queryKey: ['alerts', 'high-risk'],
    queryFn: getHighRiskAlerts,
    staleTime: 1 * 60 * 1000, // 1 minute for high-priority alerts
    refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes
  });
};
