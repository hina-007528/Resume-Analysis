from supabase import create_client, Client
from app.config import settings

try:
    supabase: Client = create_client(
        settings.supabase_url, 
        settings.supabase_service_role_key
    )
except Exception as e:
    print(f"Supabase initialization failed: {e}")
    supabase = None


def get_supabase_admin() -> Client:
    if not supabase:
        raise RuntimeError("Supabase client not initialized")
    return supabase




