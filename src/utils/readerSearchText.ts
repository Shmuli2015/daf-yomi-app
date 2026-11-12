import {
  parseCommentaryRuns,
  stripEmDash,
  stripSteinsaltzSectionLetters,
} from './commentaryEmphasis';
import { parseChavrutaBodyParts } from './parseChavrutaHtml';

export function plainClassicSearchText(text: string): string {
  return parseCommentaryRuns(stripEmDash(text))
    .map((run) => run.text)
    .join('');
}

export function plainSteinsaltzSearchText(text: string): string {
  return parseCommentaryRuns(stripSteinsaltzSectionLetters(stripEmDash(text)))
    .map((run) => run.text)
    .join('');
}

export function plainChavrutaSearchText(text: string): string {
  return parseChavrutaBodyParts(text)
    .filter((part): part is Extract<typeof part, { kind: 'text' }> => part.kind === 'text')
    .map((part) => part.text)
    .join('');
}
