export interface Vector2 {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  pos: Vector2;
  vel: Vector2;
  rotation: number;     // Current rotation in radians
  rotationSpeed: number; // Rotational velocity
  isSleeping: boolean;  // Optimization: stop processing if still
}