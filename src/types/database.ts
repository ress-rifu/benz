export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "super_admin" | "admin";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          name: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          name?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          sku: string;
          quantity: number;
          cost_price: number;
          selling_price: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku: string;
          quantity: number;
          cost_price: number;
          selling_price: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string;
          quantity?: number;
          cost_price?: number;
          selling_price?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_logs: {
        Row: {
          id: string;
          inventory_item_id: string;
          action: "add" | "remove" | "adjust" | "invoice_deduct";
          quantity_change: number;
          previous_quantity: number;
          new_quantity: number;
          reason: string | null;
          user_id: string;
          invoice_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          inventory_item_id: string;
          action: "add" | "remove" | "adjust" | "invoice_deduct";
          quantity_change: number;
          previous_quantity: number;
          new_quantity: number;
          reason?: string | null;
          user_id: string;
          invoice_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inventory_item_id?: string;
          action?: "add" | "remove" | "adjust" | "invoice_deduct";
          quantity_change?: number;
          previous_quantity?: number;
          new_quantity?: number;
          reason?: string | null;
          user_id?: string;
          invoice_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_logs_inventory_item_id_fkey";
            columns: ["inventory_item_id"];
            isOneToOne: false;
            referencedRelation: "inventory_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_logs_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          }
        ];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          customer_address: string | null;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year: number | null;
          vehicle_vin: string | null;
          vehicle_license_plate: string | null;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          discount_amount: number;
          total: number;
          notes: string | null;
          created_by: string;
          billed_by_name: string | null;
          settings_snapshot: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          customer_address?: string | null;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year?: number | null;
          vehicle_vin?: string | null;
          vehicle_license_plate?: string | null;
          subtotal: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_amount?: number;
          total: number;
          notes?: string | null;
          created_by: string;
          billed_by_name?: string | null;
          settings_snapshot?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          type: "part" | "service";
          inventory_item_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          part_model: string | null;
          part_serial: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          type: "part" | "service";
          inventory_item_id?: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          part_model?: string | null;
          part_serial?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          type?: "part" | "service";
          inventory_item_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoice_items_inventory_item_id_fkey";
            columns: ["inventory_item_id"];
            isOneToOne: false;
            referencedRelation: "inventory_items";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice_settings: {
        Row: {
          id: string;
          logo_url: string | null;
          header_text: string | null;
          footer_text: string | null;
          primary_color: string;
          secondary_color: string;
          show_logo: boolean;
          show_header: boolean;
          show_footer: boolean;
          show_vehicle_vin: boolean;
          show_vehicle_license: boolean;
          show_customer_email: boolean;
          show_customer_phone: boolean;
          show_customer_address: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          logo_url?: string | null;
          header_text?: string | null;
          footer_text?: string | null;
          primary_color?: string;
          secondary_color?: string;
          show_logo?: boolean;
          show_header?: boolean;
          show_footer?: boolean;
          show_vehicle_vin?: boolean;
          show_vehicle_license?: boolean;
          show_customer_email?: boolean;
          show_customer_phone?: boolean;
          show_customer_address?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          logo_url?: string | null;
          header_text?: string | null;
          footer_text?: string | null;
          primary_color?: string;
          secondary_color?: string;
          show_logo?: boolean;
          show_header?: boolean;
          show_footer?: boolean;
          show_vehicle_vin?: boolean;
          show_vehicle_license?: boolean;
          show_customer_email?: boolean;
          show_customer_phone?: boolean;
          show_customer_address?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          name_bn: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_bn?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_bn?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          name_bn: string | null;
          description: string | null;
          price: number;
          duration_minutes: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          name_bn?: string | null;
          description?: string | null;
          price: number;
          duration_minutes?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          name_bn?: string | null;
          description?: string | null;
          price?: number;
          duration_minutes?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      part_categories: {
        Row: {
          id: string;
          name: string;
          name_bn: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_bn?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_bn?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      part_brands: {
        Row: {
          id: string;
          name: string;
          category_id: string | null;
          country_of_origin: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id?: string | null;
          country_of_origin?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string | null;
          country_of_origin?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "part_brands_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "part_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      parts: {
        Row: {
          id: string;
          category_id: string;
          brand_id: string | null;
          name: string;
          name_bn: string | null;
          sku: string;
          part_number: string | null;
          quantity: number;
          cost_price: number;
          selling_price: number;
          min_stock_level: number | null;
          description: string | null;
          compatible_vehicles: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          brand_id?: string | null;
          name: string;
          name_bn?: string | null;
          sku: string;
          part_number?: string | null;
          quantity?: number;
          cost_price: number;
          selling_price: number;
          min_stock_level?: number | null;
          description?: string | null;
          compatible_vehicles?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          brand_id?: string | null;
          name?: string;
          name_bn?: string | null;
          sku?: string;
          part_number?: string | null;
          quantity?: number;
          cost_price?: number;
          selling_price?: number;
          min_stock_level?: number | null;
          description?: string | null;
          compatible_vehicles?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "part_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parts_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "part_brands";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      inventory_action: "add" | "remove" | "adjust" | "invoice_deduct";
      invoice_item_type: "part" | "service";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Type helpers for tables
export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;

// Legacy aliases for backward compatibility
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
