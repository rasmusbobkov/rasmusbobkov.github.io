#!/usr/bin/env bash
# check-file-lengths.sh - keep one code file from growing past a cap.
#
# Usage:
#   scripts/check-file-lengths.sh [project-dir] [cap]
#
# Prints one line per code file over the cap and exits 1; exits 0 silently when
# every file is within it. `project-dir` defaults to `.` and `cap` to 1500
# lines, which is the cap this project chose.
#
# It counts every code file under the project directory whose extension is one
# of ts tsx js mjs cjs astro css sh bash py. It leaves out installed packages
# (`node_modules`), build output (`dist`), the generated Astro types
# (`.astro`), the local fixture workspace (`gen/`) and the git directory,
# because the project does not write those by hand.
#
# A file over the cap is fixed by splitting it. Raising the cap is a decision
# of its own, taken on purpose, never to make a build pass.
#
# It needs only bash, find and wc, and it never writes.
set -eu

CAP_DEFAULT=1500
EXTS=(ts tsx js mjs cjs astro css sh bash py)

die() {
  printf 'check-file-lengths: %s\n' "$*" >&2
  exit 2
}

[ -d "${1:-.}" ] || die "no such directory: ${1:-.}"
PROJECT=$(cd "${1:-.}" && pwd -P)
CAP=${2:-$CAP_DEFAULT}

case "$CAP" in
  ''|*[!0-9]*) die "the cap must be a whole number of lines: $CAP" ;;
esac

is_code_file() {
  local ext=${1##*.} want
  for want in "${EXTS[@]}"; do
    [ "$ext" = "$want" ] && return 0
  done
  return 1
}

problems=0
while IFS= read -r file; do
  is_code_file "$file" || continue
  [ -r "$file" ] || continue
  lines=$(wc -l < "$file")
  lines=${lines//[!0-9]/}
  [ -n "$lines" ] || continue
  if [ "$lines" -gt "$CAP" ]; then
    printf '%s: %s lines, over the %s-line cap\n' "${file#"$PROJECT"/}" "$lines" "$CAP"
    problems=$((problems + 1))
  fi
done < <(find "$PROJECT" \
  \( -name .git -o -name node_modules -o -name dist -o -name .astro -o -name gen \) -prune -o \
  -type f -print)

if [ "$problems" -gt 0 ]; then
  printf '%s file(s) over the %s-line cap: split the file rather than raise the cap\n' \
    "$problems" "$CAP"
  exit 1
fi
exit 0
