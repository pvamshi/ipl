//

const Xray = require('x-ray');
const rp = require('request-promise');
const cheerio = require('cheerio');

/**
 **_ Fetches the inner text of the element
 _** and returns the trimmed text
 */
// const fetchElemInnerText = (elem) => (elem.text && elem.text().trim()) || null;

/**
 _ Fetches the specified attribute from the element
 _ and returns the attribute value
 */
// const fetchElemAttribute = (attribute) => (elem) =>
//   (elem.attr && elem.attr(attribute)) || null;

/**
 _ Extract an array of values from a collection of elements
 _ using the extractor function and returns the array
 _ or the return value from calling transform() on array
 
 */
// const extractFromElems = (extractor) => (transform) => (elems) => ($) => {
//   const results = elems.map((i, element) => extractor($(element))).get();
//   return _.isFunction(transform) ? transform(results) : results;
// };

/**
  A composed function that extracts number text from an element,
  sanitizes the number text and returns the parsed integer
 */
// const extractNumber = compose(
//   parseInt,
//   sanitizeNumber,
//   fetchElemInnerText,
// );

/** 
 _ A composed function that extracts url string from the element's attribute(attr)
 _ and returns the url with https scheme
 */
// const extractUrlAttribute = (attr) =>
//   compose(
//     enforceHttpsUrl,
//     fetchElemAttribute(attr),
//   );

const cric24Options = {
  url: `https://www.cricket24.com/india/ipl-2018/results/`,
  transform: (body) => cheerio.load(body),
};

const cricbuzzOptions = {
  url: `https://www.cricbuzz.com/cricket-series/2676/indian-premier-league-2018/matches`,
  transform: (body) => cheerio.load(body),
};

rp(cricbuzzOptions).then(($) => {
  const final = [];
  const a = $('#series-matches')
    .find('a.cb-text-complete')
    .each((_, el) => {
      const url =
        'https://www.cricbuzz.com' +
        el.attribs['href'].replace('cricket-scores', 'live-cricket-scorecard');
      console.log(url);
      rp({ url, transform: (b) => cheerio.load(b) }).then(($$) => {
        const matchTitleText = $$('h1').text();
        const matchTitle = matchTitleText.split(',')[0];
        const matcher = matchTitleText.match(/\d+/);
        let matchNumber = 0;
        if (matcher !== null) {
          matchNumber = matcher[0];
        }
        const text1_1 = $$(
          '#innings_1 > div:nth-child(1) > div:nth-last-child(1) > div',
        )
          .map((_, el2) => ('' + el2.children[0].data).trim())
          .get();
        const text2_1 = $$(
          '#innings_1 > div:nth-child(1) > div:nth-last-child(2) > div',
        )
          .map((_, el2) => ('' + el2.children[0].data).trim())
          .get();

        const text_1 = text2_1[0] === 'Total' ? text2_1 : text1_1;
        const score_1 = text_1[1];
        const overs_1 = text_1[2].split(',')[1].match(/\d+/)[0];
        const text1_2 = $$(
          '#innings_2 > div:nth-child(1) > div:nth-last-child(1) > div',
        )
          .map((_, el2) => ('' + el2.children[0].data).trim())
          .get();
        const text2_2 = $$(
          '#innings_2 > div:nth-child(1) > div:nth-last-child(2) > div',
        )
          .map((_, el2) => ('' + el2.children[0].data).trim())
          .get();

        const text_2 = text2_2[0] === 'Total' ? text2_2 : text1_2;
        const score_2 = text_2[1];
        const overs_2 = text_2[2].split(',')[1].match(/\d+/)[0];
        if (matchNumber !== 0) {
          final[matchNumber] = {
            title: matchTitle,
            score_1: score_1,
            overs_1: overs_1,
            score_2: score_2,
            overs_2: overs_2,
          };
        }
        console.log(final);
      });
    });
});

// const x = Xray();
// x(
//   'https://www.cricbuzz.com/cricket-series/2676/indian-premier-league-2018/matches',
//   '#series-matches',
//   x(
//     ['a.text-hvr-underline@href'],
//     x(
//       'a.cb-nav-tab:nth-child(2)@href',
//       '#innings_1 > div > div:nth-last-child(2)',
//     ),
//   ),
// )((_, matchUrls) => {
//   console.log({ matchUrls });
//   // if (matchUrls) {
//   //   matchUrls
//   //     .map((url) => url.replace('cricket-scores', 'live-cricket-scorecard'))
//   //     .forEach((url) => fetchMatch(url));
//   // }
//   // console.log(Array.isArray(matchUrls));
//   // for (const i = 0; i < matchUrls.length; i++) {
//   //   console.log(matchUrls[i]);
//   // }
//   // matchUrls
//   //   .map((url) => url.replace('cricket-scores', 'live-cricket-scorecard'))
//   //   .forEach(fetchMatch);
// });
// function fetchMatch(url) {
//   console.log({ url });
//   x(url, 'innings_1')(_, (el) => {
//     console.log(el);
//   });
// }
// rp(options).then(($) => {
//   const a = $('table').toArray();
//   console.log(a);
// });

// x('http://google.com', 'title')(function(err, title) {
//   console.log(title); // Google
// });
// rp(options).then(($) => {
//   const table = $('#fs-results > table:nth-child(2)').get()  ;
//   console.log(table);
// $('li:first-child a.cscore_button')
//   .map((_, b) => b.attribs.href)
//   .get()
//   .filter((_, i) => i < 9)
//   .forEach((scoreUrl) => {
//     rp({
//       uri: `http://www.espncricinfo.com` + scoreUrl,
//       transform: (body) => cheerio.load(body),
//     }).then((dt) => {
//       const data = [];
//       dt(
//         '#gp-inning-00 > div.scorecard-section.batsmen > div:nth-last-child(3) > div > div:nth-child(2)',
//       ).each((_, e) => data.push(e.children[0].data));
//       console.log(data);
//       // dt(
//       //   '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:nth-child(5)',
//       // ).each((_, e) => data.push(e.children[0].data));
//       // dt(
//       //   '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:last-child',
//       // ).each((_, e) => data.push(e.children[0].data));
//       // console.log({
//       //   [data[0]]: { points: data[2], nrr: data[4] },
//       //   [data[1]]: { points: data[3], nrr: data[5] },
//       // });
//     });
//   });
// });

// async function updateScores(scoreUrl) {
//   console.log('fetching for ' + scoreUrl);
//   const dt = await rp({
//     uri: `http://www.espncricinfo.com` + scoreUrl,
//     transform: (body) => cheerio.load(body),
//   });
//   const data = [];
//   dt(
//     '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:first-child a',
//   ).each((_, e) => data.push(e.attribs.title));
//   dt(
//     '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:nth-child(5)',
//   ).each((_, e) => data.push(e.children[0].data));
//   dt(
//     '#main-container > div > div.layout-bc > div.col-c > article:nth-child(8) td:last-child',
//   ).each((_, e) => data.push(e.children[0].data));
//   console.log({
//     [data[0]]: { points: data[2], nrr: data[4] },
//     [data[1]]: { points: data[3], nrr: data[5] },
//   });
//   // scores.push({
//   //   [data[0]]: { points: data[2], nrr: data[4] },
//   //   [data[1]]: { points: data[3], nrr: data[5] },
//   // });
//   // console.log(scores);
// }
