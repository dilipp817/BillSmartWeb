"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  isLoading: boolean;
  onApply: (startDate: string, endDate: string) => void;
}

/**
 * DateRangePicker — two date inputs with an Apply button.
 *
 * Maintains local state while the user edits; only calls onApply on submit.
 * Validates that startDate is not after endDate before submitting.
 */
export function DateRangePicker({ startDate, endDate, isLoading, onApply }: DateRangePickerProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [error, setError] = useState<string | null>(null);

  function handleApply() {
    if (localStart > localEnd) {
      setError("Start date must be on or before end date.");
      return;
    }
    setError(null);
    onApply(localStart, localEnd);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1">
        <Label htmlFor="report-start">From</Label>
        <Input
          id="report-start"
          type="date"
          value={localStart}
          onChange={(e) => setLocalStart(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="report-end">To</Label>
        <Input
          id="report-end"
          type="date"
          value={localEnd}
          onChange={(e) => setLocalEnd(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        {error && <p className="text-destructive text-xs">{error}</p>}
        <Button onClick={handleApply} disabled={isLoading} size="sm">
          {isLoading ? "Loading…" : "Apply"}
        </Button>
      </div>
    </div>
  );
}
