const build = {
  sourceName: "example-assets", // folder name of correctly formated asset that is in /inputs
  quantity: 999,
};

const PROJECT_NAME = "Example Project";
const SYMBOL = "EXAMPLE";
const CREATORS = [];

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
