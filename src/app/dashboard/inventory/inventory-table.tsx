import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getOrSet } from "@/lib/redis/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis/client";
import { formatCurrency } from "@/lib/utils";
import { InventoryActions } from "./inventory-actions";
import type { Tables } from "@/types/database";

async function getInventoryItems(): Promise<Tables<"inventory_items">[]> {
  const supabase = await createClient();

  return getOrSet(
    CACHE_KEYS.INVENTORY,
    async () => {
      const { data } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");
      return data || [];
    },
    CACHE_TTL.MEDIUM
  );
}

export async function InventoryTable() {
  const items = await getInventoryItems();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-500">No inventory items yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Add your first item to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="font-mono text-sm text-slate-500">
                {item.sku}
              </TableCell>
              <TableCell className="text-right">
                {item.quantity < 10 ? (
                  <Badge variant="destructive">{item.quantity}</Badge>
                ) : (
                  <span>{item.quantity}</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.cost_price)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.selling_price)}
              </TableCell>
              <TableCell>
                <InventoryActions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

