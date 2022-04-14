const fs = require("fs").promises;
const fsExtra = require("fs-extra");
const sharp = require("sharp");

const settings = require("../settings");
const sourceName = `${settings.build.sourceName}`;
const sourcePath = `./inputs/${settings.build.sourceName}`;
const outputFolder = `./outputs`;
const metaPath = `${outputFolder}/${sourceName}/`;
const layers = require(`.${outputFolder}/${sourceName}-layers.json`);
const outputPath = `${outputFolder}/${sourceName}`;
let metaList = null;

async function generateImage(index) {
  const attributes = metaList[index].attributes;
  const imageArray = attributes.map(({ trait_type, value }) => {
    const traitTypeSnakeCase = trait_type.replace(/ /g, "_");
    const layer = layers[traitTypeSnakeCase].find(
      (layer) => layer.id === value
    );
    const path = `${sourcePath}/${layer.path}`;
    return path;
  });

  // insert image pairs
  let offset = 0;
  attributes.forEach(({ trait_type, value }) => {
    const traitTypeSnakeCase = trait_type.replace(/ /g, "_");
    const valueSnakeCase = value.replace(/ /g, "_");
    const imagePair = layers?._pairs?.[traitTypeSnakeCase]?.[valueSnakeCase];
    if (imagePair) {
      console.log("imagePair", trait_type, valueSnakeCase);
      const insertIndex = Number(imagePair.layerIndex) + offset;
      imageArray.splice(insertIndex, 0, imagePair.filePath);
      offset = offset + 1;
    }
  }, []);

  const composite = imageArray.slice(1).map((input) => ({ input }));
  await sharp(imageArray[0])
    .composite(composite)
    .toFile(`${outputPath}/${index}.png`);
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

async function createImages() {
  const fileNames = await fs.readdir(metaPath);
  const sortedJsonFiles = fileNames
    .filter((fileName) => fileName.endsWith(".json"))
    .sort(collator.compare);
  const metaPromises = sortedJsonFiles.map((fileName) =>
    fs.readFile(`${outputPath}/${fileName}`)
  );
  const results = await Promise.all(metaPromises);
  metaList = results.map((result) => {
    const data = JSON.parse(result);
    return data;
  });

  const bucketSize = 10;
  const bucketCount = Math.ceil(metaList.length / bucketSize);

  for (let i = 0; i < bucketCount; i++) {
    const startIndex = i * bucketSize;
    const bucketIndices = new Array(10)
      .fill(null)
      .map((_, index) => startIndex + index)
      .filter((x) => x < metaList.length);
    console.log(bucketIndices);
    const promises = bucketIndices.map((index) => generateImage(index));
    await Promise.all(promises);
  }
}

async function main() {
  // Delete any old images
  const fileNames = await fs.readdir(metaPath);
  const imageFileNames = fileNames.filter((fileName) =>
    fileName.endsWith(".png")
  );
  const removePromises = imageFileNames.map((fileName) => {
    const path = `${outputPath}/${fileName}`;
    return fsExtra.remove(path);
  });
  await Promise.all(removePromises);

  // Create images
  await createImages();
}

const startTime = new Date().getTime();
main()
  .then(() => {
    const endTime = new Date().getTime();
    console.log("Images created");
    console.log("startTime", startTime);
    console.log("endTime", endTime);
    const totalMinutes = Math.floor((endTime - startTime) / 1000 / 60);
    console.log("totalMinutes", totalMinutes);
  })
  .catch((err) => {
    console.error("Error", err);
  });
