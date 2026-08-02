CREATE OR REPLACE FUNCTION public.bootstrap_current_user(_display_name text DEFAULT NULL::text)
 RETURNS TABLE(display_name text, workspace_name text, role app_role)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  _uid UUID := auth.uid();
  _name TEXT;
  _ws TEXT;
  _role app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (id, display_name)
  VALUES (_uid, _display_name)
  ON CONFLICT (id) DO UPDATE
    SET display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'intern')
  ON CONFLICT (user_id, role) DO NOTHING;

  SELECT p.display_name, p.workspace_name INTO _name, _ws
  FROM public.profiles p WHERE p.id = _uid;

  SELECT ur.role INTO _role
  FROM public.user_roles ur
  WHERE ur.user_id = _uid
  ORDER BY CASE ur.role
    WHEN 'admin' THEN 0
    WHEN 'hr_manager' THEN 1
    WHEN 'eng_lead' THEN 2
    ELSE 3 END
  LIMIT 1;

  RETURN QUERY SELECT _name, _ws, _role;
END;
$function$;