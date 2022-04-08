/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Gallery from '../components/Gallery';
import { getHomePageData } from '../scripts/services';

/**
 * Component for the home page.
 */
class HomePage extends React.Component {
  constructor(props) {
    super(props);

    let data;
    if (process.env.IS_BROWSER) {
      data = window.INITIAL_DATA;
      delete window.INITIAL_DATA;
    } else {
      const { staticContext } = this.props;
      data = staticContext.data;
    }

    this.state = {
      data,
      loading: !data,
    };
  }

  // client side only : if this component doesn't already have its data, load it
  componentDidMount() {
    document.title = 'Image Gallery';

    const { data } = this.state;
    if (!data) {
      this.fetchData();
    }
  }

  // Client Side Data Fetching: called from Client when doing client side routing/hydration
  fetchData() {
    this.setState(() => ({
      loading: true,
    }));

    getHomePageData()
      .then((data) => this.setState(() => ({
        data,
        loading: false,
      })));
  }

  // render the component
  render() {
    const { loading, data } = this.state;

    if (loading === true) {
      return <div className="progress-spinner" />;
    }

    const { categories } = data;

    return (
      <div>
        <Helmet>
          <meta name="BUILD_TAG" content={`${process.env.BUILD_TAG}`} />
          <meta name="@oracle/gatsby-source-oce" content={`${process.env.SDK_VERSION}`} />
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
}

// Server Side Data Fetching: called from Express server when sending HTML to client
function fetchInitialData() {
  return getHomePageData();
}

export default {
  fetchInitialData,
  component: HomePage,
};

HomePage.propTypes = {
  staticContext: PropTypes.shape({
    data: PropTypes.shape({}),
  }),
};

HomePage.defaultProps = {
  staticContext: {},
};
