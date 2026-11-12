import {
  buildHighlightRegex,
  matchesAllTokens,
  tokenizeQuery,
  type HighlightSegment,
} from '../components/Guide/guideSearchUtils';

export type { HighlightSegment };
export { buildHighlightRegex, matchesAllTokens, tokenizeQuery };

export interface SearchableSegment {
  id: string;
  text: string;
}

export interface SearchMatchLocation {
  segmentId: string;
  segmentIndex: number;
  occurrenceIndex: number;
}

const COMPILED_QUERY_LIMIT = 16;
const compiledByQuery = new Map<string, { source: string; flags: string } | null>();

function highlightRegexForQuery(query: string): RegExp | null {
  const cached = compiledByQuery.get(query);
  if (cached !== undefined) {
    return cached ? new RegExp(cached.source, cached.flags) : null;
  }
  const compiled = buildHighlightRegex(tokenizeQuery(query));
  if (compiledByQuery.size >= COMPILED_QUERY_LIMIT) {
    const oldest = compiledByQuery.keys().next().value;
    if (oldest !== undefined) {
      compiledByQuery.delete(oldest);
    }
  }
  compiledByQuery.set(
    query,
    compiled ? { source: compiled.source, flags: compiled.flags } : null,
  );
  return compiled;
}

function countRegexMatches(text: string, regex: RegExp | null): number {
  if (!regex) {
    return 0;
  }
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const globalRegex = new RegExp(regex.source, flags);
  return text.match(globalRegex)?.length ?? 0;
}

export function buildHighlightSpans(
  text: string,
  query: string,
): HighlightSegment[] {
  const regex = highlightRegexForQuery(query);
  if (!regex) {
    return [{ text, isMatch: false }];
  }
  return text
    .split(regex)
    .map((segment, index) => ({ text: segment, isMatch: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

export function countHighlightMatches(text: string, query: string): number {
  return countRegexMatches(text, highlightRegexForQuery(query));
}

export function searchInSegments(
  segments: SearchableSegment[],
  query: string,
): SearchMatchLocation[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return [];
  }
  const regex = highlightRegexForQuery(query);

  const matches: SearchMatchLocation[] = [];
  segments.forEach((segment, segmentIndex) => {
    if (!matchesAllTokens(segment.text, tokens)) {
      return;
    }
    const occurrenceCount = countRegexMatches(segment.text, regex);
    for (let occurrenceIndex = 0; occurrenceIndex < occurrenceCount; occurrenceIndex += 1) {
      matches.push({
        segmentId: segment.id,
        segmentIndex,
        occurrenceIndex,
      });
    }
  });
  return matches;
}
