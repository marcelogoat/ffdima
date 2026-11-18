const requestHandler = require('../servir.cjs');

module.exports = (req, res) => {
  return requestHandler(req, res);
};
