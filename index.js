const rp = require('request-promise');
const cheerio = require('cheerio');
const options = {
  uri: `http://www.espncricinfo.com/scores/series/8048/season/2018/ipl`,
  transform: function(body) {
    return cheerio.load(body);
  },
};

async function updateScores(scoreUrl) {
  console.log('fetching for ' + scoreUrl);
  const dt = await rp({
    uri: `http://www.espncricinfo.com` + scoreUrl,
    transform: (body) => cheerio.load(body),
  });
  const data = [];
  dt(
    '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:first-child a',
  ).each((_, e) => data.push(e.attribs.title));
  dt(
    '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:nth-child(5)',
  ).each((_, e) => data.push(e.children[0].data));
  dt(
    '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:last-child',
  ).each((_, e) => data.push(e.children[0].data));
  console.log({
    [data[0]]: { points: data[2], nrr: data[4] },
    [data[1]]: { points: data[3], nrr: data[5] },
  });
  // scores.push({
  //   [data[0]]: { points: data[2], nrr: data[4] },
  //   [data[1]]: { points: data[3], nrr: data[5] },
  // });
  // console.log(scores);
}
const scores = [];
rp(options).then(($) => {
  $('li:first-child a.cscore_button')
    .map((_, b) => b.attribs.href)
    .get()
    .filter((_, i) => i < 9)
    .forEach((scoreUrl) => {
      rp({
        uri: `http://www.espncricinfo.com` + scoreUrl,
        transform: (body) => cheerio.load(body),
      }).then((dt) => {
        const data = [];
        dt(
          '#gp-inning-00 > div.scorecard-section.batsmen > div:nth-last-child(3) > div > div:nth-child(2)',
        ).each((_, e) => data.push(e.children[0].data));
        console.log(data);
        // dt(
        //   '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:nth-child(5)',
        // ).each((_, e) => data.push(e.children[0].data));
        // dt(
        //   '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:last-child',
        // ).each((_, e) => data.push(e.children[0].data));
        // console.log({
        //   [data[0]]: { points: data[2], nrr: data[4] },
        //   [data[1]]: { points: data[3], nrr: data[5] },
        // });
      });
    });
});
