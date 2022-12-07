window.buffer2string = (s) =>
s
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

window.randomBytes = n => {
  const crypto = (self.crypto || self.msCrypto)
  const QUOTA = 65536;
  const a = new Uint8Array(n);
  for (var i = 0; i < n; i += QUOTA) {
    crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, QUOTA)));
  }
  return a;
}
