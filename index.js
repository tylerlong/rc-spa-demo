import Subscriptions from "@ringcentral/subscriptions";
import RingCentral from '@ringcentral/sdk'
import localforage from 'localforage';

const rc = new RingCentral({
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
  const loginUrl = platform.loginUrl({
    redirectUri, 
    usePKCE: true,
  });
  localforage.setItem('codeVerifier', platform.codeVerifier).then(() => {
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
      .then(token => document.write('<pre>' + JSON.stringify(token, null, 2) + '</pre>'));

  // make API call
  platform.get('/restapi/v1.0/account/~/extension/~')
  .then(r => r.json())
  .then(ext => {
      document.write(`<p>Your extension ID is ${ext.id}</p>`);
      // subscription
      const subscriptions = new Subscriptions({
        sdk: rc
      });

      // first subscription
      const subscription = subscriptions.createSubscription();
      // subscription.on(subscription.events.notification, (evt) => {
      //   console.log(JSON.stringify(evt, null, 2));
      // });
      subscription
        .setEventFilters([
          '/restapi/v1.0/account/~/presence?detailedTelephonyState=true&sipData=true', 
          '/restapi/v1.0/glip/posts', 
          '/restapi/v1.0/account/~/telephony/sessions'
        ])
        .register()
        .then(() => {
          console.log('first sub');
          platform.get('/restapi/v1.0/subscription')
          .then(r => r.json()).then(subs => {
            console.log(JSON.stringify(subs, null, 2));
          })
        });

      // second subscription
      const subscription2 = subscriptions.createSubscription();
      // subscription2.on(subscription2.events.notification, (evt) => {
      //   console.log(typeof evt);
      //   console.log(JSON.stringify(evt, null, 2));
      // });
      subscription2
      .setEventFilters([
        '/restapi/v1.0/account/~/extension/~/message-store', 
      ])
      .register()
      .then(() => {
        // trigger a message
        // platform.post('/restapi/v1.0/account/~/extension/~/company-pager', {
        //   from: {extensionId: ext.id},
        //   to: [{extensionId: ext.id}],
        //   text: 'Hello world!',
        // });
        console.log("Created subscription2 with 1 event filter");
      });

      setTimeout(() => {
        platform.get('/restapi/v1.0/subscription')
        .then(r => r.json()).then(subs => {
          console.log(JSON.stringify(subs, null, 2));
        })
      }, 10000);
    });
  });
}
