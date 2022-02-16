const weighted = require("weighted");
const { isEqual, cloneDeep, random } = require("lodash");
const fs = require("fs").promises;
const fsExtra = require("fs-extra");

const settings = require("../settings");
const sourceName = `${settings.build.sourceName}`;
const outputFolder = `./outputs`;
const layers = require(`.${outputFolder}/${sourceName}-layers.json`);
const traitCountPath = `${outputFolder}/${sourceName}-trait-count.json`;
const outputPath = `${outputFolder}/${sourceName}`;

// Generate Traits
const list = [];

// Helper functions
const CATEGORY_KEYS = Object.keys(layers).filter((layer) => {
  return !["_pairs", "_excludes", "_includes"].includes(layer);
});
const getCategoryChoices = (categoryKey) => layers[categoryKey];
const toStr = (json) => JSON.stringify(json, null, 2);

function chooseOne(categoryKey, filterChoices = () => true) {
  const categoryChoices = getCategoryChoices(categoryKey);
  const filteredCategoryChoices = categoryChoices.filter(filterChoices);
  if (!filteredCategoryChoices.length) {
    throw Error(
      `Must have at least one choice for ${categoryKey}. Use 'None.png' if needed`
    );
  }
  const choiceWeights = filteredCategoryChoices.map((x) => x.weight);
  const choiceIds = filteredCategoryChoices.map((x) => x.id);
  const randomWeightedChoice = weighted.select(choiceIds, choiceWeights);
  return randomWeightedChoice;
}

// A recursive function to generate unique combinations
async function createNewRow(index) {
  const newRow = {};
  // For each trait category, select a random trait based on the weightings
  CATEGORY_KEYS.forEach((categoryKey) => {
    const randomWeightedChoice = chooseOne(categoryKey);
    newRow[categoryKey] = randomWeightedChoice;

    // handle _excludes
    const choiceExcludes =
      layers?._excludes?.[categoryKey]?.[
        randomWeightedChoice.replace(/ /g, "_")
      ];
    if (choiceExcludes) {
      Object.entries(choiceExcludes).forEach(
        ([excludeCategory, excludeValues]) => {
          const filterExcludes = (choice) => {
            return !excludeValues.includes(choice.id.replace(/ /g, "_"));
          };
          const retroActiveChoice = chooseOne(excludeCategory, filterExcludes);
          newRow[excludeCategory] = retroActiveChoice;
        }
      );
    }
  });

  const hasDuplicate = list.find((existingImage) => {
    const matches = isEqual(existingImage, newRow);
    return matches;
  });

  if (hasDuplicate) {
    console.log("Found duplicate regenerating");
    const tryAgain = await createNewRow(index);
    return tryAgain;
  } else {
    return newRow;
  }
}

async function createMeta() {
  // Generate the unique combinations based on trait weightings
  for (let i = 0; i < settings.build.quantity; i++) {
    const newRow = await createNewRow(i);
    list.push(newRow);
  }
  // add tokenId
  for (let i = 0; i < list.length; i++) {
    list.tokenId = i;
  }
}

function generateMeta(index) {
  const image = list[index];
  const meta = cloneDeep(settings.meta);

  // add attributes
  CATEGORY_KEYS.forEach((layerKey) => {
    const nextAttribute = {
      trait_type: layerKey.replace(/_/g, " "),
      value: image[layerKey].replace(/_/g, " "),
    };
    meta.attributes.push(nextAttribute);
  });

  meta.properties.files = [{ uri: `${index}.png`, type: "image/png" }];
  meta.name += ` #${index}`;
  meta.image = `${index}.png`;
  return meta;
}

// Returns true if all images are unique
// Test: list.push(list[0]);
function listAreUnique() {
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < list.length; j++) {
      if (j !== i) {
        const areEqual = isEqual(list[i], list[j]);
        if (areEqual) return false;
      }
    }
  }
  return true;
}

async function main() {
  // Delete any old files
  await fsExtra.emptyDir(outputPath);

  // Create Meta
  await createMeta();

  // Double check all images are unique
  if (listAreUnique()) {
    console.log("All images are unique");
  } else {
    console.log("Duplicate images found");
    process.exit(1);
  }

  // Get trait counts
  const traitCounts = {};
  for (let i = 0; i < list.length; i++) {
    const image = list[i];
    CATEGORY_KEYS.forEach((layerKey) => {
      const masterKey = `${layerKey}.${image[layerKey]}`;
      if (!traitCounts[masterKey]) traitCounts[masterKey] = 0;
      traitCounts[masterKey] += 1;
    });
  }
  await fs.writeFile(traitCountPath, toStr(traitCounts));

  const finalMeta = [];
  for (let i = 0; i < list.length; i++) {
    const meta = generateMeta(i);
    finalMeta.push(meta);
    await fsExtra.outputFile(`${outputPath}/${i}.json`, toStr(meta));
  }
}

main()
  .then(() => {
    console.log("Meta created");
  })
  .catch((err) => {
    console.error("Error", err);
  });
