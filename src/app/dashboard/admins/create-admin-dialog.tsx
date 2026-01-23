"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { createAdmin } from "./actions";
import { useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language/language-context";

interface CreateAdminFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
}

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdminDialog({ open, onOpenChange }: CreateAdminDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "admin",
    },
  });

  const onSubmit = (data: CreateAdminFormData) => {
    startTransition(async () => {
      const result = await createAdmin(data);

      if (result?.error) {
        toast({
          title: t("forms.error"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("forms.success"),
          description: t("forms.adminCreated"),
        });
        reset();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("forms.addAdmin")}</DialogTitle>
          <DialogDescription>
            {t("forms.addAdmin")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("forms.fullName")} *</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("forms.enterName")}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("forms.username")} *</Label>
            <Input
              id="username"
              type="text"
              placeholder={t("forms.enterUsername")}
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Username can only contain letters, numbers, and underscores",
                },
              })}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("forms.email")} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("forms.enterEmail")}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("forms.password")} *</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("forms.enterPassword")}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("forms.role")} *</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: t("forms.required") }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("forms.role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("admins.admin")}</SelectItem>
                    <SelectItem value="super_admin">{t("admins.superAdmin")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t("forms.saving") : t("forms.addAdmin")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
