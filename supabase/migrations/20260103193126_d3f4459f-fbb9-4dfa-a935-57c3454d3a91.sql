-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true);

-- Policy to allow anyone to view menu images
CREATE POLICY "Anyone can view menu images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'menu-images');

-- Policy to allow admins to upload menu images
CREATE POLICY "Admins can upload menu images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy to allow admins to update menu images
CREATE POLICY "Admins can update menu images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'menu-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy to allow admins to delete menu images
CREATE POLICY "Admins can delete menu images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'menu-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);