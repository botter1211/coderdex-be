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

router.post("/", (req, res, next) => {
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
  //post input validation
  try {
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    const { id, name, type1, type2, url } = req.body;
    if (!name || !type1 || !url || !id) {
      const exception = new Error(`Missing body info`);
      exception.statusCode = 401;
      throw exception;
    }
    if (!pokemonTypes.includes(type1)) {
      const exception = new Error(`Pokémon's type is invalid!`);
      exception.statusCode = 401;
      throw exception;
    }

    if (type2) {
      if (!pokemonTypes.includes(type1 && type2)) {
        const exception = new Error(`Pokémon's type is invalid!`);
        exception.statusCode = 401;
        throw exception;
      }
    }

    for (let i = 0; i < data.length; i++) {
      if (id === data[i].id || name === data[i].name) {
        const exception = new Error(`The Pokémon is exist.`);
        exception.statusCode = 401;
        throw exception;
      }
    }

    const newPokemon = {
      id,
      name,
      types: type2 ? [type1, type2] : [type1],
      url,
    };

    data.push(newPokemon);

    db.data = data;

    db = JSON.stringify(db);

    fs.writeFileSync("pokemons.json", db);

    //post send response
    res.status(200).send({ data: newPokemon });
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

    const targetIndex = data.findIndex(
      (pokemon) => pokemon.id === parseInt(pokemonId)
    );
    const maxIndex = data.findIndex((pokemon) => pokemon.id === data.length);
    const result = {
      pokemon: data[targetIndex],
      previousPokemon:
        targetIndex === 0 ? data[maxIndex] : data[targetIndex - 1],
      nextPokemon: targetIndex === maxIndex ? data[0] : data[targetIndex + 1],
    };
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
