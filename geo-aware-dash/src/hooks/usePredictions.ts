import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeCustomPrediction, type PredictionInput } from '@/services/api';
import { toast } from 'sonner';

/**
 * Hook to make custom predictions
 */
export const useMakePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PredictionInput) => makeCustomPrediction(data),
    onSuccess: (result) => {
      // Invalidate alerts and regions queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      
      // Show success notification with risk level
      const riskColor = result.risk_level === 'HIGH' ? '🔴' : 
                        result.risk_level === 'MEDIUM' ? '🟡' : '🟢';
      toast.success(`${riskColor} Prediction Complete: ${result.risk_level} Risk`, {
        description: `Probability: ${(result.probability * 100).toFixed(1)}% | Confidence: ${(result.confidence * 100).toFixed(1)}%`,
      });
    },
    onError: (error: any) => {
      toast.error('Prediction Failed', {
        description: error.response?.data?.detail || 'Unable to process prediction request',
      });
    },
  });
};
