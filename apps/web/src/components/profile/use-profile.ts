import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import { useAuthStore } from '@web/stores/auth.store';
import { AuthUser, UpdateProfileRequest, UpdatePasswordRequest } from '@growflow/types';

/**
 * Hook to update the current user's profile (name).
 */
export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<AuthUser, Error, UpdateProfileRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<AuthUser>('/auth/me/profile', data);
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
    },
  });
}

/**
 * Hook to update the current user's password.
 */
export function useUpdatePassword() {
  return useMutation<void, Error, UpdatePasswordRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<void>('/auth/me/password', data);
    },
  });
}
