-- Migration v6: Add state and pincode to clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT;
