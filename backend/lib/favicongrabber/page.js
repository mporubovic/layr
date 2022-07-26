import parallel from "async/parallel.js";
import manifest from "./manifest.js";
import cheerio from "cheerio";
import favicon from "./favicon.js";
import browserconfig from "./browserconfig.js";
import links from "./links.js";
import request from "./request.conf.js"

const grab = (fn, $) => {
  return (cb) => {
    fn($, (err, icons) => {
      cb(err, icons);
    });
  }
};

export default function (url, done) {
  request(url, (err, res, page) => {
    if (err) return done(err);

    // if (res.statusCode !== 200) return done(null, []);
    if (page && typeof page !== 'string' && !(page instanceof String)) return done(null, []);

    const $ = cheerio.load(page, {
      // ignore case for tags and attribute names
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
    });

    $.baseUrl = `${res.request.uri.protocol}//${res.request.uri.hostname}`;

    let icons = links($);

    parallel([
      grab(manifest, $),
      grab(favicon, $),
      grab(browserconfig, $),
    ], (err, results) => {
      // ignore errors
      results.forEach(arr => icons = [...icons, ...arr]);
      icons.sort((a, b) => {
          let sizeA = parseInt(a.sizes?.split("x")[0] ?? 0)
          let sizeB = parseInt(b.sizes?.split("x")[0] ?? 0)
          return sizeB - sizeA
      })
      return done(null, icons, $.baseUrl);
    });
  });
};
