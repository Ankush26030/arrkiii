const { Schema, model } = require("mongoose");

const Prefix = new Schema({
  Guild: { type: String, default: null }, // Guild ID, or null for user prefix
  Prefix: { type: String, required: true }, // The current prefix
  oldPrefix: { type: String, default: null }, // Previous prefix, optional
});

module.exports = model("prefix", Prefix);
