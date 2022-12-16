const build = {
  sourceName: "Dedprz", // Name of inputs subfolder that contains your raw assets
  quantity: 100, // How many NFTs would you like to generate? Try a small number for test runs.
};

// This is the information that will show up in your NFT metadata
const PROJECT_NAME = "Example Project"; // title of your NFT
const SYMBOL = "EXAMPLE"; // ticker symbol
const SELLER_FEE_BASIS_POINTS = 500; // Basis points (500 = 5%).This is your royalties setting.
const CREATORS = [
  { address: "AqwcN2rVLNx6Qx4tp4rxgtFPsXMrE7QWRbD72BbeApjb", share: 100 },
]; // Specifies which solana addresses get what percentage of royalties. Limit 4.

// DONT EDIT ANYTHING BELOW THIS LINE!
const meta = {
  image: "",
  name: PROJECT_NAME,
  symbol: SYMBOL,
  collection: { name: PROJECT_NAME, family: PROJECT_NAME },
  attributes: [],
  seller_fee_basis_points: SELLER_FEE_BASIS_POINTS,
  properties: {
    creators: CREATORS,
    files: [{ uri: "", type: "image/png" }],
  },
};
const settings = { build, meta };
module.exports = settings;
