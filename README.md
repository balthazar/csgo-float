# csgo-float

> Retrieve CS:GO float values in Node.JS

    npm i -S csgo-float
    
#### Usage

###### Client

    new FloatClient(clientAuth, debug)

`clientAuth` {Object} SteamUser credentials to login

`debug` {Boolean} Print some useful informations

    const client = new FloatClient({
      account_name: 'yeah',
      password: 'this-is',
      auth_code: 'definitely',
      sha_sentryfile: 'right'
    }, true)
    
###### Methods

    client.requestFloat(url)
    
Returns a Promise.
    
Where url is a string formatted like `S76561198190349706A4757476613D16467978012840927110`.

    client.requestFloat('S76561198190349706A4757476613D16467978012840927110')
      .then(floatValue => {
        console.log(floatValue)
      })
      .catch(err => {
        console.log(err)
      })
    
###### Events

`ready` Emitted once the client is ready to receive float requests

`sentry` The user is authenticated and the account sentry is sent, should be saved somewhere

`error` Once an error is triggered
