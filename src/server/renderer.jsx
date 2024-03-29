/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
 * Handles the generation of the server generated HTML.
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import serialize from 'serialize-javascript';
import App from '../pages/App';

export default (req, serverData) => {
  // generate the HTML content for this application
  const content = ReactDOMServer.renderToString(
    <StaticRouter location={req.path} basename={process.env.BASE_URL}>
      <App serverData={serverData} />
    </StaticRouter>,
  );
  const helmet = Helmet.renderStatic();

  // if there is a BASE_URL we want the artifacts in the "public" folder to
  // be accessed with a relative URL, otherwise we want an absolute URL
  // this is so http://host:port/routeA or http://host:port/routeA/param/value
  // will get the items from the "public" folder
  const stylesFile = `${process.env.BASE_URL}/styles.css`;
  const favIconFile = `${process.env.BASE_URL}/favicon.png`;
  const clientBundleFile = `${process.env.BASE_URL}/client-bundle.js`;

  // Generate the final HTML content as a full HTML document
  // The body contains:
  // - a relative link to get the stylesheet for the page
  // - serialized data stored in the window (must be before the application content)
  // - the content from the application
  // - a script tag containing a relative link, telling the client to get the client
  //   side JavaScript bundle from the server
  // Note: the server has been set up to serve static content from the "public" directory
  // (see the "app.use" in "server.js").
  return `
    <!DOCTYPE html>
    <html lang="en-us">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Sample gallery app created in React that utilizes the content sdk library">

        <title>Image Gallery - React</title>
        <link rel="icon" href="${favIconFile}" type="image/png">
        <link rel="stylesheet" href="${stylesFile}" type="text/css">
        ${helmet.meta.toString()}
      </head>

      <body>
        <div id="root">${content}</div>
        <script>
          window.INITIAL_DATA = ${serialize(serverData)}
        </script>
        <script src="${clientBundleFile}"></script>
      </body>
    </html>
  `;
};
