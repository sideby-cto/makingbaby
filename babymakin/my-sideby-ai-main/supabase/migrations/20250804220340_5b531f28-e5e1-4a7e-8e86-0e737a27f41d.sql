-- Create the animations bucket if it doesn't exist and make it public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('animations', 'animations', true, 52428800, ARRAY['image/gif', 'video/quicktime', 'video/mp4'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/gif', 'video/quicktime', 'video/mp4'];

-- Create permissive policies for the animations bucket
CREATE POLICY "Allow public access to animations" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'animations');

CREATE POLICY "Allow authenticated users to upload animations" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'animations' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update animations" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'animations' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete animations" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'animations' AND auth.role() = 'authenticated');