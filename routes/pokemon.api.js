const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const fs = require("fs");
/**
 * params: /
 * description: get all
 * query:
 * method: get
 */

router.get("/", async (req, res, next) => {
  const allowedFilter = ["search", "type", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    let offset = limit * (page - 1);

    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    let result = [];

    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        const temp = result.length ? result : data;
        if (condition === "type") {
          result = temp.filter((pokemon) =>
            pokemon["types"]
              .map((p) => p.toLowerCase())
              .includes(filterQuery[condition].toLowerCase())
          );
        } else if (condition === "search") {
          result = temp.filter(
            (pokemon) => pokemon["name"] === filterQuery[condition]
          );
        }
      });
    } else {
      result = data;
    }

    result = result.slice(offset, offset + limit);

    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flying",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];
router.post("/", (req, res, next) => {
  //post input validation
  try {
    const { name, type1, type2, pages } = req.body;
    if (!name || !type1 || !type2 || !pages) {
      const exception = new Error(`Missing body info`);
      exception.statusCode = 401;
      throw exception;
    }
    if ((!type1 || !type2).includes(pokemonTypes)) {
      const exception = new Error(`Pokémon's type is invalid!`);
      exception.statusCode = 401;
      throw exception;
    }
    const newPokemon = {
      name,
      type1,
      type2,
      pages: parseInt(pages) || 1,
      id: crypto.randomBytes(4).toString("hex"),
    };
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    //Add new book to book JS object
    data.push(newPokemon);
    //Add new book to db JS object
    db.data = data;
    //db JSobject to JSON string
    db = JSON.stringify(db);
    //write and save to db.json
    fs.writeFileSync("pokemons.json", db);

    //post send response
    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

router.get("/:pokemonId", (req, res, next) => {
  try {
    const { pokemonId } = req.params;

    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    const targetIndex = data.findIndex((pokemon) => pokemon.id === pokemonId);

    // db.data[targetIndex] = data.filter((pokemon) => pokemon.id === pokemonId);

    // db = JSON.stringify(db);

    // fs.writeFileSync("db.json", db);
    console.log(targetIndex);

    res.status(200).send(pokemonId);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
