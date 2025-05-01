# rootstock-collective-subgraphs

## Installation

### Pre-requisites

- An account in [The graph](https://thegraph.com/)
- Node version 22.4

### Dependencies

Install all dependencies by running `npm install`.

The project is ready to be used at this point.

## Commands

### Code generation

```sh
npm run codegen
```

### Build

```sh
npm run build
```

### Authorization

Prior deployment we need to setup the authorization key so we can publish our graph.

```sh
npx graph auth <auth_key>
```

### Deployment

```sh
npm run deploy
```
