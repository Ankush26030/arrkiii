/** @format */

module.exports = (client) => {
  client.numb = (number) => {
    // Make sure we got a number
    if (!number || isNaN(number)) return "0";

    number = Number(number);

    // Choose suffix
    if (number >= 1_000_000_000) {
      return `${(number / 1_000_000_000).toFixed(2)}B`;
    } else if (number >= 1_000_000) {
      return `${(number / 1_000_000).toFixed(2)}M`;
    } else if (number >= 1_000) {
      return `${(number / 1_000).toFixed(2)}K`;
    } else {
      return number.toString();
    }
  };
};