const settings = require("../settings");
const fs = require("fs").promises;
const fsExtra = require("fs-extra");
const { to } = require("await-to-js");

const sourceName = `${settings.build.sourceName}`;
const outputName = `${sourceName}`;
const inputFolder = `./inputs`;
const outputFolder = `./outputs`;
const inputPath = `${inputFolder}/${sourceName}`;
const outputPath = `${outputFolder}/${outputName}-layers.json`;

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

async function main() {
  const dirs = await fs.readdir(inputPath, { withFileTypes: true });
  const checkFolderNameErrors = (folderName) => {
    const isSpecialFolder = folderName[0] === "_";
    if (folderName[0] === " ") {
      throw Error(`Cant have whitespace in folder name ${folderName}`);
    }
    if (folderName[folderName.length - 1] === " ") {
      throw Error(`Cant have whitespace in folder name ${folderName}`);
    }
    const nameArray = folderName.split("-");
    if (nameArray.length !== 2 && !isSpecialFolder) {
      throw Error(
        `Issue with folder name ${name}. Incorrect number of arguments.`
      );
    }
    const [index, name] = nameArray;
    if (isNaN(Number(index)) && !isSpecialFolder) {
      throw Error(`Issue with folder name ${name}. Missing index.`);
    }
    if (!name?.length && !isSpecialFolder) {
      throw Error(`Issue with folder name ${name}. Missing name.`);
    }
    return folderName;
  };
  const folderNames = dirs
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .map(checkFolderNameErrors)
    .sort(collator.compare);

  const traits = {
    _pairs: {},
  };

  for (let i = 0; i < folderNames.length; i++) {
    const folderName = folderNames[i];
    const categoryPath = `${inputPath}/${folderName}`;
    const fileNames = await fs.readdir(categoryPath);
    const checkFileNameErrors = (fileName) => {
      const isSpecialFolder = folderName[0] === "_";
      if (fileName[0] === " ") {
        throw Error(`Cant have whitespace in file name ${fileName}`);
      }
      if (fileName[fileName.length - 1] === " ") {
        throw Error(`Cant have whitespace in file name ${fileName}`);
      }
      const nameArray = fileName.split("-");
      if (nameArray.length !== 2 && !isSpecialFolder) {
        throw Error(
          `Issue with folder name ${name}. Incorrect number of arguments.`
        );
      }
      const [weight, name] = nameArray;
      if (isNaN(Number(weight)) && !isSpecialFolder) {
        throw Error(`Issue with folder name ${name}. Missing weight.`);
      }
      if (!name?.length && !isSpecialFolder) {
        throw Error(`Issue with folder name ${name}. Missing name.`);
      }
      return fileName;
    };
    const visibleFileNames = fileNames
      .filter((fileName) => {
        const isHiddenFile = fileName[0] === ".";
        if (isHiddenFile) {
          console.warn(`Hidden file found ${fileName} ignoring`);
        }
        return !isHiddenFile;
      })
      .map(checkFileNameErrors);

    switch (folderName) {
      case "_pairs":
        const _pairs = {};
        visibleFileNames.forEach((fileName) => {
          const [layerIndex, category, value] = fileName
            .replace(".png", "")
            .split("-");
          if (!_pairs[category]) _pairs[category] = {};
          const filePath = `${inputPath}/${folderName}/${fileName}`;
          _pairs[category][value] = { filePath, layerIndex };
        });
        traits._pairs = _pairs;
        break;
      default:
        const [, key] = folderName.split("-");
        traits[key] = [];
        visibleFileNames.forEach((fileName) => {
          const [weightStr, name] = fileName.split("-");
          const weight = Number((Number(weightStr) / 100).toFixed(3));
          const id = name.replace(".png", "").replace(/_/g, " ");
          const path = `${folderName}/${fileName}`;
          traits[key].push({ id, weight, path });
        });
        break;
    }
  }

  const layers = JSON.stringify(traits, null, 2);
  await fsExtra.outputFile(outputPath, layers);

  const [error, conflictsRaw] = await to(
    fs.readFile(`./inputs/${settings.build.sourceName}/_conflicts.csv`)
  );

  let conflictsJson = [];
  if (conflictsRaw) {
    const conflicts = conflictsRaw.toString();
    const conflictsFormatted = conflicts
      .split("\n")
      .slice(1)
      .filter((x) => x);
    for (conflict of conflictsFormatted) {
      const [categoryA, valueA, categoryB, valueB] = conflict.split(",");
      conflictsJson.push([categoryA, valueA, categoryB, valueB]);
    }
  }

  await fsExtra.outputFile(
    `./outputs/${settings.build.sourceName}-conflicts.json`,
    JSON.stringify(conflictsJson, null, 2)
  );
}

main()
  .then(() => {
    console.log("Layers created");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
