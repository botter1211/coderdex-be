// const fs = require("fs");
const csv = require("csvtojson");
const fs = require("fs");

const createPokemon = async () => {
  let newData = await csv().fromFile("./pokemon.csv");
  let data = JSON.parse(fs.readFileSync("./pokemons.json"));
  newData = newData.map((e, index) => {
    if (e.Type2) {
      return {
        id: index + 1,
        name: e.Name,
        types: Array(e.Type1.toLowerCase(), e.Type2.toLowerCase()),
        url: `https://coderdex-be-iyjv.onrender.com/${e.Name}.png`,
      };
    } else {
      return {
        id: index + 1,
        name: e.Name,
        types: Array(e.Type1.toLowerCase()),
        url: `https://coderdex-be-iyjv.onrender.com/${e.Name}.png`,
      };
    }
  });
  console.log(newData);
  data.data = newData;
  fs.writeFileSync("./pokemons.json", JSON.stringify(data));
};

createPokemon();
