const settings = require("../settings");
const fs = require("fs").promises;
const fsExtra = require("fs-extra");

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
    _excludes: {},
    _includes: {},
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
      case "_excludes":
        const _excludes = {};
        visibleFileNames.forEach((fileName) => {
          const [categoryA, valueA, categoryB, valueB] = fileName
            .replace(".png", "")
            .split("-");
          if (!_excludes[categoryA]) _excludes[categoryA] = {};
          if (!_excludes[categoryA][valueA]) _excludes[categoryA][valueA] = {};
          if (!_excludes[categoryA][valueA][categoryB]) {
            _excludes[categoryA][valueA][categoryB] = [];
          }
          _excludes[categoryA][valueA][categoryB].push(valueB);
        });
        traits._excludes = _excludes;
        break;
      case "_includes":
        const _includes = {};
        traits._includes = _includes;
        break;
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

  console.log(traits._pairs);
  console.log(traits._excludes);
  console.log(traits._includes);
  const layers = JSON.stringify(traits, null, 2);
  await fsExtra.outputFile(outputPath, layers);
}

main()
  .then(() => {
    console.log("Layers created");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
