/**
 * Copyright (c) 2020 Oracle and/or its affiliates. All rights reserved.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
  * This file contains a number of utility methods used to obtain data
  * from the server using the ContentSDK JavaScript Library.
  */

/**
 * Fetch the taxonomies for the channel set in the delivery client.
 *
 * @param {object} client - the delivery client
 * @returns {*} - taxonomies for the channel
 */
export function fetchTaxonomies(client) {
  return client.getTaxonomies().then((topLevelItem) => topLevelItem);
}

/**
 * Fetch the categories for the specified taxonomyId.
 *
 * @param {object} client - the delivery client
 * @param {string} taxonomyId - the id of the taxonomy for which the categories are desired
 * @returns {*} - categories for the specified taxonomyId
 */
export function fetchCategories(client, taxonomyId) {
  return client. // SEE TUTORIAL
    id: `${taxonomyId}`,
  }).then((topLevelItem) => topLevelItem);
}

/**
 * Fetch the items that belong to the category whose id is specified.
 *
 * @param {object} client - the delivery client
 * @param {string} categoryId - the id of the category for which items are to be fetched
 * @param {boolean} limit - whether a limit of 4 needs to be applieds
 * @returns {*} - items that belong to the category
 */
export function fetchItemsForCategory(client, categoryId, limit) {
  return client.getItems({
    "q": , // SEE TUTORIAL
    fields: 'all',
    expand: 'all',
    limit: limit ? 4 : 100,
    totalResults: true,
  }).then((topLevelItem) => topLevelItem);
}

/**
 * Retrieve the thumbnail URL for the item specified.
 *
 * @param {DeliveryClient} client - The delivery client which will execute the search
 * @param {String} identifier - the Id of the item whose thumbnail URL is required
 * @returns {String} - the thumbnail URL
 */
export function retrieveThumbnailURL(client, identifier) {
  return client.getItem({
    id: identifier,
    fields: 'all',
    expand: 'all',
  }).then((asset) => {
    let url = null;
    if (asset.fields && asset.fields.renditions) {
      const object = asset.fields.renditions.filter((item) => item.name === 'Thumbnail')[0];
      const format = object.formats.filter((item) => item.format === 'jpg')[0];
      const self = format.links.filter((item) => item.rel === 'self')[0];
      url = self.href;
    }
    return url;
  });
}


/**
 * Retrieve the rendition URLs for the item specified.
 *
 * @param {DeliveryClient} client - The delivery client which will execute the search
 * @param {String} identifier - the Id of the item whose rendition URLs are required
 * @returns {*} - the list rendition URLs
 */
export function retrieveRenditionURLs(client, identifier) {
  return client.getItem({
    id: identifier,
    fields: 'all',
    expand: 'all',
  }).then((asset) => {
    const urls = {};
    if (asset.fields && asset.fields.renditions) {
      asset.fields.renditions.forEach((rendition) => {
        const { name } = rendition;
        const format = rendition.formats.filter((item) => item.format === 'jpg')[0];
        const self = format.links.filter((item) => item.rel === 'self')[0];
        const url = self.href;
        urls[name] = url;
      });
    }
    urls.Native = asset.fields.native.links[0].href;
    return urls;
  });
}

/**
 * Retrieve the rendition url for the item specified
 *
 * @param {DeliveryClient} client - The delivery client which will execute the search
 * @param {String} identifier - the Id of the item whose rendition URL is required
 * @returns {String} - the rendition URL
 */
export function retrieveRenditionURL(client, identifier) {
  const url = client.getRenditionURL({
    id: identifier,
  });
  return Promise.resolve(url);
}
