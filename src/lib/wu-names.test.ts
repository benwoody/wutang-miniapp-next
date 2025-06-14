import { generateWuTangName } from './wu-names';

describe('generateWuTangName', () => {
  it('returns a string', () => {
    expect(typeof generateWuTangName('testuser')).toBe('string');
  });

  it('returns a consistent name for the same input', () => {
    const name1 = generateWuTangName('testuser');
    const name2 = generateWuTangName('testuser');
    expect(name1).toBe(name2);
  });

  it('returns different names for different inputs', () => {
    const name1 = generateWuTangName('user1');
    const name2 = generateWuTangName('user2');
    expect(name1).not.toBe(name2);
  });
});