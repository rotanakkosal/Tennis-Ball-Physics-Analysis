import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PHYSICS, COLORS, DIMENSIONS } from '../constants';
import { Ball } from '../types';

export const PhysicsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const requestRef = useRef<number | null>(null);
  const ballsRef = useRef<Ball[]>([]); // Ref for animation loop to avoid dependency staleness

  // Initialize with a few balls dropping
  useEffect(() => {
    const initialBalls: Ball[] = Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i,
      pos: { 
        x: window.innerWidth / 2 + (Math.random() * 200 - 100), 
        y: -100 - (i * 100) 
      },
      vel: { 
        x: Math.random() * 4 - 2, 
        y: 0 
      },
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() * 0.2) - 0.1,
      isSleeping: false
    }));
    ballsRef.current = initialBalls;
    setBalls(initialBalls);
  }, []);

  const spawnBall = useCallback((x: number, y: number) => {
    const newBall: Ball = {
      id: Date.now(),
      pos: { x, y },
      vel: { 
        x: (Math.random() - 0.5) * 10, // Random horizontal velocity
        y: (Math.random() * 5) - 5     // Slight upward pop or neutral
      },
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() * 0.4) - 0.2,
      isSleeping: false
    };
    ballsRef.current = [...ballsRef.current, newBall];
  }, []);

  const updatePhysics = (width: number, height: number) => {
    ballsRef.current.forEach(ball => {
      if (ball.isSleeping) return;

      // Apply Gravity
      ball.vel.y += PHYSICS.GRAVITY;
      ball.vel.x *= PHYSICS.FRICTION_AIR;
      ball.vel.y *= PHYSICS.FRICTION_AIR;

      // Update Position
      ball.pos.x += ball.vel.x;
      ball.pos.y += ball.vel.y;
      ball.rotation += ball.rotationSpeed;

      // Floor Collision
      const floorLevel = height;
      if (ball.pos.y + DIMENSIONS.BALL_RADIUS > floorLevel) {
        ball.pos.y = floorLevel - DIMENSIONS.BALL_RADIUS;
        
        // Bounce
        ball.vel.y *= -PHYSICS.RESTITUTION;
        
        // Friction when hitting ground (clay is gritty)
        ball.vel.x *= PHYSICS.FRICTION_GROUND;
        ball.rotationSpeed *= 0.95;

        // Stop bouncing if velocity is very low
        if (Math.abs(ball.vel.y) < PHYSICS.VELOCITY_DAMPING && Math.abs(ball.vel.y) > 0) {
          ball.vel.y = 0;
        }

        // Sleep check
        if (Math.abs(ball.vel.y) === 0 && Math.abs(ball.vel.x) < 0.1) {
          ball.isSleeping = true;
        }
      }

      // Wall Collision (keep in bounds)
      if (ball.pos.x - DIMENSIONS.BALL_RADIUS < 0) {
        ball.pos.x = DIMENSIONS.BALL_RADIUS;
        ball.vel.x *= -0.7;
      } else if (ball.pos.x + DIMENSIONS.BALL_RADIUS > width) {
        ball.pos.x = width - DIMENSIONS.BALL_RADIUS;
        ball.vel.x *= -0.7;
      }
    });

    // Cleanup balls that fell off world (if any logic allowed that, though walls prevent it here)
    // Or limit total balls to prevent performance issues
    if (ballsRef.current.length > 50) {
      ballsRef.current = ballsRef.current.slice(ballsRef.current.length - 50);
    }
  };

  const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    ctx.save();
    ctx.translate(ball.pos.x, ball.pos.y);

    // Drop Shadow (scales with height)
    // We draw this before the ball, but we need to untranslate for the shadow to be on the floor
    // Actually, simpler to draw shadows in a separate pass, but per-ball is okay for this quantity
    ctx.restore(); // Pop back to global coords for shadow logic
    
    // Draw Shadow
    const heightFromFloor = ctx.canvas.height - (ball.pos.y + DIMENSIONS.BALL_RADIUS);
    const shadowOpacity = Math.max(0, 0.4 - (heightFromFloor / 1000));
    const shadowScale = 1 + (heightFromFloor / 200);

    if (shadowOpacity > 0) {
        ctx.beginPath();
        ctx.ellipse(
            ball.pos.x + (heightFromFloor * 0.2), // Light source offset
            ctx.canvas.height - 5, // Always on floor
            DIMENSIONS.BALL_RADIUS * shadowScale, 
            DIMENSIONS.BALL_RADIUS * 0.5 * shadowScale, 
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;
        ctx.fill();
    }

    // Back to Ball Local Space
    ctx.save();
    ctx.translate(ball.pos.x, ball.pos.y);
    ctx.rotate(ball.rotation);

    // Ball Body
    ctx.beginPath();
    ctx.arc(0, 0, DIMENSIONS.BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.BALL_BASE;
    ctx.fill();

    // Shading (Pseudo-3D)
    const gradient = ctx.createRadialGradient(-5, -5, 2, 0, 0, DIMENSIONS.BALL_RADIUS);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Tennis Ball Curves (The seams)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    // Simplified seam curve
    ctx.arc(0, 0, DIMENSIONS.BALL_RADIUS - 2, 0, Math.PI * 2);
    // This is a cheat to make it look like a spinning tennis ball without complex 3D texture mapping
    // We draw an ellipse that rotates
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(0, 0, DIMENSIONS.BALL_RADIUS * 0.8, DIMENSIONS.BALL_RADIUS * 0.3, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  const drawCourt = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fill Clay Background
    ctx.fillStyle = COLORS.CLAY_BASE;
    ctx.fillRect(0, 0, width, height);

    // Add some noise/texture to look like clay (simple specs)
    // Doing this every frame is expensive, so we'll just do a subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, COLORS.CLAY_BASE);
    gradient.addColorStop(1, COLORS.CLAY_SHADOW);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw Lines (mimic the video's perspective lines)
    ctx.strokeStyle = COLORS.LINE;
    ctx.lineWidth = 4;
    
    // Baseline (bottom)
    ctx.beginPath();
    ctx.moveTo(0, height - 50);
    ctx.lineTo(width, height - 50);
    ctx.stroke();

    // Service line (middle-ish, diagonal for perspective)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.lineTo(width, height * 0.5); // Slight angle
    ctx.stroke();

    // Center service line
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.55);
    ctx.lineTo(width * 0.5, height - 50);
    ctx.stroke();

    // Strong shadow from the roof structure (as seen in video)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.4, 0);
    ctx.lineTo(0, height * 0.8);
    ctx.fill();
  };

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Update Physics
    updatePhysics(width, height);

    // 2. Clear & Draw
    ctx.clearRect(0, 0, width, height);
    
    // Draw Environment
    drawCourt(ctx, width, height);

    // Draw Balls
    ballsRef.current.forEach(ball => drawBall(ctx, ball));

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    // Start Loop
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnBall(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="block w-full h-full cursor-crosshair touch-none"
    />
  );
};