#!/usr/bin/env bash
# check-project-docs.sh - verify one project's documentation shape.
#
# Usage:
#   scripts/check-project-docs.sh [project-dir]
#
# Prints one line per problem and exits 1 when anything is wrong, exits 0
# silently when the project is clean, and prints `no shape:` and exits 0 when
# the project has none of the docs files (adoption is opt-in per project).
#
# It reports:
#   - a required file or heading is missing;
#   - a generated block's markers are unbalanced;
#   - a generated block names a path (`- path ...`) that no longer exists;
#   - a generated block records no source HEAD, or one that is not an ancestor
#     of the current HEAD;
#   - an invariant rule has no stable id, names neither verify: nor manual:,
#     or names a verify: test path that does not exist;
#   - a docs/decisions/NNNN-*.md record absent from its index table.
#
# This file is a generated copy: the firstmate home's private overlay
# (`data/local-template/project-docs/check-project-docs.sh`, refreshed by
# `data/local-bin/fm-project-docs.sh`) owns its content. Do not hand-edit it;
# re-run that tool's `refresh` instead. It needs only bash and git, no jq, and
# it never writes.
set -eu

ARCH_REL=docs/architecture.md
INV_REL=docs/invariants.md
INDEX_REL=docs/decisions/index.md
MAP_REL=docs/README.md
REQUIRED_FILES=("$ARCH_REL" "$INV_REL" "$INDEX_REL")
DOC_FILES=("$ARCH_REL" "$INV_REL" "$INDEX_REL" "$MAP_REL")

PROBLEMS=()

die() {
  printf 'check-project-docs: %s\n' "$*" >&2
  exit 2
}

add_problem() {
  PROBLEMS+=("$1")
}

[ -d "${1:-.}" ] || die "no such directory: ${1:-.}"
PROJECT=$(cd "${1:-.}" && pwd -P)
PROJECT_NAME=$(basename "$PROJECT")

has_any_shape_file() {
  local rel
  for rel in "${REQUIRED_FILES[@]}"; do
    [ -e "$PROJECT/$rel" ] && return 0
  done
  return 1
}

check_headings() {
  local rel=$1 heading
  shift
  for heading in "$@"; do
    grep -qiE "$heading" "$PROJECT/$rel" \
      || add_problem "$rel: required heading is missing: $heading"
  done
}

# Emit "P<TAB>problem" for each marker defect and "B<TAB>name<TAB>begin<TAB>end"
# for each balanced generated block, in file order.
scan_blocks() {
  awk '
    BEGIN { inb = 0 }
    {
      if ($0 ~ /^<!-- fm:generated:begin [A-Za-z0-9._-]+ -->$/) {
        if (inb) {
          printf "P\tnested generated begin marker at line %d\n", NR
          next
        }
        name = $0
        sub(/^<!-- fm:generated:begin /, "", name)
        sub(/ -->$/, "", name)
        inb = 1
        start = NR
        next
      }
      if ($0 ~ /^<!-- fm:generated:end -->$/) {
        if (!inb) {
          printf "P\tgenerated end marker without a begin at line %d\n", NR
          next
        }
        printf "B\t%s\t%d\t%d\n", name, start, NR
        inb = 0
        next
      }
    }
    END {
      if (inb) {
        printf "P\tgenerated begin marker for %s at line %d has no end marker\n", name, start
      }
    }' "$1"
}

check_generated_block() {
  local rel=$1 name=$2 begin=$3 end=$4 body recorded_head claim
  body=$(sed -n "$((begin + 1)),$((end - 1))p" "$PROJECT/$rel")
  recorded_head=$(printf '%s\n' "$body" | sed -n 's/^<!-- fm:generated-meta .*head=\([^ ]*\).* -->$/\1/p' | head -n 1)
  if [ -z "$recorded_head" ]; then
    add_problem "$rel: generated block '$name' records no source head; run refresh"
  elif [ "$recorded_head" != none ] && git -C "$PROJECT" rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
    if ! git -C "$PROJECT" merge-base --is-ancestor "$recorded_head" HEAD 2>/dev/null; then
      add_problem "$rel: generated block '$name' records head $recorded_head, which is not an ancestor of HEAD; run refresh"
    fi
  fi
  while IFS= read -r claim; do
    [ -n "$claim" ] || continue
    claim=${claim%/}
    [ -e "$PROJECT/$claim" ] \
      || add_problem "$rel: generated block '$name' names a path that no longer exists: $claim"
  done < <(printf '%s\n' "$body" | sed -n 's/^- path `\([^`]*\)`.*/\1/p')
}

check_generated_blocks() {
  local rel=$1 kind field1 field2 field3
  while IFS=$'\t' read -r kind field1 field2 field3; do
    case "$kind" in
      P) add_problem "$rel: $field1" ;;
      B) check_generated_block "$rel" "$field1" "$field2" "$field3" ;;
    esac
  done < <(scan_blocks "$PROJECT/$rel")
}

# Print the invariants file with HTML comment blocks removed, so a commented
# example rule is not read as an active rule.
invariants_without_comments() {
  awk '
    incomment == 1 { if ($0 ~ /-->/) incomment = 0; next }
    {
      if ($0 ~ /<!--/) {
        if ($0 ~ /-->/) next
        incomment = 1
        next
      }
      print
    }' "$1"
}

check_invariants() {
  local line path
  while IFS= read -r line; do
    case "$line" in
      '- '*) ;;
      *) continue ;;
    esac
    if ! printf '%s\n' "$line" | grep -qE '^-[[:space:]]+[A-Z][A-Z0-9]*(-[A-Z0-9]+)*-[0-9]+:'; then
      add_problem "$INV_REL: rule has no stable id: ${line:0:80}"
      continue
    fi
    if printf '%s\n' "$line" | grep -qE '[[:space:]]manual:'; then
      printf '%s\n' "$line" | grep -qE 'manual:[[:space:]]*[^[:space:]]' \
        || add_problem "$INV_REL: rule has an empty manual: justification: ${line:0:80}"
      continue
    fi
    if ! printf '%s\n' "$line" | grep -qE '[[:space:]]verify:'; then
      add_problem "$INV_REL: rule names neither verify: nor manual:: ${line:0:80}"
      continue
    fi
    path=$(printf '%s\n' "$line" | sed -n 's/.*[[:space:]]verify:[[:space:]]*\([^[:space:]]*\).*/\1/p')
    if [ -z "$path" ]; then
      add_problem "$INV_REL: rule names no test path after verify:: ${line:0:80}"
      continue
    fi
    path=${path%%::*}
    [ -e "$PROJECT/$path" ] \
      || add_problem "$INV_REL: verify: names a test that does not exist: $path"
  done < <(invariants_without_comments "$PROJECT/$INV_REL")
}

check_adr_index() {
  local adr base
  [ -d "$PROJECT/docs/decisions" ] || return 0
  for adr in "$PROJECT/docs/decisions"/[0-9][0-9][0-9][0-9]-*.md; do
    [ -e "$adr" ] || continue
    base=$(basename "$adr")
    grep -Fq "$base" "$PROJECT/$INDEX_REL" \
      || add_problem "$INDEX_REL: decision record $base is not listed in the index table"
  done
}

if ! has_any_shape_file; then
  printf 'no shape: %s (adoption is opt-in; run the firstmate docs tool'"'"'s init to adopt it)\n' "$PROJECT_NAME"
  exit 0
fi

for rel in "${REQUIRED_FILES[@]}"; do
  [ -f "$PROJECT/$rel" ] || add_problem "$rel: required file is missing"
done

if [ -f "$PROJECT/$ARCH_REL" ]; then
  check_headings "$ARCH_REL" \
    '^##[[:space:]]+Purpose[[:space:]]*$' \
    '^##[[:space:]]+How to run and verify[[:space:]]*$' \
    '^##[[:space:]]+Map[[:space:]]*$' \
    '^##[[:space:]]+Where to change what[[:space:]]*$'
fi
if [ -f "$PROJECT/$INV_REL" ]; then
  check_headings "$INV_REL" '^#[[:space:]]+Invariants[[:space:]]*$'
  check_invariants
fi
if [ -f "$PROJECT/$INDEX_REL" ]; then
  check_headings "$INDEX_REL" '^#[[:space:]]+Decisions[[:space:]]*$'
  check_adr_index
fi
for rel in "${DOC_FILES[@]}"; do
  [ -f "$PROJECT/$rel" ] || continue
  check_generated_blocks "$rel"
done

if [ "${#PROBLEMS[@]}" -eq 0 ]; then
  exit 0
fi
for problem in "${PROBLEMS[@]}"; do
  printf '%s\n' "$problem"
done
exit 1
