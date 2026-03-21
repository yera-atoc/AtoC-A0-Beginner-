/*
  # Create automatic user initialization on signup

  ## Function
  - Auto-create user_stats record when new user signs up
  - Triggered on auth.users INSERT

  ## Security
  - Uses service_role context (internal trigger)
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  INSERT INTO public.user_subscriptions (user_id, course_id, access_type, is_active)
  SELECT NEW.id, id, 'free', true
  FROM courses
  WHERE is_free = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();