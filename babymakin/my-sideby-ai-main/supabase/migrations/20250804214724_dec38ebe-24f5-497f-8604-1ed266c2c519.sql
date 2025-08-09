-- Create storage bucket for animations if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('animations', 'animations', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create policies for animations bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'animations');

CREATE POLICY "Authenticated users can upload animations"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'animations' AND auth.role() = 'authenticated');