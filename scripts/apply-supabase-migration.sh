#!/bin/zsh
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <dev|prod> <migration-file>"
  echo "Example: $0 dev supabase/migrations/20260416_unify_waitlist.sql"
  exit 1
fi

TARGET="$1"
MIGRATION_FILE="$2"

case "$TARGET" in
  dev)
    DB_URL="${SUPABASE_DB_URL_DEV:-}"
    ;;
  prod)
    DB_URL="${SUPABASE_DB_URL_PROD:-}"
    ;;
  *)
    echo "Unknown target: $TARGET"
    echo "Use dev or prod."
    exit 1
    ;;
esac

if [[ -z "$DB_URL" ]]; then
  echo "Missing database URL for $TARGET."
  echo "Set SUPABASE_DB_URL_DEV or SUPABASE_DB_URL_PROD first."
  exit 1
fi

if [[ ! -f "$MIGRATION_FILE" ]]; then
  echo "Migration file not found: $MIGRATION_FILE"
  exit 1
fi

/opt/homebrew/opt/libpq/bin/psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION_FILE"
