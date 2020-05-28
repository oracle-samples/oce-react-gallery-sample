/**
 * Copyright (c) 2020 Oracle and/or its affiliates. All rights reserved.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import GalleryItem from './GalleryItem';
import placeholder from '../assets/watermark_digital_assets.png';

import getDeliveryClient from '../scripts/server-config-utils';
import { fetchItemsForCategory, retrieveThumbnailURL } from '../scripts/services';

/**
 * This component renders the gallery for each category and also displays the
 * name of the category and the number of items belonging to the category.
 * This component is called from the HomePage component. It fetches at max 4
 * items for each category and then for each item, it retrieves the thumbnail.
 * Once all the thumbnails are retrieved, it calls the GalleryItem component
 * for each thumbnail to render it.
 *
 * @param category the category of the items to display
 */
export default class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;

    this.state = {
      category: {},
      imagesArray: [],
      totalResults: 0,
    };
  }

  /**
   * Fetches four items for each category and then retrieves their thumbnails
   */
  componentDidMount() {
    this.mounted = true;
    const { category } = this.props;
    const imagesData = { src: placeholder, alt: '', classname: 'placeholder' };

    // set the imagesArray with placeholders first so that on initial render
    // the space it occupies is set aside.
    if (this.mounted) {
      this.setState({
        category,
        imagesArray: [imagesData, imagesData, imagesData, imagesData],
      });
    }

    // get the client to connect to CEC
    const deliveryClient = getDeliveryClient();

    // fetch the items for the category
    const self = this;
    // Set the third param to true to indicate limit for the number of results
    fetchItemsForCategory(deliveryClient, category.id, true)
      .then((topLevelItem) => {
        const images = [];
        // Use subset of the array for the gallery. Max of 4 items only
        const itemsLength = topLevelItem.items.length;
        const max = itemsLength > 4 ? 4 : itemsLength;
        const truncatedArr = topLevelItem.items.slice(0, max);
        truncatedArr.forEach((item) => {
          retrieveThumbnailURL(deliveryClient, item.id)
            .then((url) => {
              if (url != null) {
                images.push({ src: url, alt: item.name, classname: 'cover' });
                // once all 4 thumbnails are retrieved, then set the state
                if (images.length === max) {
                  if (self.mounted) {
                    self.setState({
                      imagesArray: images,
                      totalResults: topLevelItem.totalResults,
                    });
                  }
                }
              }
            });
        });
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
    const { category, imagesArray, totalResults } = this.state;

    // For each of the 4 items in the gallery, create a GalleryItem
    return (
      <section>
        <Link
          to={{
            pathname: `/category/${category.id}`,
            search: `?categoryName=${category.name}`,
          }}
          style={{ textDecoration: 'none' }}
        >

          {/* Images for the category */}
          <div className="gallery">
            {imagesArray.map(
              // The array is a list of images, therefore no suitable id for the key
              // eslint-disable-next-line react/no-array-index-key
              (image, i) => <GalleryItem key={i} image={image} />,
            )}
          </div>

          {/* Category Name and total number of items in that category */}
          <div className="caption">
            <h3>{category.name}</h3>
            <h4>
              {totalResults}
              {' '}
              photos
            </h4>
          </div>

        </Link>
      </section>
    );
  }
}

/*
 * Define the "category" object passed into this component.
 */
Gallery.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
};
