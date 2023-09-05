const fs = require("fs").promises;

const settings = require("../settings");
const sourceName = `${settings.build.sourceName}`;
const outputFolder = `./outputs`;
const metaPath = `${outputFolder}/${sourceName}/`;

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

async function main() {
  const fileNames = await fs.readdir(metaPath);

  const imageFileNames = fileNames
    .filter((fileName) => fileName.endsWith(".png"))
    .sort(collator.compare);

  const jsonFileNames = fileNames
    .filter((fileName) => fileName.endsWith(".json"))
    .sort(collator.compare);

  let prevFileName = "";

  for (let i = 0; i < jsonFileNames.length; i++) {
    const fileName = Number(jsonFileNames[i].replace(".json", ""));
    console.log("json", fileName);
    if (fileName && fileName - 1 !== prevFileName) {
      throw Error("Wrong filename");
    }
    prevFileName = fileName;
  }

  prevFileName = "";

  for (let i = 0; i < imageFileNames.length; i++) {
    const fileName = Number(imageFileNames[i].replace(".png", ""));
    console.log("image", fileName);
    if (fileName && fileName - 1 !== prevFileName) {
      throw Error("Wrong filename");
    }
    prevFileName = fileName;
  }

  console.log("JSON COUNT", jsonFileNames.length);
  console.log("IMAGE COUNT", imageFileNames.length);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((err) => {
    console.error("Error", err);
  });
