"use client";

import { Printer, Store } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/constants";
import { RestaurantSettingsForm } from "@/features/settings/components/restaurant-settings-form";
import { PrinterSettingsForm } from "@/features/print/components/printer-settings-form";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useAuthStore } from "@/store/use-auth-store";

export default function SettingsPage() {
  const isPrintingEnabled = useFeatureFlag("is_bill_printing_enabled");
  const role = useAuthStore((state) => state.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Device and application configuration.</p>
      </div>

      {/* Restaurant Settings — admin only */}
      {role === UserRole.ADMIN && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="size-4" />
              Restaurant Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Edit outlet name, display name, manager, and address for this restaurant.
            </p>
            <RestaurantSettingsForm />
          </CardContent>
        </Card>
      )}

      {/* Printer Settings — hidden when is_bill_printing_enabled is false */}
      {isPrintingEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Printer className="size-4" />
              Printer Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Configure the Print Agent URL for this device. The Print Agent must be running locally
              to send receipts to the thermal printer.
            </p>
            <PrinterSettingsForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
