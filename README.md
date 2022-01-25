# Image Generator

## Setup

```bash
yarn install
```

## Usage

Checkout the [ART_SPEC.md](./ART_SPEC.md) for info on how to structure your raw assets.

Then got to [settings.js](./settings.js) and make sure that file is correctly configured for your specific project.

```bash
yarn createAll

# createAll runs all these commands in order
# They can be ran individually for debugging
yarn createLayers
yarn createMeta
yarn createImages

# after your output has been generated you can run this command to double check things were generated correctly
yarn verifyAssets
```
