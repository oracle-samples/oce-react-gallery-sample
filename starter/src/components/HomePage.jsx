/**
 * Copyright (c) 2020 Oracle and/or its affiliates. All rights reserved.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import '../style.css';

import React from 'react';
import ReactDOM from 'react-dom';

import Gallery from './Gallery';

import getDeliveryClient from '../scripts/server-config-utils';
import { fetchCategories, fetchTaxonomies } from '../scripts/services';

/**
 * The component responsible for rendering the home page.
 * Fetches the taxonomies first for the channel and then fetches the categories
 * for each taxonomy. It then passes the each category to the Gallery component
 */
export default class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;

    this.state = {
      errorMsg: null,
      loading: true,
      error: false,
      categoriesArray: [],
    };
  }

  /**
   * Fetches the taxonomies first for the channel and then fetches the categories
   * for each taxonomy
   */
  componentDidMount() {
    this.mounted = true;

    // get the client to connect to CEC
    const deliveryClient = getDeliveryClient();

    // get the taxonomies
    let categories = [];
    const self = this;

    fetchTaxonomies(deliveryClient)
      .then((topLevelItem) => {
        // If the top level item was not found, display an error message
        if (!topLevelItem) {
          if (self.mounted) {
            self.setState({
              error: true,
              errorMsg: 'There was an error fetching the taxonomies.',
            });
            return;
          }
        }

        const taxonomyIds = topLevelItem.items.map((taxonomy) => taxonomy.id);
        // If there are no taxonomies, display an error message
        if (taxonomyIds.length === 0) {
          if (self.mounted) {
            self.setState({
              error: true,
              errorMsg: 'There are no published taxonomies in this repository.',
            });
            return;
          }
        }

        // For each taxonomy, fetch the categories and append them to an array
        taxonomyIds.forEach((taxonomyId, index) => {
          fetchCategories(deliveryClient, taxonomyId)
            .then((categoriesTopItem) => {
              categories = categories.concat(categoriesTopItem.items);
              // update the state as you concat the categories.
              if (categories.length !== 0 && self.mounted) {
                self.setState({
                  categoriesArray: categories,
                  loading: false,
                });
              }
              // if there are no categories, set error message accordingly
              if (index === taxonomyIds.length - 1 && categories.length === 0 && self.mounted) {
                self.setState({
                  error: true,
                  errorMsg: 'There are no published categories for taxonomies in this repository.',
                });
              }
            })
            .catch(() => {
              self.setState({ error: true });
            });
        });
      })
      .catch(() => {
        self.setState({ error: true });
      });
  }

  /*
   * Called when the component unmounts.
   */
  componentWillUnmount() {
    this.mounted = false;
  }

  /*
   * Render this component.
   */
  render() {
    const {
      error, loading, errorMsg, categoriesArray,
    } = this.state;

    return (
      <div>
        {/* Render error */}
        {error && (
          <div>
            <div className="error">
              Oops, something went wrong.  Please verify that you have seeded
              data to the server and configured your serverUrl and channelToken.
            </div>
            {errorMsg && (
              <div className="error">{errorMsg}</div>
            )}
          </div>
        )}

        {/* Render loading */}
        {loading && !error && (
          <div class="progress-spinner" />
        )}

        {/* Render data */}
        {!loading && !error && (
          <div>
            <h1 className="heading">Image Gallery</h1>

            <div className="gallerycontainer">
              {/* Iterate through the categories and render the gallery for each */}
              {categoriesArray.map(
                (category) => <Gallery key={category.id} category={category} />,
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

/**
 * Renders the HomePage component in the root
 */
ReactDOM.render(
  <HomePage />,
  document.getElementById('root'),
);
