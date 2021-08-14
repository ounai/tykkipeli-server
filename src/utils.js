'use strict';

const fs = require('fs');

module.exports.getRandomInt = max => (
  Math.floor(Math.random() * max)
);

module.exports.getFilenamesInDirectory = (dir, ext = null) => (
  fs.readdirSync(dir).filter(filename => ext === null || filename.endsWith(`.${ext}`))
);

module.exports.currentTimeString = () => {
  const dateTimeFormat = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return dateTimeFormat.format(new Date());
};

