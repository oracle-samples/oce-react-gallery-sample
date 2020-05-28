/**
 * Copyright (c) 2020 Oracle and/or its affiliates. All rights reserved.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a gallery item image
 *
 * @param image the image for the gallery item
 */
const GalleryItem = (props) => {
  const { image } = props;
  return (
    <div className="item fade">
      <img src={image.src} alt={image.alt} className={image.classname} />
    </div>
  );
};

/*
 * Define the "image" object passed into this component.
 */
GalleryItem.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string,
    alt: PropTypes.string,
    classname: PropTypes.string,
  }).isRequired,
};

export default GalleryItem;
