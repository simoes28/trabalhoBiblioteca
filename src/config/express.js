//Configuração do Express
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const setupExpress = (app) => {
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

module.exports = setupExpress;