
-- Allow authenticated users to insert summits (for fallback summit creation)
CREATE POLICY "Authenticated users can insert summits"
ON public.summits
FOR INSERT
TO authenticated
WITH CHECK (true);
