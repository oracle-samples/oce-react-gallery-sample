/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Gallery from '../components/Gallery';

/**
 * Component for the home page.
 */
export default function HomePage({ fetchInitialData, serverData, title }) {
  const [data, setData] = React.useState(() => {
    let ret;
    if (process.env.IS_BROWSER) {
      ret = window.INITIAL_DATA;
      delete window.INITIAL_DATA;
    } else {
      ret = serverData;
    }
    return ret;
  });

  const [loading, setLoading] = React.useState(!data);

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  const fetchNewData = React.useRef(!data);

  React.useEffect(() => {
    if (fetchNewData.current === true) {
      setLoading(true);

      fetchInitialData()
        .then((results) => {
          setData(results);
          setLoading(false);
        });
    } else {
      fetchNewData.current = true;
    }
  }, [fetchNewData]);

  if (loading) {
    return <div className="progress-spinner" />;
  }

  const { categories } = data;

  return (
    <div>
      <Helmet>
        <meta name="BUILD_TAG" content={`${process.env.BUILD_TAG}`} />
        <meta name="@oracle/content-management-sdk" content={`${process.env.SDK_VERSION}`} />
      </Helmet>
      <h1 className="heading">Image Gallery</h1>
      <div className="gallerycontainer">

        {/* Iterate through the categories and render the gallery for each */}
        {categories
          && categories.map((category) => (
            <Gallery
              key={category.id}
              category={category}
            />
          ))}
      </div>
    </div>
  );
}

HomePage.propTypes = {
  fetchInitialData: PropTypes.func.isRequired,
  serverData: PropTypes.shape().isRequired,
  title: PropTypes.string.isRequired,
};
