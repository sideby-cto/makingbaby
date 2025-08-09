-- Add logo_url column to crews table
ALTER TABLE public.crews ADD COLUMN logo_url TEXT;

-- Create storage bucket for crew logos
INSERT INTO storage.buckets (id, name, public) VALUES ('crew-logos', 'crew-logos', true);

-- Create storage policies for crew logos
CREATE POLICY "Crew logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'crew-logos');

CREATE POLICY "Admins can upload crew logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'crew-logos' AND auth.email() LIKE '%@sideby.ai');

CREATE POLICY "Admins can update crew logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'crew-logos' AND auth.email() LIKE '%@sideby.ai');

CREATE POLICY "Admins can delete crew logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'crew-logos' AND auth.email() LIKE '%@sideby.ai');