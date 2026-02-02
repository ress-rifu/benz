-- Add vehicle mileage (distance in km) field to invoices table
-- This is used to track odometer readings during oil changes

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS vehicle_mileage INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN invoices.vehicle_mileage IS 'Vehicle odometer reading in kilometers at time of service';
