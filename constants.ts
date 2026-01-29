// Physics constants derived from "Tennis balls on clay" video analysis
export const PHYSICS = {
  GRAVITY: 0.6,          // Vertical acceleration per frame
  RESTITUTION: 0.78,     // Bounciness (Energy retained on collision)
  FRICTION_AIR: 0.995,   // Air resistance
  FRICTION_GROUND: 0.98, // Rolling resistance on clay
  VELOCITY_DAMPING: 0.1, // Minimum velocity to stop bouncing
};

export const COLORS = {
  CLAY_BASE: '#B6624C',      // The reddish-brown clay color from video
  CLAY_HIGHLIGHT: '#C8745D', // Lighter clay
  CLAY_SHADOW: '#8A4232',    // Shadowed clay
  LINE: '#EBEBEB',           // Court lines
  BALL_BASE: '#DFFF4F',      // Optic yellow
  BALL_SHADOW: 'rgba(0, 0, 0, 0.3)',
};

export const DIMENSIONS = {
  BALL_RADIUS: 15,
};