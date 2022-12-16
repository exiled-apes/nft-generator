const settings = require("../settings");
const conflicts = require(`./outputs/${settings.sourceName}-conflicts.json`);
const fs = require("fs/promises");

const sourceName = `${settings.build.sourceName}`;

async function main() {
  const fileNames = await fs.readdir(`./outputs/${sourceName}`);
  const jsonFiles = fileNames.filter((x) => x.endsWith(".json"));

  for (const fileName of jsonFiles) {
    const fileData = await fs.readFile(`./outputs/${sourceName}/${fileName}`);
    const attributes = JSON.parse(fileData).attributes;

    for (const [_categoryA, _valueA, _categoryB, _valueB] of conflicts) {
      const categoryA = _categoryA.replace(/_/g, " ");
      const valueA = _valueA.replace(/_/g, " ");
      const categoryB = _categoryB.replace(/_/g, " ");
      const valueB = _valueB.replace(/_/g, " ");

      const hasConflictA = attributes.find(
        (x) => x.trait_type === categoryA && x.value === valueA
      );
      const hasConflictB = attributes.find(
        (x) => x.trait_type === categoryB && x.value === valueB
      );

      if (hasConflictA && hasConflictB) {
        const conflictList = [categoryA, valueA, categoryB, valueB].join(", ");
        throw Error(`Mismatch ${fileName} - ${conflictList}`);
      }
    }
  }
}

main();
