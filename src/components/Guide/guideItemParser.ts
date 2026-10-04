const LEAD_SEPARATOR = ': ';
const MAX_LEAD_LENGTH = 56;
const WRAPPED_LEAD_PATTERN = /^(\*\*[^*]+\*\*|\[\[[^\]]+\]\])$/;

export interface GuideItemParts {
  lead: string | null;
  body: string;
}

function countOccurrences(text: string, fragment: string): number {
  return text.split(fragment).length - 1;
}

function hasBalancedMarkers(text: string): boolean {
  return (
    countOccurrences(text, '**') % 2 === 0 &&
    countOccurrences(text, '[[') === countOccurrences(text, ']]')
  );
}

function unwrapLead(rawLead: string): string {
  return WRAPPED_LEAD_PATTERN.test(rawLead) ? rawLead.slice(2, -2) : rawLead;
}

export function splitLeadFromBody(item: string): GuideItemParts {
  const separatorIndex = item.indexOf(LEAD_SEPARATOR);
  if (separatorIndex <= 0) return { lead: null, body: item };

  const rawLead = item.slice(0, separatorIndex).trim();
  const isLeadCandidate =
    rawLead.length <= MAX_LEAD_LENGTH && !/[.,]/.test(rawLead) && hasBalancedMarkers(rawLead);
  if (!isLeadCandidate) return { lead: null, body: item };

  return {
    lead: unwrapLead(rawLead),
    body: item.slice(separatorIndex + LEAD_SEPARATOR.length).trim(),
  };
}
