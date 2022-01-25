const { exec } = require("child_process");

const settings = require("../settings.js");
const assetsPath = `./outputs/${settings.build.sourceName}`;

// const index = process.argv?.[2];

function handleOutput(error, stdout, stderr) {
  console.log(stdout);
}

const command = `
#!/bin/bash
set -e # stop script on frist error

# Check for jq
if jq --version > /dev/null 2>&1; then
  echo "👍 Found jq"
else
  echo "⚠️ jq is not installed. Installing..."
  brew install jq
  source ~/.bash_profile
fi

echo ""
echo "check the total number of assets, json and image files confirm these add up."
echo "confirm these numbers are all what you would expect."
echo "metadata files count:"$(find ${assetsPath} -type f -name '*.json' | wc -l)
echo "images files count:"$(find ${assetsPath} -type f -name '*.png' | wc -l)
echo "total number of asset files:"$(find ${assetsPath} -type f  | wc -l)
echo ""
echo "check image and properties.files values:"
echo "make sure your json and file name agree"
echo "0.json should refer to 0.png in the .image and .files props"
echo "1.json should refer to 1.png in the .image and .files props"
echo "2.json should refer to 2.png in the .image and .files props"
echo "etc..."
echo ""
echo "check symbol values:"
find ${assetsPath} -type f -name '*.json' | xargs jq -r '.symbol' | sort | uniq -c
echo ""
echo "check properties.creators:"
echo "this command flattens, then counts the unique properties.creators values in your metadata."
echo "for most projects, you should see a consistent count across all parties (address-[1..3])"
find ${assetsPath} -type f -name '*.json' | xargs jq '.properties.creators' | jq -c '.[] | [.address,.share]' | sort | uniq -c
echo ""
echo "check seller_fee_basis_points:"
echo "this command extends the prior command by extracting the shares & summing them up."
echo "you should expect this to output 100."
find ${assetsPath} -type f -name '*.json' | xargs jq '.properties.creators' | jq -c '.[] | [.address,.share]' | sort | uniq | jq '.[1]' | jq -s 'add'
echo ""
echo "check seller_fee_basis_points (sorted count):"
echo "this command extracts unique seller_fee_basis_points, then sorts and counts them."
echo "for most projects you should see a consistent count across all metadata."
find ${assetsPath} -type f -name '*.json' | xargs jq '.seller_fee_basis_points' | sort | uniq -c
echo ""
echo "check name values:"
echo "this command lists then sorts all of your name values."
echo "for most projects, your just paging through and confirming"
echo "the pattern looks like you'd expect it to."
# echo $(find ${assetsPath} -type f -name '*.json' | xargs jq -r '.name' | sort | cat) # was less
`;

exec(command, handleOutput);
