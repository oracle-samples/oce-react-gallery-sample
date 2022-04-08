/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * This component renders the gallery for each category and also displays the
 * name of the category and the number of items belonging to the category.
 *
 * @param category the category of the items to display
 * @param itemsThumbnailURLMap map of itemID to thumbnail URL
 */
const Gallery = (props) => {
  const { category } = props;
  const { items, totalResults } = category;

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
          {items.map(
            (item, index) => (
              <div key={item.id} className="item fade">
                {item.renditionUrls && (
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={item.renditionUrls.srcset}
                      sizes={index === 0 ? '230px' : '75px'}
                    />
                    <source
                      srcSet={item.renditionUrls.jpgSrcset}
                      sizes={index === 0 ? '230px' : '75px'}
                    />
                    <img
                      src={item.renditionUrls.small}
                      className="cover"
                      loading="lazy"
                      alt={item.name}
                      width={item.renditionUrls.width}
                      height={item.renditionUrls.height}
                    />
                  </picture>
                )}
              </div>
            ),
          )}
        </div>

        {/* Category Name and total number of items in that category */}
        <div className="caption">
          <h2>{category.name}</h2>
          <h3>
            {totalResults}
            {' '}
            photos
          </h3>
        </div>

      </Link>
    </section>
  );
};

Gallery.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({})),
    totalResults: PropTypes.number,
  }).isRequired,
};

export default Gallery;
