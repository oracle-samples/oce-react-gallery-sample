/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import React from 'react';
import PropTypes, { number } from 'prop-types';
import backImage from '../assets/back.png';
import { getImageGridPageData } from '../scripts/services';

/**
 * This component displays the assets belonging to a category in a grid view.
 * Upon clicking an image, it allows display of the images in a slideshow.
 *
 * @param categoryId the id of the category whose items are to be displayed
 * @param categoryName the name of the category whose items are to be displayed
 */
class ImageGridPage extends React.Component {
  /**
   * static method to handle back button being clicked
   * to go back to the main page
   */
  static handleBack(e) {
    e.preventDefault();
    window.history.back();
  }

  constructor(props) {
    super(props);

    let data;
    let categoryName;
    if (process.env.IS_BROWSER) {
      data = window.INITIAL_DATA;
      delete window.INITIAL_DATA;

      const { location } = this.props;
      const params = new URLSearchParams(location.search);
      categoryName = params.get('categoryName');
    } else {
      const { staticContext } = this.props;
      data = staticContext.data;
      categoryName = staticContext.requestQueryParams.categoryName;
    }

    this.state = {
      data,
      loading: !data,
      currentImage: -1, // the index of the image currently being rendered
      categoryName,
    };
  }

  // executed client side only
  componentDidMount() {
    const { categoryName } = this.state;
    document.title = categoryName;

    const { data } = this.state;
    if (!data) {
      const { match } = this.props;
      this.fetchData(match.params.categoryId);
    }

    // add event listener for keydown for navigating through large view of images
    document.addEventListener('keydown', (e) => this.handleKeypressFunction(e), false);
  }

  // called when any of the component's properties changes
  // if the properties have changed, reload the data
  // (i.e. we could be viewing the items of a new category)
  componentDidUpdate(prevProps) {
    const { match } = this.props;

    if (prevProps.match.params.categoryId !== match.params.categoryId) {
      this.fetchData(match.params.categoryId);
    }
  }

  /*
   * Called when the component unmounts.
   * Unregister the keydown event listener
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', (e) => this.handleKeypressFunction(e), false);
  }

  /**
   * Handle click on the grid item. Sets the current image on the state.
   */
  handleClick(event) {
    const imageClicked = event.target.getAttribute('data-key');
    if (!imageClicked) {
      return; // check for null image. This may be null when you click on empty white space
    }

    const el = document.getElementsByTagName('body');
    el[0].classList.add('modal-open');
    this.setState({
      currentImage: parseInt(imageClicked, 10),
    });
  }

  /**
   * Handle Keypress events. If the left arrow or right arrow key is pressed,
   * adjust the slideshow accordingly. If esc is pressed, exit slideshow mode.
   */
  handleKeypressFunction(e) {
    const { currentImage } = this.state;
    if (currentImage === -1) {
      return;
    }

    if (e.keyCode === 37) { // left arrow
      this.handlePrevNextClick(e, false);
    } else if (e.keyCode === 39) { // right arrow
      this.handlePrevNextClick(e, true);
    } else if (e.keyCode === 27) { // esc key
      this.handleCloseClick(e);
    }
  }

  /**
   * Handle clicks on the prev/next buttons. If its on the first item
   * or last item, don't do anything on the prev or next respectively
   */
  handlePrevNextClick(e, increment) {
    const { currentImage } = this.state;
    const { totalResults } = this.props;

    e.preventDefault();
    if ((currentImage === 0 && !increment)
        || (currentImage === totalResults - 1 && increment)) {
      return;
    }

    this.setState({
      currentImage: increment ? currentImage + 1 : currentImage - 1,
    });
  }

  /**
   * Handle click on the close button of the slideshow.
   * Remove the modal-open class from the body so that scrollbars can
   * work again.
   */
  handleCloseClick(e) {
    e.preventDefault();
    const el = document.getElementsByTagName('body');
    el[0].classList.remove('modal-open');
    this.setState({
      currentImage: -1,
    });
  }

  // Client Side Data Fetching: called from Client when doing client side routing/hydration
  fetchData(categoryId) {
    this.setState(() => ({
      loading: true,
    }));

    getImageGridPageData(categoryId)
      .then((data) => this.setState(() => ({
        data,
        loading: false,
      })));
  }

  /*
   * Render the component
   */
  render() {
    const {
      loading, data, currentImage, categoryName,
    } = this.state;

    if (loading === true) {
      return <div className="progress-spinner" />;
    }

    const { items, totalResults } = data;

    // class names for the next/previous buttons
    const hidePrev = currentImage === 0;
    const hideNext = currentImage === totalResults - 1;
    const prevClassName = `prev${hidePrev ? ' hidden' : ''}`;
    const nextClassName = `next${hideNext ? ' hidden' : ''}`;

    // the HTML for rendering every item's small rendition URL
    const childElements = items.map((item, i) => {
      const { renditionUrls } = item;
      return (
        <div key={item.id} className="grid-item">
          {renditionUrls && (
            <picture>
              <source
                type="image/webp"
                srcSet={renditionUrls.srcset}
                sizes="(min-width: 480px) 200px, 150px"
              />
              <source
                srcSet={renditionUrls.jpgSrcset}
                sizes="(min-width: 480px) 200px, 150px"
              />
              <img
                src={renditionUrls.small}
                loading="lazy"
                data-key={i}
                alt="Small Preview"
                width={renditionUrls.width}
                height={renditionUrls.height}
              />
            </picture>
          )}
        </div>
      );
    });

    return (
      <div>
        <div>
          <div
            className="back"
            onClick={ImageGridPage.handleBack}
            onKeyDown={ImageGridPage.handleBack}
            role="button"
            tabIndex="0"
          >
            <img src={backImage} alt="Navigate back to Home" />
            <span>Home</span>
          </div>

          <h1 className="heading">{categoryName}</h1>
          <h2 className="subheading">
            {totalResults}
            {' '}
            photos
          </h2>
        </div>

        {/* No items message */}
        {items.length === 0
        && <div className="message">There are no images in this category.</div>}

        {/* Grid of images */}
        {items.length > 0
        && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            className="grid"
            onClick={(e) => this.handleClick(e)}
          >
            {childElements}
          </div>
        )}

        {/* Image preview overlaid ontop of grid of images */}
        {items.length > 0 && currentImage !== -1 && (
          <div className="page-container">
            <section className="slideshow-container">
              <div className="mySlides fade">
                <div className="imgdiv">
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={items[currentImage].renditionUrls.srcset}
                      sizes="90vh"
                    />
                    <source
                      srcSet={items[currentImage].renditionUrls.jpgSrcset}
                      sizes="90vh"
                    />
                    <img
                      src={items[currentImage].renditionUrls.large}
                      sizes="90vh"
                      loading="lazy"
                      alt="Large preview"
                      width={items[currentImage].renditionUrls.width}
                      height={items[currentImage].renditionUrls.height}
                    />
                  </picture>
                  <div className="numbertext">
                    {currentImage + 1}
                    {' '}
                    /
                    {' '}
                    {totalResults}
                  </div>
                </div>
              </div>
            </section>

            <div
              className={prevClassName}
              onClick={(e) => this.handlePrevNextClick(e, false)}
              onKeyDown={(e) => this.handlePrevNextClick(e, false)}
              role="button"
              tabIndex="0"
            >
              &#10094;
            </div>

            <div
              className={nextClassName}
              onClick={(e) => this.handlePrevNextClick(e, true)}
              onKeyDown={(e) => this.handlePrevNextClick(e, true)}
              role="button"
              tabIndex="0"
            >
              &#10095;
            </div>

            <div
              className="close"
              onClick={(e) => this.handleCloseClick(e, true)}
              onKeyDown={(e) => this.handleCloseClick(e, true)}
              role="button"
              tabIndex="0"
            >
              X
            </div>

          </div>
        )}

      </div>
    );
  }
}

// Server Side Data Fetching: called from Express server when sending HTML to client
function fetchInitialData(req) {
  return getImageGridPageData(req.path.split('/').pop());
}

export default {
  fetchInitialData,
  component: ImageGridPage,
};

ImageGridPage.propTypes = {
  totalResults: number,

  staticContext: PropTypes.shape({
    data: PropTypes.shape({}),
    requestQueryParams: PropTypes.shape({
      categoryName: PropTypes.string,
    }),
  }),

  match: PropTypes.shape({
    params: PropTypes.shape({
      categoryId: PropTypes.string,
    }),
  }).isRequired,

  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,

  route: PropTypes.shape({
    queryParams: PropTypes.shape({
      categoryName: PropTypes.string,
    }),
  }).isRequired,
};

ImageGridPage.defaultProps = {
  totalResults: -1,
  staticContext: {},
};
