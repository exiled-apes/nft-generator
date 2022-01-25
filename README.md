# Image Generator

## Setup

Checkout the [ART_SPEC.md](./ART_SPEC.md) for info on how to structure your raw assets.

```bash
yarn install
```

## Usage

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
