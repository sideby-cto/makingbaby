-- Create student success signs table
CREATE TABLE public.student_success_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  transcript_id UUID REFERENCES public.upduo_transcripts(id),
  sign_type TEXT NOT NULL CHECK (sign_type IN ('persistence', 'engagement', 'comprehension', 'participation', 'collaboration', 'creativity')),
  description TEXT NOT NULL,
  evidence_text TEXT,
  confidence_level INTEGER NOT NULL DEFAULT 3 CHECK (confidence_level >= 1 AND confidence_level <= 5),
  detection_method TEXT NOT NULL DEFAULT 'manual' CHECK (detection_method IN ('manual', 'ai_assisted', 'automated')),
  detected_by UUID REFERENCES public.profiles(id),
  session_timestamp TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_student_success_signs_student_id ON public.student_success_signs(student_id);
CREATE INDEX idx_student_success_signs_transcript_id ON public.student_success_signs(transcript_id);
CREATE INDEX idx_student_success_signs_sign_type ON public.student_success_signs(sign_type);
CREATE INDEX idx_student_success_signs_created_at ON public.student_success_signs(created_at DESC);

-- Enable RLS
ALTER TABLE public.student_success_signs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin users can manage all student success signs"
ON public.student_success_signs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  )
);

CREATE POLICY "Users can view success signs for their own students"
ON public.student_success_signs
FOR SELECT
USING (
  -- Allow if user is admin or if they have some relationship to the student
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_student_success_signs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_success_signs_updated_at
  BEFORE UPDATE ON public.student_success_signs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_success_signs_updated_at();