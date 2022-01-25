const build = {
  sourceName: "example-assets", // Folder name of correctly formated asset that is in /inputs
  quantity: 10, // How many would you like to generate? Try a small number for test runs
};

// This is the data that will show up in your NFT metadata
const PROJECT_NAME = "Example Project";
const SYMBOL = "EXAMPLE";
const CREATORS = [];

// DONT EDIT ANYTHING BELOW THIS LINE
const meta = {
  image: "",
  name: PROJECT_NAME,
  symbol: SYMBOL,
  collection: { name: PROJECT_NAME, family: PROJECT_NAME },
  attributes: [],
  seller_fee_basis_points: 500, // basis points 500 = 5%
  properties: {
    creators: CREATORS,
    files: [{ uri: "", type: "image/png" }],
  },
};

const settings = { build, meta };

module.exports = settings;
