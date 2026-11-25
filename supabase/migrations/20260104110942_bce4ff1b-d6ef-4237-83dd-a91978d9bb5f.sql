-- Fix get_user_role function to add access control
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    -- Users can query their own role
    WHEN _user_id = auth.uid() THEN
      (SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1)
    -- Admins can query any role
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
      (SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1)
    -- All others get NULL
    ELSE
      NULL
  END;
$$;

-- Fix handle_new_user function to add input validation and sanitization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name TEXT;
  _phone TEXT;
  _usn TEXT;
BEGIN
  -- Validate and sanitize name (max 100 chars, trim whitespace)
  _name := COALESCE(
    TRIM(substring(NEW.raw_user_meta_data ->> 'name', 1, 100)),
    'User'
  );
  IF LENGTH(_name) < 1 THEN
    _name := 'User';
  END IF;
  
  -- Validate and sanitize phone (remove non-digits except +, max 20 chars)
  _phone := substring(
    regexp_replace(
      COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
      '[^0-9+]',
      '',
      'g'
    ),
    1,
    20
  );
  IF LENGTH(_phone) < 1 THEN
    _phone := NULL;
  END IF;
  
  -- Validate and sanitize USN (max 50 chars)
  _usn := substring(
    TRIM(COALESCE(NEW.raw_user_meta_data ->> 'usn', '')),
    1,
    50
  );
  IF LENGTH(_usn) < 1 THEN
    _usn := NULL;
  END IF;
  
  -- Insert profile with validated data
  INSERT INTO public.profiles (user_id, name, phone, usn)
  VALUES (NEW.id, _name, _phone, _usn);
  
  -- Always start as student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail authentication
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;