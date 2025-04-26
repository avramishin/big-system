import crypto from 'crypto';

export function integerHash(str: string) {
  return parseInt(
    crypto.createHash('md5').update(str).digest('hex').slice(0, 8),
    16,
  );
}
