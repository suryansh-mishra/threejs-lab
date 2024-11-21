import * as THREE from 'three';

interface StarComposition {
  white: number;
  red: number;
  orange: number;
  blue: number;
}

interface StarFieldOptions {
  starCount?: number;
  clearX?: [number, number];
  clearY?: [number, number];
  clearZ?: [number, number];
  starComposition?: Partial<StarComposition>;
}

class StarField {
  private scene: THREE.Scene;
  private stars: THREE.Points | null = null;
  private starColors: number[] = [];
  private twinkleIntensity: number[] = [];
  private options: Required<StarFieldOptions> & {
    starComposition: StarComposition;
  };

  constructor(scene: THREE.Scene, options: StarFieldOptions = {}) {
    const defaultComposition: StarComposition = {
      white: 0.9,
      red: 0.05,
      orange: 0.03,
      blue: 0.02,
    };

    this.scene = scene;
    this.options = {
      starCount: options.starCount ?? 10000,
      clearX: options.clearX ?? [-50, 50],
      clearY: options.clearY ?? [-50, 50],
      clearZ: options.clearZ ?? [-50, 50],
      starComposition: { ...defaultComposition, ...options.starComposition },
    };

    this.generateStarField();
  }

  private generateStarField(): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.01,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });

    const starsVertices: number[] = [];
    this.starColors = [];
    this.twinkleIntensity = [];

    for (let i = 0; i < this.options.starCount; i++) {
      const x = this.getRandomCoordinate(this.options.clearX);
      const y = this.getRandomCoordinate(this.options.clearY);
      const z = this.getRandomCoordinate(this.options.clearZ);

      starsVertices.push(x, y, z);

      const color = this.getStarColor();
      this.starColors.push(color.r, color.g, color.b);

      this.twinkleIntensity.push(Math.random() * Math.PI * 2);
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    starsGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(this.starColors, 3)
    );

    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  }

  private getRandomCoordinate([min, max]: [number, number]): number {
    return min + Math.random() * (max - min);
  }

  private getStarColor(): THREE.Color {
    const rand = Math.random();
    const { white, red, orange, blue } = this.options.starComposition;

    if (rand < white) return new THREE.Color(0xffffff);
    if (rand < white + red) return new THREE.Color(0xff4500);
    if (rand < white + red + orange) return new THREE.Color(0xffa500);
    if (rand < white + red + orange + blue) return new THREE.Color(0x87ceeb);

    return new THREE.Color(0xffffff);
  }

  public animate(time: number): void {
    if (!this.stars) return;

    const positionAttribute = this.stars.geometry.getAttribute('position');

    for (let i = 0; i < this.twinkleIntensity.length; i++) {
      this.twinkleIntensity[i] += 0.01;
      const offset = Math.sin(this.twinkleIntensity[i]) * 0.02;

      const currentPosition = positionAttribute.getY(i);
      positionAttribute.setY(i, currentPosition + offset);
    }

    positionAttribute.needsUpdate = true;
  }
}

export default StarField;
