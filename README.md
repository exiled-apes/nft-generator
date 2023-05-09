# NFT Image Generator

## Setup

```bash
npm install
```

## Usage

1. Checkout the [ART_SPEC.md](./ART_SPEC.md) for info on how to structure your raw assets.
2. Place your properly structured assets in the `inputs` folder.
3. Edit the [settings.js](./settings.js) file and make sure that file is correctly configured for your specific project.
4. Run `npm run createAll`

## Commands

```bash
npm run createAll

# createAll runs all these commands in order
# They can be ran individually for debugging
npm run createLayers
npm run createMeta
npm run createImages

# after your output has been generated you can run this command to double check things were generated correctly
npm run verifyAssets
```
