REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bootstrap_current_user(TEXT) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.bootstrap_current_user(TEXT) TO authenticated;