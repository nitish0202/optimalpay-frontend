import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWallet, addCard, removeCard, updateCard } from '../api/wallet';
import type { AddCardRequest, UpdateCardRequest } from '../types';

export function useWallet() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
  });

  const add = useMutation({
    mutationFn: (data: AddCardRequest) => addCard(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardRequest }) => updateCard(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });

  return { query, add, update, remove };
}
