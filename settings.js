const build = {
  sourceName: "wombat2", // Name of inputs subfolder that contains your raw assets
  quantity: 20, // How many NFTs would you like to generate? Try a small number for test runs.
};

const IS_SOLANA = true;

// This is the information that will show up in your NFT metadata
const PROJECT_NAME = "Faceless"; // title of your NFT
const DESCRIPTION =
  "In the deepest, darkest levels of the catacombs, one can find groups of curious little creatures known as The Faceless. They often travel in large numbers, attacking as swarms. Nobody has ever seen behind the masks, but legends tell of an unimaginable sight.";

// DONT EDIT ANYTHING BELOW THIS LINE!
const meta = {
  image: "",
  name: PROJECT_NAME,
  description: DESCRIPTION,
  properties: {
    category: "image",
    files: [{ uri: "", type: "image/png" }],
  },
  attributes: [],
};
const settings = { build, meta, isSolana: IS_SOLANA };
module.exports = settings;
