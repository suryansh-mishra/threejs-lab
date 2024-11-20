/**
 * @fileoverview Three.js Lab - A laboratory for Three.js experiments and learning
 * @author Suryansh Mishra
 * @description This file contains Three.js experiment to generate a simulation of Earth. This script just acts as source point for execution.
 */

import { Earth } from './earth';

const earthLoadingEventListener = (details, progress) => {
  console.log(details, progress);
};

const earth = new Earth(earthLoadingEventListener);
earth.startAnimation();
