"use client";

import { RoleGuard } from "@/components/role-guard";
import { UserRole } from "@/constants";
import { FoodForm } from "@/features/menu/components/food-form";
import { useFoodForm } from "@/features/menu/hooks/use-food-form";

export default function AddFoodPage() {
  const vm = useFoodForm({ mode: "add" });

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <FoodForm vm={vm} title="Add Food" />
    </RoleGuard>
  );
}
