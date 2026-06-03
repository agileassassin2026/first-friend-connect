CREATE TABLE public.match_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL,
  target_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT match_requests_distinct_users CHECK (requester_id <> target_id),
  CONSTRAINT match_requests_status_check CHECK (status IN ('pending', 'accepted', 'declined'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_requests TO authenticated;
GRANT ALL ON public.match_requests TO service_role;

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view match requests involving themselves"
ON public.match_requests
FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Users can create their own match requests"
ON public.match_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update match requests involving themselves"
ON public.match_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = target_id)
WITH CHECK (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Users can delete match requests involving themselves"
ON public.match_requests
FOR DELETE
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE UNIQUE INDEX match_requests_unique_pending_pair
ON public.match_requests (
  LEAST(requester_id, target_id),
  GREATEST(requester_id, target_id)
)
WHERE status = 'pending';

CREATE INDEX match_requests_requester_idx ON public.match_requests (requester_id, updated_at DESC);
CREATE INDEX match_requests_target_idx ON public.match_requests (target_id, updated_at DESC);

CREATE TRIGGER update_match_requests_updated_at
BEFORE UPDATE ON public.match_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();