/* eslint-disable */
const fSystem = require('fs');

const timeStamp = function () {
  const t = new Date();
  return `${t.toDateString()} ${t.toLocaleTimeString()}`;
};

const toS = (o) => JSON.stringify(o, null, 2);
const logRequest = function (req, res, next, fs = fSystem) {
  const text = ['--------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`, ''].join('\n');
  fs.appendFile('logs/request.log', text, () => { });
  console.log(`${req.method} ${req.url}`);
  next();
};

module.exports = logRequest;
