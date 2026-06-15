import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const particleCount = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 20000));

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.3 + 0.15,
      });
    }

    const handleMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      // Clear canvas with a very soft ambient opacity to allow slight trailing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check current theme from HTML dataset
      const isDarkMode = document.documentElement.dataset.theme !== 'light';
      // Line and particle color palettes based on theme
      const colorRGB = isDarkMode ? '215, 255, 69' : '107, 143, 0'; // neon-yellow-green vs olive-green

      // Draw and update particles
      particles.forEach((p) => {
        // Move particles
        p.x += p.vx;
        p.y += p.vy;

        // Bounce at boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse interaction (gentle attraction)
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const distance = Math.hypot(dx, dy);
        
        let particleAlpha = p.alpha;
        let drawX = p.x;
        let drawY = p.y;

        if (distance < 180) {
          // Attract towards mouse
          const force = (180 - distance) / 180;
          drawX += dx * force * 0.08;
          drawY += dy * force * 0.08;
          particleAlpha = Math.min(0.8, p.alpha + force * 0.4);
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRGB}, ${particleAlpha})`;
        ctx.shadowColor = `rgba(${colorRGB}, ${particleAlpha * 0.5})`;
        ctx.shadowBlur = distance < 180 ? 4 : 0;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          // Mouse distance factor for glow
          const dxMouse = mouse.current.x - p1.x;
          const dyMouse = mouse.current.y - p1.y;
          const distToMouse = Math.hypot(dxMouse, dyMouse);

          // Position to draw from (accounting for mouse pull)
          let drawX1 = p1.x;
          let drawY1 = p1.y;
          let drawX2 = p2.x;
          let drawY2 = p2.y;

          if (distToMouse < 180) {
            const force = (180 - distToMouse) / 180;
            drawX1 += dxMouse * force * 0.08;
            drawY1 += dyMouse * force * 0.08;

            const dxMouse2 = mouse.current.x - p2.x;
            const dyMouse2 = mouse.current.y - p2.y;
            drawX2 += dxMouse2 * force * 0.08;
            drawY2 += dyMouse2 * force * 0.08;
          }

          const dist = Math.hypot(drawX2 - drawX1, drawY2 - drawY1);

          if (dist < 110) {
            const alpha = (110 - dist) / 110 * 0.09;
            ctx.beginPath();
            ctx.moveTo(drawX1, drawY1);
            ctx.lineTo(drawX2, drawY2);
            ctx.strokeStyle = `rgba(${colorRGB}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-canvas" />;
}
