-- Allow authenticated users to update their own client record
-- (matched via current_client_id() helper) so the bioimpedance TMB
-- can be synced to clients.basal_rate_kcal for daily_summary calcs.
CREATE POLICY "Users can update their own client record"
ON public.clients
FOR UPDATE
TO authenticated
USING (id = public.current_client_id())
WITH CHECK (id = public.current_client_id());