import type { Doc } from "../../convex/_generated/dataModel";

/**
 * Fuzzy-match a client by name or slug within a workspace.
 * - Exact match on name (case-insensitive) or slug: return it
 * - Substring match on name or slug: return if unique, otherwise throw
 * - No match: throw
 */
export function resolveClientFromList(
  clients: Doc<"clients">[],
  input: string
): Doc<"clients"> {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) throw new Error("Empty client name");

  const exact = clients.find(
    (c) => c.name.toLowerCase() === trimmed || c.slug === trimmed
  );
  if (exact) return exact;

  const contains = clients.filter(
    (c) => c.name.toLowerCase().includes(trimmed) || c.slug.includes(trimmed)
  );
  if (contains.length === 1) return contains[0];
  if (contains.length === 0) throw new Error(`No client found matching "${input}"`);
  throw new Error(
    `Ambiguous client name "${input}". Did you mean: ${contains.map((c) => c.name).join(", ")}?`
  );
}
