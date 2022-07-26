import page from "./page.js";
import {URL} from "url";
import normalizeUrl from "normalize-url";

export default function (domain, options, done) {
    // const url = `http://${domain}/`;
    const url = domain

  page(url, (err, icons, baseUrl) => {
      // if (err) return null
    if (err) return done(err);

    icons.forEach((icon) => {
      const url = new URL(icon.src, baseUrl);
      if (options?.normalizeUrl) {
        icon.src = normalizeUrl(url.href, {
          removeQueryParameters: [/.+/],
          stripWWW: false,
        });
      } else {
        icon.src = url.href;
      }
    });

    const data = {
      domain,
      icons,
    };

      return done(null, data);
      // return data;
  });
};
