/* eslint-disable no-param-reassign */
/**
 * Copyright (c) 2020, 2021 Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import getDeliveryClient from './server-config-utils';

/**
 * This file contains a number of utility methods used to obtain data
 * from the server using the ContentSDK JavaScript Library.
 */

/* ----------------------------------------------------
 * Common Utils
 * ---------------------------------------------------- */

/*
 * Utility method to log an error.
 */
function logError(message, error) {
  if (error && error.statusMessage) {
    console.log(`${message} : `, error.statusMessage);
  } else if (error.error && error.error.code && error.error.code === 'ETIMEDOUT') {
    console.log(`${message} : `, error);
  } else if (error.error && error.error.code) {
    console.log(`${message} : `, error.error.code);
  } else if (error) {
    console.error(message, error);
  }
}

/**
 * Fetch the items that belong to the category whose id is specified.
 *
 * @param {DeliveryClient} client - he delivery client to get data from OCE content
 * @param {string} categoryId - if of the category whose items are to be obtained
 * @param {boolean} limit - true when only 4 items are to be returned,
 *                          otherwise false to get 100 items
 * @returns {Promise({Object})} - A Promise containing the data
 */
function fetchItemsForCategory(client, categoryId, limit) {
  return client.getItems({
    q: `(taxonomies.categories.nodes.id eq "${categoryId}")`,
    fields: 'all',
    expand: 'all',
    limit: limit ? 4 : 100,
    totalResults: true,
  }).then((topLevelItem) => topLevelItem)
    .catch((error) => logError('Fetching items for category failed', error));
}

/* ----------------------------------------------------
 * APIs to get the data for the Home Page
 * ---------------------------------------------------- */

/**
 * Fetch the categories for the specified taxonomyId.
 *
 * @param {DeliveryClient} client - the delivery client to get data from OCE content
 * @param {string} taxonomyId - the id of the taxonomy whose categories are to be obtained
 * @returns {Promise({Object})} - A Promise containing the data
 */
function fetchCategoriesForTaxonomyId(client, taxonomyId) {
  return client.queryTaxonomyCategories({
    id: `${taxonomyId}`,
  }).then((topLevelItem) => topLevelItem)
    .catch((error) => logError('Fetching categories for taxonomy failed', error));
}

/**
 * Return a list of categories for all of taxonomies.
 *
 * @param {DeliveryClient} client - the delivery client to get data from OCE content
 * @returns {Promise({Object})} - A Promise containing the data
 */
function fetchAllTaxonomiesCategories(client) {
  return client.getTaxonomies()
    .then((topLevelItem) => {
      const taxonomyIds = topLevelItem.items.map((taxonomy) => taxonomy.id);

      const promises = [];
      // loop over each taxonomy id
      taxonomyIds.forEach((taxonomyId) => {
        // add a promise to the total list of promises to get the categories
        // for the specific taxonomy id
        promises.push(
          fetchCategoriesForTaxonomyId(client, taxonomyId)
            .then((categoriesTopItem) => categoriesTopItem.items),
        );
      });

      // execute all the promises returning a single dimension array of all
      // of the categories for all of the taxonomies (note: no taxonomy information)
      // is returned.
      return Promise.all(promises)
        .then((arrayOfCategoryArray) => arrayOfCategoryArray.flat());
    }).catch((error) => logError('Fetching taxonomies failed', error));
}

/**
 * Takes a list of categories, and returns an updated array where each
 * category has an array of its items added to it.
 *
 * @param {DeliveryClient} client - the delivery client to get data from OCE content
 * @param {Array} categories - the list of categories which is to have the items
 *                             for each category added to it
 * @returns {Promise({Object})} - A Promise containing the data
 */
function addItemsToCategories(client, categories) {
  const promises = [];

  // loop over each category
  categories.forEach((category) => {
    // add a promise to the total list of promises to get the items
    // for the specific category
    promises.push(
      fetchItemsForCategory(client, category.id, true)
        .then((topLevelItem) => {
        // add the item to the category before returning it
          category.items = topLevelItem.items;
          category.totalResults = topLevelItem.totalResults;
          // Note: the spread operator is used here so that we return a top level
          // object, rather than a value which contains the object
          // i.e we return
          //   {
          //     field1: 'value', field2 : "value", etc
          //   },
          // rather than
          //   {
          //     name: {
          //             field1: 'value', field2 : "value", etc
          //           }
          //    }
          return {
            ...category,
          };
        }),
    );
  });

  // execute all the promises before returning the data
  return Promise.all(promises)
    .then((arrayOfItems) => arrayOfItems.flat());
}

/**
 * Return the thumbnail URL for the specified item.
 *
 * @param {DeliveryClient} client - the delivery client to get data from OCE content
 * @param {string} identifier - the item id whose thumbnail URL is to be obtained
 * @returns {Promise({Object})} - A Promise containing the data
 */
function retrieveThumbnailURL(client, identifier) {
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
  }).catch((error) => logError('Fetching thumbnail URL failed', error));
}

/**
 * Return the thumbnail URLs for all of the specified items, returning a map
 * of itemId to thumbnail URL.
 *
 * @param {DeliveryClient} client - the delivery client to get data from OCE content
 * @param {Array} items - the array of items whose thumbnail URLs are to be obtained
 * @returns {Promise({Object})} - A Promise containing the data
 */
function fetchItemsThumbnailURLs(client, items) {
  const promises = [];
  // loop over each image
  items.forEach((item) => {
    // add a promise to the total list of promises to get the url
    // for the specific image
    const itemId = item.id;
    promises.push(
      retrieveThumbnailURL(client, itemId)
        .then((url) => ({ itemId, url })),
    );
  });

  // execute all the promises before returning all of the data in a single map
  return Promise.all(promises)
    .then((allUrls) => {
      const flatArray = allUrls.flat();
      const allUrlsMap = new Map(flatArray.map((i) => [i.itemId, i.url]));
      return allUrlsMap;
    });
}

/**
 * Retrieve the rendition URLs for the specified item.
 *
 * @param {DeliveryClient} client - the delivery client to get data from OCE content
 * @param {string} identifier - the item id whose rendition URLs are to be obtained
 * @returns {Promise({Object})} - A Promise containing the data
 */
function retrieveRenditionURLs(client, identifier) {
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
  }).catch((error) => logError('Fetching rendition URLs failed', error));
}

/**
 * Return all the data required for the home page.
 *
 * The data returned is an object containing
 *   a list of categories where each category contains 4 of its items,
 *   a map of item id to thumbnail url.
 *
 * @returns {Promise({Object})} - A Promise containing the data
 */
export function getHomePageData() {
  const deliveryClient = getDeliveryClient();
  // get the categories for all taxonomies then add all the category items to each category
  return fetchAllTaxonomiesCategories(deliveryClient)
    .then((initialCategories) => addItemsToCategories(deliveryClient, initialCategories)
      .then((categories) => {
        // pull out all of the items for all of the categories then get the items thumbnail urls
        const allItems = categories.map((category) => category.items);

        return fetchItemsThumbnailURLs(deliveryClient, allItems.flat())
          .then((itemsThumbnailURLMap) => ({ categories, itemsThumbnailURLMap }));
      }));
}

/* ----------------------------------------------------
 * APIs to get the data for the Image Grid Page
 * ---------------------------------------------------- */

/**
 * Returns all the data required for the Image Grid Page.
 *
 * The data returned contains
 *   count of the total number of categories,
 *   list of category items for the category with all their rendition URLS.
 *
 * @param {Object} client - the delivery client
 * @param {string} categoryId - the id of the category whose items are to be obtained
 * @returns {Promise({Object})} - A Promise containing the data
 */
export function getImageGridPageData(categoryId) {
  const client = getDeliveryClient();

  return fetchItemsForCategory(client, categoryId, false)
    .then((topLevelItem) => {
      const { totalResults } = topLevelItem;
      const promises = [];
      // for each item, retrieve the rendition urls and add it to the item
      topLevelItem.items.forEach((item) => {
        promises.push(
          retrieveRenditionURLs(client, item.id)
            .then((renditionUrls) => {
              item.renditionUrls = renditionUrls;
              // see comment in 'fetchAllCategoryItems' why the spread operator is being used
              return {
                ...item,
              };
            }),
        );
      });

      // execute all the promises before returning the data
      return Promise.all(promises)
        .then((arrayOfItems) => ({
          totalResults,
          items: arrayOfItems.flat(),
        }));
    });
}
