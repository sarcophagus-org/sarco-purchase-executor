# SARCO Purchase Executor

Enable trustless swap between USDC and SARCO.

Once deployed, send total sum (of all customers' future purchases) of SARCO tokens to the contract, then a customer can make the first purchase.

All USDC received is forwarded directly into the Sarcophagus Aragon DAO (https://client.aragon.org/#/sarcophagus).

## Local Setup and Testing

```sh
$ nvm use

$ npm install

$ cp .env.example .env
# testing uses a forked mainnet, so fill in MAINNET_PROVIDER with a valid (Alchemy) mainnet node URL

$ npm run test
```
