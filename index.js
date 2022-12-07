const rc = new RingCentral.SDK({
  server,
  clientId,
});
const platform = rc.platform();
const redirectUri = window.location.origin + window.location.pathname;
const urlSearchParams = new URLSearchParams(
  new URL(window.location.href).search
);
const code = urlSearchParams.get('code');
if (code === null) {
  const someBytes = randomBytes(32);
  const codeVerifier = buffer2string(someBytes);
  localforage.setItem('codeVerifier', codeVerifier).then(() => {
    // login
    const loginUrl = platform.loginUrl({
      redirectUri,
      code_challenge_method: 'S256',
      code_challenge: buffer2string(
        crypto.subtle.digest('SHA-256', someBytes)
      ),
    });
    const link = document.createElement('a');
    link.href = loginUrl;
    link.innerText = 'Login';
    document.body.appendChild(link);
  });
} else {
  // exchange code for token
  localforage.getItem('codeVerifier', (err, codeVerifier) => {
    platform
    .login({
      code, 
      redirect_uri: redirectUri, 
      code_verifier: codeVerifier
    })
    .then(r => r.json())
    .then(token => document.write(JSON.stringify(token, null, 2)));
  });
}
