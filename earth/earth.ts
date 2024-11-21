/**
 * @fileoverview Three.js Lab - A laboratory for Three.js experiments and learning
 * @author Suryansh Mishra
 * @description This file contains Three.js experiment to generate a simulation of Earth. This contains class based code required to draw a canvas element on screen and draw earth on it.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import earthBumpMapImg from './assets/textures/earth-bumps.jpg';
import earthSpecularMapImg from './assets/textures/earth-spec.jpg';
import earthLightsMapImg from './assets/textures/earth-lights.jpg';
import earthMapImg from './assets/textures/earth-texture.jpg';
import earthCloudsMapImg from './assets/textures/earth-cloud-dark.jpg';

const DIRECTION_LIGHT_COLOR = 'hsl(0, 0%, 100%)';

class LoadingEvent extends EventTarget {
  private state: 'uninitialized' | 'loading' | 'completed' | 'failed' =
    'uninitialized';
  public progress: number = 0;

  constructor() {
    super();
  }

  public setLoadingProgress(progress: number) {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100.');
    }

    if (this.state === 'completed') {
      throw new Error('Cannot update progress when loading is completed.');
    }
    if (this.state === 'failed') {
      throw new Error('Cannot update progress when loading is failed.');
    }

    if (this.state === 'uninitialized') {
      this.state = 'loading';
    }

    this.progress = progress;

    if (progress === 100) {
      this.state = 'completed';
    }

    this.dispatchProgressEvent();
  }

  public getState() {
    return this.state;
  }

  public getProgress() {
    return this.progress;
  }

  private dispatchProgressEvent() {
    const event = new CustomEvent('three-js-earth-loading-progress', {
      detail: {
        state: this.state,
        progress: this.progress,
      },
    });
    this.dispatchEvent(event);
  }

  public setFailed() {
    if (this.state === 'completed') {
      throw new Error('Cannot mark as failed when loading is completed.');
    }

    this.state = 'failed';
    this.progress = 0;

    this.dispatchProgressEvent();
  }
}

export class Earth {
  public scene: THREE.Scene | undefined;
  public camera: THREE.PerspectiveCamera | undefined;
  public renderer: THREE.WebGLRenderer;
  public loadingEvent: EventTarget;
  public animationFunctions: (() => void)[] = [];
  public controls: OrbitControls | undefined;

  constructor(loadingEventListener?: {
    (details: any, progress: any): void;
    (
      state: 'uninitialized' | 'loading' | 'completed' | 'failed',
      progress: number
    ): void;
  }) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'relative';
    canvas.style.zIndex = '10';
    this.loadingEvent = new LoadingEvent();
    if (loadingEventListener)
      this.addLoadingEventListener(loadingEventListener);
    this.setupScene();
    this.setupCamera();
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    THREE.ColorManagement.enabled = true;
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.setupResizeHandler();
    this.setupControls();
    document.body.appendChild(this.renderer.domElement);
  }

  public addLoadingEventListener(
    listener: (
      state: 'uninitialized' | 'loading' | 'completed' | 'failed',
      progress: number
    ) => void
  ) {
    this.loadingEvent.addEventListener(
      'three-js-earth-loading-progress',
      (event: any) => {
        listener(event.detail.state, event.detail.progress);
      }
    );
  }

  public resetView() {
    // TODO: add the reset option for this model
  }

  private setupControls() {
    if (!this.camera) return;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.03;
  }

  private setupScene() {
    this.scene = new THREE.Scene();
    this.prepareScene();
    (this.loadingEvent as LoadingEvent).setLoadingProgress(10);
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      53,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.setZ(5);
    this.camera.lookAt(0, 0, 0);
    (this.loadingEvent as LoadingEvent).setLoadingProgress(20);
  }

  private prepareScene() {
    const lm = new THREE.LoadingManager();
    const earthMapLoader = new THREE.TextureLoader(lm);
    const earthBumpMapLoader = new THREE.TextureLoader(lm);
    const earthLightMapLoader = new THREE.TextureLoader(lm);
    const earthCloudsMapLoader = new THREE.TextureLoader(lm);
    const earthSpecMapLoader = new THREE.TextureLoader(lm);

    lm.onProgress = () => {
      (this.loadingEvent as LoadingEvent).setLoadingProgress(
        (this.loadingEvent as LoadingEvent).progress + 16
      );
    };

    const earthMap = earthMapLoader.load(earthMapImg);
    const earthSpecMap = earthSpecMapLoader.load(earthSpecularMapImg);
    const earthBumpMap = earthBumpMapLoader.load(earthBumpMapImg);
    const earthLightMap = earthLightMapLoader.load(earthLightsMapImg);
    const earthCloudsMap = earthCloudsMapLoader.load(earthCloudsMapImg);

    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);

    const earthMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecMap,
      bumpMap: earthBumpMap,
      bumpScale: 0.04,
      emissiveMap: earthLightMap,
      emissive: new THREE.Color(DIRECTION_LIGHT_COLOR),
      emissiveIntensity: 1,
    });

    const earthCloudsMat = new THREE.MeshStandardMaterial({
      alphaMap: earthCloudsMap,
      transparent: true,
      opacity: 0.63,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMat);
    const earthCloudsMesh = new THREE.Mesh(earthGeometry, earthCloudsMat);

    earthCloudsMesh.scale.setScalar(1.001);

    const sunlight = new THREE.DirectionalLight(DIRECTION_LIGHT_COLOR, 5);
    sunlight.position.set(-10, 2.5, 0.466);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.75);
    hemisphereLight.position.set(0, 15, 0);

    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = (23.5 / 180) * Math.PI;
    earthGroup.rotateY(-0.3);

    earthGroup.add(earthMesh);
    earthGroup.add(earthCloudsMesh);

    const earthAnimation = () => {
      earthMesh.rotation.y += 0.001;
      earthCloudsMesh.rotation.y += 0.001;
    };

    this.animationFunctions.push(earthAnimation);
    this.scene!.add(earthGroup);
    this.scene!.add(sunlight);
    // this.scene.add(hemisphereLight);
  }

  private setupResizeHandler() {
    const handleResize = () => {
      this.camera!.aspect = window.innerWidth / window.innerHeight;
      this.camera!.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
  }

  private animate() {
    if (!((this.loadingEvent as LoadingEvent).getState() === 'completed'))
      return;
    this.controls?.update();
    this.animationFunctions.forEach((a) => a());
    this.renderer.render(this.scene!, this.camera!);
  }

  public startAnimation() {
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }
}
