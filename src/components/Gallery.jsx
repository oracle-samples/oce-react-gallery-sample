/**
 * Copyright (c) 2020, 2021 Oracle and/or its affiliates.
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
  const { category, itemsThumbnailURLMap } = props;
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
            (item) => (
              <div key={item.id} className="item fade">
                <img src={itemsThumbnailURLMap.get(item.id)} alt={item.name} className="cover" />
              </div>
            ),
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
};

Gallery.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({})),
    totalResults: PropTypes.number,
  }).isRequired,
  itemsThumbnailURLMap: PropTypes.instanceOf(Map).isRequired,
};

export default Gallery;
