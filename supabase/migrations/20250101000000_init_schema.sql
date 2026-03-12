-- ─────────────────────────────────────────────────────────────────────────────
-- supabase/migrations/20250101000001_security_fixes.sql
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- or add it as a migration: supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. HOW TO SET A USER AS ADMIN ────────────────────────────────────────────
-- Replace <user-id> with the UUID from auth.users for the account you want to
-- be admin. Find it in: Supabase Dashboard → Authentication → Users.
--
-- UPDATE profiles SET role = 'ADMIN' WHERE id = '<user-id>';


-- ── 2. ROW LEVEL SECURITY for products table ──────────────────────────────────
-- Allow anyone to READ products, but only ADMIN users can write.

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products
CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (true);

-- Only admins can insert products
CREATE POLICY "products_insert_admin_only"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- Only admins can update products
CREATE POLICY "products_update_admin_only"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- Only admins can delete products
CREATE POLICY "products_delete_admin_only"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );


-- ── 3. ROW LEVEL SECURITY for reviews table ───────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can insert their own reviews (max 2 per product enforced by function/trigger)
CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own reviews
CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);


-- ── 4. DB TRIGGER: enforce max 2 reviews per user per product ─────────────────
CREATE OR REPLACE FUNCTION check_review_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM reviews
    WHERE user_id = NEW.user_id
      AND product_id = NEW.product_id
  ) >= 2 THEN
    RAISE EXCEPTION 'You can only submit up to 2 reviews for this product.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_review_limit
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_limit();


-- ── 5. ROW LEVEL SECURITY for orders table ────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own orders
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own orders
CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (cancel) their own orders only
CREATE POLICY "orders_update_own"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);


-- ── 6. ROW LEVEL SECURITY for profiles table ──────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but NOT their own role — use a separate admin function)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Prevent self-promotion: users cannot change their own role
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );