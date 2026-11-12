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

export function buildHighlightSpans(
  text: string,
  query: string,
): HighlightSegment[] {
  const tokens = tokenizeQuery(query);
  const regex = buildHighlightRegex(tokens);
  if (!regex) {
    return [{ text, isMatch: false }];
  }
  return text
    .split(regex)
    .map((segment, index) => ({ text: segment, isMatch: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

export function countHighlightMatches(text: string, query: string): number {
  const tokens = tokenizeQuery(query);
  const regex = buildHighlightRegex(tokens);
  if (!regex) {
    return 0;
  }
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const globalRegex = new RegExp(regex.source, flags);
  return text.match(globalRegex)?.length ?? 0;
}

export function searchInSegments(
  segments: SearchableSegment[],
  query: string,
): SearchMatchLocation[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return [];
  }

  const matches: SearchMatchLocation[] = [];
  segments.forEach((segment, segmentIndex) => {
    if (!matchesAllTokens(segment.text, tokens)) {
      return;
    }
    const occurrenceCount = countHighlightMatches(segment.text, query);
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
