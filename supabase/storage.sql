-- Create storage bucket for invoice assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoice-assets',
    'invoice-assets',
    true,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can upload invoice assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'invoice-assets' 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Anyone can view invoice assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoice-assets');

CREATE POLICY "Super admins can update invoice assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'invoice-assets' 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
);

CREATE POLICY "Super admins can delete invoice assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'invoice-assets' 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
);

