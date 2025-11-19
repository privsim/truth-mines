/**
 * TOON Format Parser for Truth Mines
 *
 * Parses the token-optimized edge format into Edge objects.
 *
 * Format:
 * ```
 * relation[count]{f,t,w,domain}:
 * from_id,to_id,weight,domain
 * from_id,to_id,weight,domain
 * ```
 */

import type { Edge } from '../types/graph';

/**
 * Parse TOON format string into Edge array
 *
 * @param toonContent - The raw TOON file content
 * @returns Array of parsed edges
 */
export function parseToon(toonContent: string): Edge[] {
  const edges: Edge[] = [];

  if (!toonContent || !toonContent.trim()) {
    return edges;
  }

  const lines = toonContent.split('\n');
  let currentRelation: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Check if this is a relation header
    // Format: relation[count]{f,t,w,domain}:
    const headerMatch = trimmed.match(/^(\w+)\[(\d+)\]\{(.+)\}:$/);
    if (headerMatch) {
      currentRelation = headerMatch[1];
      continue;
    }

    // Parse edge data line
    // Expected format: from,to,weight,domain OR from,to,domain (no weight)
    if (currentRelation) {
      const parts = trimmed.split(',');

      if (parts.length >= 3) {
        // Check if has weight (4 parts) or no weight (3 parts)
        if (parts.length === 4) {
          // Format: from,to,weight,domain
          const [from, to, weightStr, domain] = parts;
          const weight = parseFloat(weightStr);

          if (!isNaN(weight)) {
            edges.push({
              f: from,
              t: to,
              relation: currentRelation,
              w: weight,
              domain,
            });
          }
        } else if (parts.length === 3) {
          // Format: from,to,domain (no weight)
          const [from, to, domain] = parts;
          edges.push({
            f: from,
            t: to,
            relation: currentRelation,
            domain,
            // w is undefined (optional in Edge type)
          });
        }
        // If parts.length is wrong, skip silently (malformed line)
      }
    }
  }

  return edges;
}
