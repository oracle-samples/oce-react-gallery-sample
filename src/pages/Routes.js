/**
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
 * Contains the Routes used in the Client and Server routers.
 */
import HomePage from './HomePage';
import ImageGridPage from './ImageGridPage';
import { getHomePageData, getImageGridPageData } from '../scripts/services';

const routes = [
  {
    path: '/',
    component: HomePage,
    fetchInitialData: () => getHomePageData(),
    title: 'Image Gallery',
  },
  {
    path: '/category/:categoryId',
    component: ImageGridPage,
    fetchInitialData: (path) => getImageGridPageData(path.split('/').pop()),
    title: 'Image Grid',
  },
];

export default routes;
