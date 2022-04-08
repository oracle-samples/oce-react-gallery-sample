/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
 * Contains the Routes used in the Client and Server routers.
 */
import HomePage from './HomePage';
import ImageGridPage from './ImageGridPage';
import NotFoundPage from './NotFoundPage';

export default [
  {
    ...HomePage,
    path: '/',
    exact: true,
    title: 'Image Gallery',
  },
  {
    ...ImageGridPage,
    path: '/category/:categoryId',
    exact: true,
    title: 'Image Grid',
  },
  {
    ...NotFoundPage,
    path: '*',
    exact: false,
    title: 'Page Not Found',
  },
];
