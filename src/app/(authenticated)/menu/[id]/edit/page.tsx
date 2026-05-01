"use client";

import { use } from "react";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { FoodForm } from "@/features/menu/components/food-form";
import { useFoodForm } from "@/features/menu/hooks/use-food-form";

interface EditFoodPageProps {
  params: Promise<{ id: string }>;
}

export default function EditFoodPage({ params }: EditFoodPageProps) {
  const { id } = use(params);
  const foodId = Number(id);

  if (isNaN(foodId) || foodId <= 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="text-destructive size-8" />
        <p className="text-muted-foreground text-sm">Invalid food ID.</p>
        <Link href="/menu">
          <Button variant="outline" size="sm">
            Back to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <EditFoodForm foodId={foodId} />
    </RoleGuard>
  );
}

function EditFoodForm({ foodId }: { foodId: number }) {
  const vm = useFoodForm({ mode: "edit", foodId });

  return <FoodForm vm={vm} title="Edit Food" />;
}
