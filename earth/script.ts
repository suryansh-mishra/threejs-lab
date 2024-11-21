/**
 * @fileoverview Three.js Lab - A laboratory for Three.js experiments and learning
 * @author Suryansh Mishra
 * @description This file contains Three.js experiment to generate a simulation of Earth. This script just acts as source point for execution.
 */

import '../global.css';
import { Earth } from './earth';

const loadingElement = document.getElementById(
  'earth-loading-root'
) as HTMLDivElement;
const progressElement = document.getElementById(
  'earth-loading-progress'
) as HTMLSpanElement;

const resetViewButton = document.getElementById(
  'reset-view-button'
) as HTMLButtonElement;

const earthLoadingEventListener = (state: string, progress: number) => {
  if (state === 'loading') {
    progressElement.textContent = `${progress}%`;
  }
  if (progress === 100) {
    setTimeout(() => {
      loadingElement.remove();
    }, 100);
  }
  if (state === 'failed') {
    progressElement.textContent = 'Failed to load';
  }
};

const earth = new Earth(earthLoadingEventListener);
earth.startAnimation();

resetViewButton.addEventListener('click', () => earth.resetView());
