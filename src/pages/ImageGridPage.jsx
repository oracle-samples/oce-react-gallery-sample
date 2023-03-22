/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import backImage from '../assets/back.png';

/**
 * This component displays the assets belonging to a category in a grid view.
 * Upon clicking an image, it allows display of the images in a slideshow.
 *
 * @param categoryId the id of the category whose items are to be displayed
 * @param categoryName the name of the category whose items are to be displayed
 */
export default function ImageGridPage({ fetchInitialData, serverData, title }) {
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
  const [currentImage, setCurrentImage] = React.useState(-1);
  const prevCounterRef = React.useRef();
  React.useEffect(() => {
    prevCounterRef.current = currentImage;
  });
  const [loading, setLoading] = React.useState(!data);
  const fetchNewData = React.useRef(!data);
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryName = process.env.IS_BROWSER ? searchParams.get('categoryName') : '';

  /**
  * static method to handle back button being clicked
  * to go back to the main page
  */
  function handleBack(e) {
    e.preventDefault();
    window.history.back();
  }

  /**
   * Handle click on the grid item. Sets the current image on the state.
   */
  function handleClick(event) {
    const imageClicked = event.target.getAttribute('data-key');
    if (!imageClicked) {
      return; // check for null image. This may be null when you click on empty white space
    }

    const el = document.getElementsByTagName('body');
    el[0].classList.add('modal-open');
    setCurrentImage(parseInt(imageClicked, 10));
  }

  /**
   * Handle clicks on the prev/next buttons. If its on the first item
   * or last item, don't do anything on the prev or next respectively
   */
  function handlePrevNextClick(e, increment) {
    const { totalResults } = data;

    e.preventDefault();
    if ((currentImage === 0 && !increment)
        || (currentImage === totalResults - 1 && increment)) {
      return;
    }
    setCurrentImage(increment ? currentImage + 1 : currentImage - 1);
  }

  /**
   * Handle click on the close button of the slideshow.
   * Remove the modal-open class from the body so that scrollbars can
   * work again.
   */
  function handleCloseClick(e) {
    e.preventDefault();
    const el = document.getElementsByTagName('body');
    el[0].classList.remove('modal-open');
    setCurrentImage(-1);
  }

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  React.useEffect(() => {
    if (fetchNewData.current === true) {
      setLoading(true);

      fetchInitialData(categoryId)
        .then((results) => {
          setData(results);
          setLoading(false);
        });
    } else {
      fetchNewData.current = true;
    }
  }, [categoryId, fetchNewData]);

  /**
   * Handle Keypress events. If the left arrow or right arrow key is pressed,
   * adjust the slideshow accordingly. If esc is pressed, exit slideshow mode.
   */
  React.useEffect(() => {
    function onKeyDown(e) {
      const count = prevCounterRef.current;
      if (count === -1) {
        return;
      }
      const decrement = e.keyCode === 37;
      const increment = e.keyCode === 39;
      const { totalResults } = data;
      if ((count === 0 && decrement)
          || (count === totalResults - 1 && increment)) {
        return;
      }
      if (e.keyCode === 37) { // left arrow
        setCurrentImage(count - 1);
      } else if (e.keyCode === 39) { // right arrow
        setCurrentImage(count + 1);
      } else if (e.keyCode === 27) { // esc key
        handleCloseClick(e);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [data]);

  if (loading) {
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
          onClick={handleBack}
          onKeyDown={handleBack}
          role="button"
          tabIndex="0"
        >
          <img src={backImage} alt="Navigate back to Home" />
          <span>Home</span>
        </div>

        <h1 className="heading">{categoryName}</h1>
        <h2 className="subheading" data-totalResults={totalResults}>
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
          onClick={(e) => handleClick(e)}
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
            onClick={(e) => handlePrevNextClick(e, false)}
            onKeyDown={(e) => handlePrevNextClick(e, false)}
            role="button"
            tabIndex="0"
          >
            &#10094;
          </div>

          <div
            className={nextClassName}
            onClick={(e) => handlePrevNextClick(e, true)}
            onKeyDown={(e) => handlePrevNextClick(e, true)}
            role="button"
            tabIndex="0"
          >
            &#10095;
          </div>

          <div
            className="close"
            onClick={(e) => handleCloseClick(e, true)}
            onKeyDown={(e) => handleCloseClick(e, true)}
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

ImageGridPage.propTypes = {
  fetchInitialData: PropTypes.func.isRequired,
  serverData: PropTypes.shape().isRequired,
  title: PropTypes.string.isRequired,
};
