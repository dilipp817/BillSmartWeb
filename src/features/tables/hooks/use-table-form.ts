"use client";

import { useEffect } from "react";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type Resolver, useForm } from "react-hook-form";

import { TableStatus } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { createTable, getTable, updateTable } from "../services/table-service";
import type { CreateTableRequest } from "../types";
import { TABLE_LIST_QUERY_KEY } from "./use-table-list";
import { tableFormSchema, type TableFormValues } from "../utils/table-form-schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TableFormMode = "add" | "edit";

export interface UseTableFormResult {
  form: ReturnType<typeof useForm<TableFormValues>>;
  isLoadingTable: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  mode: TableFormMode;
  onSubmit: (values: TableFormValues) => void;
}

interface UseTableFormOptions {
  mode: TableFormMode;
  /** Required when mode === "edit" */
  tableId?: number;
}

/**
 * useTableForm — ViewModel for the Add/Edit Table form (T-04).
 *
 * - "add" mode: submits POST /v1/restaurants/{id}/tables, then navigates
 *   back to /tables/management.
 * - "edit" mode: fetches table via GET /{id}, pre-fills the form, then
 *   submits PUT /{id} on save.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useTableForm({ mode, tableId }: UseTableFormOptions): UseTableFormResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<TableFormValues>({
    // Cast needed: z.coerce.number() has input type `unknown` which causes a
    // contravariance mismatch with standardSchemaResolver's generic inference.
    // The cast is safe — the resolver correctly validates and coerces the fields.
    resolver: standardSchemaResolver(tableFormSchema) as Resolver<TableFormValues>,
    defaultValues: {
      table_number: "",
      capacity: 4,
      floor: 0,
      status: TableStatus.AVAILABLE,
    },
  });

  // ── Edit mode: fetch table and populate form ──────────────────────────────
  const tableDetailQuery = useQuery({
    queryKey: ["tables", "detail", tableId],
    queryFn: () => getTable(restaurantId!, tableId!),
    enabled: mode === "edit" && tableId !== undefined && restaurantId !== null,
  });

  useEffect(() => {
    if (mode === "edit" && tableDetailQuery.data) {
      const t = tableDetailQuery.data;
      form.reset({
        table_number: t.table_number,
        capacity: t.capacity,
        floor: t.floor,
        status: t.status,
      });
    }
  }, [mode, tableDetailQuery.data, form]);

  // ── Add mutation ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateTableRequest) => {
      if (!restaurantId) throw new Error("No restaurant context");
      return createTable(restaurantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TABLE_LIST_QUERY_KEY, restaurantId] });
      router.push("/tables/management");
    },
  });

  // ── Edit mutation ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: CreateTableRequest) => {
      if (!tableId) throw new Error("No table ID");
      if (!restaurantId) throw new Error("No restaurant context");
      return updateTable(restaurantId, tableId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TABLE_LIST_QUERY_KEY, restaurantId] });
      router.push("/tables/management");
    },
  });

  // ── Submit handler ────────────────────────────────────────────────────────
  function onSubmit(values: TableFormValues) {
    const request: CreateTableRequest = {
      table_number: values.table_number.trim(),
      capacity: values.capacity,
      floor: values.floor,
      status: values.status,
    };

    if (mode === "add") {
      createMutation.mutate(request);
    } else {
      updateMutation.mutate(request);
    }
  }

  const activeMutation = mode === "add" ? createMutation : updateMutation;
  const submitError = activeMutation.error
    ? (activeMutation.error as Error).message || "An error occurred. Please try again."
    : null;

  return {
    form,
    isLoadingTable: tableDetailQuery.isLoading,
    isSubmitting: activeMutation.isPending,
    submitError,
    mode,
    onSubmit,
  };
}
