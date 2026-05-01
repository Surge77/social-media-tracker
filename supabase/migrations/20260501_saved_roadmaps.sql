-- saved_roadmaps: one roadmap per user, stores raw quiz answers
CREATE TABLE IF NOT EXISTS saved_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT saved_roadmaps_user_id_unique UNIQUE (user_id)
);

-- RLS
ALTER TABLE saved_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roadmap"
  ON saved_roadmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap"
  ON saved_roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap"
  ON saved_roadmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap"
  ON saved_roadmaps FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_roadmaps_updated_at
  BEFORE UPDATE ON saved_roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
