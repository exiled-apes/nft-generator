const weighted = require("weighted");
const { isEqual, cloneDeep } = require("lodash");
const fsExtra = require("fs-extra");

const settings = require("../settings");
const conflicts = require(`../outputs/${settings.build.sourceName}-conflicts.json`);
const sourceName = `${settings.build.sourceName}`;
const outputFolder = `./outputs`;
const layers = require(`.${outputFolder}/${sourceName}-layers.json`);
const traitCountPath = `${outputFolder}/${sourceName}-trait-count.csv`;
const outputPath = `${outputFolder}/${sourceName}`;

// Generate Traits
const list = [];

// Helper functions
const CATEGORY_KEYS = Object.keys(layers).filter((layer) => {
  return !["_pairs"].includes(layer);
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
    newRow[categoryKey] = chooseOne(categoryKey);
  });

  const hasDuplicate = list.find((existingImage) => {
    const matches = isEqual(existingImage, newRow);
    return matches;
  });

  let hasConflict = false;
  const checkValidCategoryAndValue = (category, value) =>
    !!newRow[category] &&
    !!(layers[category] || []).find((x) => x.id === value);

  for (const [categoryA, valueA, categoryB, valueB] of conflicts) {
    if (!checkValidCategoryAndValue(categoryA, valueA)) {
      throw Error(`Bad conflict ${categoryA} - ${valueA}`);
    }
    if (!checkValidCategoryAndValue(categoryB, valueB)) {
      throw Error(`Bad conflict ${categoryB} - ${valueB}`);
    }

    if (newRow[categoryA] === valueA && newRow[categoryB] === valueB) {
      console.log(categoryA, valueA, categoryB, valueB);
      hasConflict = true;
    }
  }

  if (hasDuplicate || hasConflict) {
    console.log(hasConflict ? "Found conflict" : "Found duplicate");
    const tryAgain = await createNewRow(index);
    console.log("tryAgain", tryAgain);
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

    let csv = "Category,Value,Count\n";
    for (let [values, count] of Object.entries(traitCounts)) {
      const [category, value] = values.split(".");
      csv += `${category},${value},${count}\n`;
    }

    await fsExtra.outputFile(traitCountPath, csv);

    const finalMeta = [];
    for (let i = 0; i < list.length; i++) {
      const meta = generateMeta(i);
      finalMeta.push(meta);
      await fsExtra.outputFile(`${outputPath}/${i}.json`, toStr(meta));
    }
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

  if (settings.isSolana) {
    meta.properties.files = [{ uri: `${index}.png`, type: "image/png" }];
  } else {
    delete meta.properties;
  }
  meta.name += ` #${index}`;
  meta.image = `${index}.png`;
  return meta;
}

async function main() {
  // Delete any old files
  await fsExtra.emptyDir(outputPath);

  // Create Meta
  await createMeta();
}

main()
  .then(() => {
    console.log("Meta created");
  })
  .catch((err) => {
    console.error("Error", err);
  });
