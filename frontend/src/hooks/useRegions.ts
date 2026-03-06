import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllRegions, getMapRiskLevels, predictForRegion, getRegionAlerts } from '@/services/api';

/**
 * Hook to fetch all regions
 */
export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getAllRegions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });
};

/**
 * Hook to fetch map risk levels for all regions
 */
export const useMapRiskLevels = () => {
  return useQuery({
    queryKey: ['mapRisk'],
    queryFn: getMapRiskLevels,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};

/**
 * Hook to predict for a specific region
 */
export const useRegionPrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regionName: string) => predictForRegion(regionName),
    onSuccess: () => {
      // Invalidate regions and map risk queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['mapRisk'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

/**
 * Hook to fetch alerts for a specific region
 */
export const useRegionAlerts = (regionName: string, enabled = true) => {
  return useQuery({
    queryKey: ['regionAlerts', regionName],
    queryFn: () => getRegionAlerts(regionName),
    enabled: enabled && !!regionName,
    staleTime: 2 * 60 * 1000,
  });
};
