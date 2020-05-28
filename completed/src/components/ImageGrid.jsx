/**
 * Copyright (c) 2020 Oracle and/or its affiliates. All rights reserved.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import '../style.css';

import * as React from 'react';
import Masonry from 'react-masonry-component';
import PropTypes from 'prop-types';

import backImage from '../assets/back.png';

import getDeliveryClient from '../scripts/server-config-utils';
import { fetchItemsForCategory, retrieveRenditionURLs } from '../scripts/services';

const masonryOptions = {
  transitionDuration: 0,
};

const imagesLoadedOptions = { background: '.my-bg-image-el' };

/**
 * This component displays the assets belonging to a category in a grid view.
 * Upon clicking an image, it allows display of the images in a slideshow.
 *
 * @param categoryId the id of the category whose items are to be displayed
 * @param categoryName the name of the category whose items are to be displayed
 */
export default class ImageGrid extends React.Component {
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

    this.mounted = false;

    this.state = {
      loading: true,
      error: false,
      imagesArray: [],
      totalResults: 0,
      currentImage: -1, // the index of the image currently being rendered
    };
  }

  /**
   * Fetch the items for a category and then retrieve the rendition urls.
   * We need the smaller version of the asset for the grid and the native
   * version for the slideshow.
   */
  componentDidMount() {
    this.mounted = true;

    const { categoryName, categoryId } = this.props;

    if (this.mounted) {
      // set the browser tab title
      document.title = categoryName;
    }

    // get the client to connect to CEC
    const deliveryClient = getDeliveryClient();

    // fetch the items for the category and set the total results
    const self = this;
    fetchItemsForCategory(deliveryClient, categoryId, false)
      .then((topLevelItem) => {
        self.setState({
          totalResults: topLevelItem.totalResults,
        });
        const images = [];

        // for each item, retrieve the rendition urls
        topLevelItem.items.forEach((item) => {
          retrieveRenditionURLs(deliveryClient, item.id)
            .then((renditionUrls) => {
              if (renditionUrls != null) {
                images.push({ renditionUrls, alt: item.name });
                // Set the state so that it can be rendered
                if (self.mounted) {
                  self.setState({
                    imagesArray: images,
                    loading: false,
                  });
                }
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

    document.addEventListener('keydown', (e) => this.handleKeypressFunction(e), false);
  }

  /*
   * Called when the component unmounts.
   * Unregister the keydown event listener
   */
  componentWillUnmount() {
    this.mounted = false;
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
    const { currentImage, totalResults } = this.state;

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

  /*
   * Render this component.
   *
   * Renders the grid of assets belonging to the category. If current image is set, then it
   * also displays the slideshow overlay of native images over the grid.
   */
  render() {
    const { categoryName } = this.props;
    const {
      loading, error, currentImage, totalResults, imagesArray,
    } = this.state;

    const hidePrev = currentImage === 0;
    const hideNext = currentImage === totalResults - 1;
    const prevClassName = `prev${hidePrev ? ' hidden' : ''}`;
    const nextClassName = `next${hideNext ? ' hidden' : ''}`;

    const childElements = imagesArray.map((image, i) => {
      const thumbnailUrl = image.renditionUrls.Small;
      return (
        <div key={thumbnailUrl} className="grid-item">
          <img src={thumbnailUrl} key={thumbnailUrl} data-key={i} alt="Small Preview" />
        </div>
      );
    });

    return (
      <div>
        {/* Render error */}
        {error && (
          <div className="error">
            Loading images failed.
          </div>
        )}

        {/* Render loading */}
        {loading && !error && (
          <div class="progress-spinner" />
        )}

        {/* Render data */}
        {!error && !loading && (
          <div>

            <div>
              <div
                className="back"
                onClick={ImageGrid.handleBack}
                onKeyDown={ImageGrid.handleBack}
                role="button"
                tabIndex="0"
              >
                <img src={backImage} alt="Navigate back to Home" />
                <span>Home</span>
              </div>

              <h1 className="heading">{categoryName}</h1>
              <h4 className="subheading">
                {totalResults}
                {' '}
                photos
              </h4>
            </div>

            {/* No Images message */}
            {imagesArray.length === 0
              && <div className="message">There are no images in this category.</div>}

            {/* Grid of images */}
            {imagesArray.length > 0
              && (
                <Masonry
                  className="grid" // default ''
                  onClick={(e) => this.handleClick(e)}
                  options={masonryOptions} // default {}
                  disableImagesLoaded={false} // default false
                  updateOnEachImageLoad // default false, works only if disableImagesLoaded is false
                  imagesLoadedOptions={imagesLoadedOptions}
                >
                  {childElements}
                </Masonry>
              )}

            {/* Image preview overlaid ontop of grid of images */}
            {imagesArray.length > 0 && currentImage !== -1 && (
              <div className="page-container">
                <section className="slideshow-container">
                  <div className="mySlides fade">
                    <div className="imgdiv">
                      <img src={imagesArray[currentImage].renditionUrls.Native} alt="Large preview" />
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
        )}
      </div>
    );
  }
}

/*
 * Define the types of data passed into this component.
 */
ImageGrid.propTypes = {
  categoryName: PropTypes.string.isRequired,
  categoryId: PropTypes.string.isRequired,
};
