import { useEffect } from "react";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Resolver, useForm } from "react-hook-form";

import { useAuthStore } from "@/store/use-auth-store";

import { getRestaurant, updateRestaurant } from "../services/restaurant-service";
import type { UpdateRestaurantRequest } from "../types";
import { restaurantFormSchema, type RestaurantFormValues } from "../utils/restaurant-form-schema";

// ─── Query Key ────────────────────────────────────────────────────────────────

export const RESTAURANT_SETTINGS_QUERY_KEY = ["settings", "restaurant"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseRestaurantSettingsResult {
  form: ReturnType<typeof useForm<RestaurantFormValues>>;
  isLoading: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError: string | null;
  onSubmit: (values: RestaurantFormValues) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useRestaurantSettings — ViewModel for the Restaurant Settings form (S-03).
 *
 * - Fetches the restaurant record on mount and populates the form.
 * - On submit: calls PATCH /restaurants/{id} with all required fields.
 * - On success: invalidates the query so the displayed values stay in sync.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useRestaurantSettings(): UseRestaurantSettingsResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();

  const form = useForm<RestaurantFormValues>({
    // Cast needed: standardSchemaResolver's generic inference doesn't match
    // zod's inferred input type for string fields with .min()/.max().
    // The cast is safe — the resolver correctly validates all fields.
    resolver: standardSchemaResolver(restaurantFormSchema) as Resolver<RestaurantFormValues>,
    defaultValues: {
      outlet_name: "",
      displayname: "",
      outlet_manager: "",
      building: "",
      street: "",
      location: "",
      zip_code: "",
    },
  });

  // ── Fetch current restaurant data ─────────────────────────────────────────
  const restaurantQuery = useQuery({
    queryKey: [...RESTAURANT_SETTINGS_QUERY_KEY, restaurantId],
    queryFn: () => {
      if (!restaurantId) throw new Error("No restaurant context");
      return getRestaurant(restaurantId);
    },
    enabled: restaurantId !== null,
    staleTime: 5 * 60 * 1_000,
  });

  // ── Populate form when data loads ─────────────────────────────────────────
  useEffect(() => {
    if (restaurantQuery.data) {
      const r = restaurantQuery.data;
      form.reset({
        outlet_name: r.outlet_name,
        displayname: r.displayname,
        outlet_manager: r.outlet_manager,
        building: r.address.building,
        street: r.address.street,
        location: r.address.location,
        zip_code: r.address.zip_code,
      });
    }
  }, [restaurantQuery.data, form]);

  // ── Update mutation ───────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (values: RestaurantFormValues) => {
      if (!restaurantId) throw new Error("No restaurant context");
      const request: UpdateRestaurantRequest = {
        outlet_name: values.outlet_name,
        displayname: values.displayname,
        outlet_manager: values.outlet_manager,
        store_address: {
          building: values.building,
          street: values.street,
          location: values.location,
          zip_code: values.zip_code,
        },
      };
      return updateRestaurant(restaurantId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...RESTAURANT_SETTINGS_QUERY_KEY, restaurantId],
      });
    },
  });

  function onSubmit(values: RestaurantFormValues) {
    updateMutation.mutate(values);
  }

  const submitError = updateMutation.error
    ? (updateMutation.error as Error).message || "Failed to save settings."
    : null;

  return {
    form,
    isLoading: restaurantQuery.isLoading,
    isSubmitting: updateMutation.isPending,
    isSuccess: updateMutation.isSuccess,
    submitError,
    onSubmit,
  };
}
