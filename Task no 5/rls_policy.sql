ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts"
ON posts
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);