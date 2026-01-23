"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/lib/language/language-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TimeFilter } from "./actions";

interface SalesHeaderProps {
  currentFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter, customRange?: { from: string; to: string }) => void;
}

export function SalesHeader({ currentFilter, onFilterChange }: SalesHeaderProps) {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { t } = useLanguage();

  const handleCustomSubmit = () => {
    if (customFrom && customTo) {
      const fromDate = new Date(customFrom);
      const toDate = new Date(customTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day

      onFilterChange("custom", {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });
      setIsCustomDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("sales.title")}</h1>
        <p className="text-muted-foreground">
          View financial analytics and sales data
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentFilter === "today" ? "default" : "outline"}
          onClick={() => onFilterChange("today")}
        >
          {t("sales.filterToday")}
        </Button>
        <Button
          variant={currentFilter === "week" ? "default" : "outline"}
          onClick={() => onFilterChange("week")}
        >
          {t("sales.filterWeek")}
        </Button>
        <Button
          variant={currentFilter === "month" ? "default" : "outline"}
          onClick={() => onFilterChange("month")}
        >
          {t("sales.filterMonth")}
        </Button>

        <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant={currentFilter === "custom" ? "default" : "outline"}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t("sales.filterCustom")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Custom Date Range</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  min={customFrom}
                />
              </div>
              <Button
                onClick={handleCustomSubmit}
                disabled={!customFrom || !customTo}
                className="w-full"
              >
                Apply Range
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
