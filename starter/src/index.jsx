/**
* Copyright (c) 2020 Oracle and/or its affiliates. All rights reserved.
* Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import './style.css';

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import HomePage from './components/HomePage';
import ImageGrid from './components/ImageGrid';

/**
* Main entry point for the application.
*
* This file uses a Router to determine which Component is loaded into the HTML.
* This enables us to navigate to different areas of the application.
*
* The application displays a list of items from categories in a gallery format
* belonging to taxonomies associated with a particular channel. On clicking a gallery the screen
* changes to display a list of items belonging to that category.
*/
render(
  (
    <Router basename="/samples/oce-react-gallery-sample">
      <Switch>
        <Route exact path="/" component={HomePage} />

        <Route
          exact
          path="/category/:categoryId"
          render={(props) => {
            // List of items for a category
            const params = new URLSearchParams(props.location.search);
            const categoryName = params.get('categoryName');
            return (
              <ImageGrid
                categoryId={props.match.params.categoryId}
                categoryName={categoryName}
              />
            );
          }}
        />
      </Switch>
    </Router>
  ),

  document.getElementById('root'),
);
