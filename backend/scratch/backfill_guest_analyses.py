import argparse
from typing import Any

from app.db.supabase import supabase


def ensure_profile(user_id: str) -> None:
    existing = supabase.table("profiles").select("id").eq("id", user_id).limit(1).execute()
    if existing.data:
        return

    email = f"{user_id}@placeholder.local"
    full_name = None

    try:
        auth_response = supabase.auth.admin.get_user_by_id(user_id)
        auth_user = getattr(auth_response, "user", None)
        if auth_user:
            email = getattr(auth_user, "email", None) or email
            user_metadata = getattr(auth_user, "user_metadata", {}) or {}
            full_name = user_metadata.get("full_name") or user_metadata.get("name")
    except Exception:
        pass

    supabase.table("profiles").insert(
        {"id": user_id, "email": email, "full_name": full_name}
    ).execute()


def fetch_guest_analyses(limit: int, filename_contains: str | None) -> list[dict[str, Any]]:
    query = (
        supabase.table("analyses")
        .select("id,resume_filename,created_at,user_id")
        .is_("user_id", "null")
        .order("created_at", desc=True)
        .limit(limit)
    )
    response = query.execute()
    rows = response.data or []
    if filename_contains:
        needle = filename_contains.lower()
        rows = [r for r in rows if needle in (r.get("resume_filename") or "").lower()]
    return rows


def assign_to_user(analysis_id: str, user_id: str) -> None:
    supabase.table("analyses").update({"user_id": user_id}).eq("id", analysis_id).execute()


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill guest analyses to a specific user.")
    parser.add_argument("--user-id", required=True, help="Supabase auth user id")
    parser.add_argument("--limit", type=int, default=50, help="Max guest rows to inspect")
    parser.add_argument(
        "--filename-contains",
        default=None,
        help="Optional filename filter (e.g. Hina_Shareef)",
    )
    parser.add_argument("--apply", action="store_true", help="Apply updates (default is dry-run)")
    args = parser.parse_args()

    if not supabase:
        raise RuntimeError("Supabase client not initialized")

    ensure_profile(args.user_id)
    rows = fetch_guest_analyses(args.limit, args.filename_contains)

    print(f"Found {len(rows)} guest analyses matching filters.")
    for row in rows:
        print(f"- {row['id']} | {row.get('resume_filename')} | {row.get('created_at')}")

    if not args.apply:
        print("\nDry-run only. Re-run with --apply to update rows.")
        return

    for row in rows:
        assign_to_user(row["id"], args.user_id)

    print(f"\nUpdated {len(rows)} analyses to user_id={args.user_id}.")


if __name__ == "__main__":
    main()
