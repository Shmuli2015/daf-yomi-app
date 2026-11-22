import {
  plainChavrutaSearchText,
  plainSteinsaltzSearchText,
} from '../readerSearchText';

describe('readerSearchText', () => {
  it('strips steinsaltz emphasis markers from searchable text', () => {
    expect(plainSteinsaltzSearchText('**משנה** מאימתי קורין')).toBe('משנה מאימתי קורין');
  });

  it('fixes embedded hebrew digit typos in steinsaltz searchable text', () => {
    expect(plainSteinsaltzSearchText('**איכא נמי** [יש גם כ8ן]')).toBe('איכא נמי [יש גם כן]');
  });

  it('strips chavruta emphasis markers from searchable text', () => {
    expect(plainChavrutaSearchText('**מאימתי קורין** את שמע')).toBe('מאימתי קורין את שמע');
  });
});
