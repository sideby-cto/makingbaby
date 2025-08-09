-- Add human-in-the-loop fields to upduo_user_mappings table
ALTER TABLE public.upduo_user_mappings 
ADD COLUMN IF NOT EXISTS mapping_method TEXT DEFAULT 'automated',
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Add index for better performance on review queries
CREATE INDEX IF NOT EXISTS idx_upduo_mappings_needs_review ON public.upduo_user_mappings(needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_upduo_mappings_confidence ON public.upduo_user_mappings(confidence_score);

-- Update existing mappings to mark low-confidence ones for review
UPDATE public.upduo_user_mappings 
SET needs_review = true, 
    mapping_method = 'automated_legacy',
    confidence_score = 0.5
WHERE confidence_score IS NULL;