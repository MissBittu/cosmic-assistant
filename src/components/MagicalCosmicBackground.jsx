import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// 🌌 FULL MAGICAL COSMIC BACKGROUND (GALAXIES + STARS + AURORA + MOUNTAINS)
// ============================================================================
const MagicalCosmicBackground = ({ timeOfDay = 'night' }) => {
  const canvasRef = useRef(null);
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);
  const [galaxies, setGalaxies] = useState([]);
  const animationRef = useRef(null);

  // ----------------------------------------------------------
  // INIT: Stars + Galaxies + Shooting Stars
  // ----------------------------------------------------------
  useEffect(() => {
    const newStars = Array.from({ length: 300 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
    setStars(newStars);

    const newGalaxies = Array.from({ length: 3 }, () => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 10,
      size: Math.random() * 100 + 80,
      rotation: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.0005 + 0.0002,
      arms: 3 + Math.floor(Math.random() * 3),
    }));
    setGalaxies(newGalaxies);

    const shootingInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setShootingStars(prev => [
          ...prev,
          { id: Date.now(), x: Math.random() * 100, y: Math.random() * 30, angle: 45, speed: 2 + Math.random() * 2 },
        ]);
      }
    }, 3000);

    return () => clearInterval(shootingInterval);
  }, []);

  // ----------------------------------------------------------
  // ANIMATE Galaxies & Shooting Stars
  // ----------------------------------------------------------
  useEffect(() => {
    const animate = () => {
      setGalaxies(prev =>
        prev.map(g => ({ ...g, rotation: g.rotation + g.speed }))
      );
      setShootingStars(prev =>
        prev
          .map(s => ({
            ...s,
            x: s.x + Math.cos(s.angle * Math.PI / 180) * s.speed,
            y: s.y + Math.sin(s.angle * Math.PI / 180) * s.speed,
          }))
          .filter(s => s.x < 110 && s.y < 110)
      );
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // ----------------------------------------------------------
  // COLORS by Time of Day
  // ----------------------------------------------------------
  const timeColors = {
    night: { sky: ['#0a0a1a', '#1a0a2e', '#2d1b4e'], accent: '#a78bfa', stars: '#ffffff' },
    sunrise: { sky: ['#1a1a3e', '#ff6b6b', '#ffd93d'], accent: '#ff8c42', stars: '#ffe5b4' },
    day: { sky: ['#87ceeb', '#b0d4f1', '#e0f2f7'], accent: '#ffd700', stars: '#ffffff' },
    sunset: { sky: ['#2d1b4e', '#ff6b6b', '#ff8c42'], accent: '#ff6b6b', stars: '#ffd93d' },
  };
  const colors = timeColors[timeOfDay] || timeColors.night;

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Gradient Sky */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${colors.sky[0]}, ${colors.sky[1]}, ${colors.sky[2]})`,
        }}
      />

      {/* Twinkling Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: colors.stars,
            boxShadow: `0 0 ${star.size * 2}px ${colors.stars}`,
            animationDelay: `${star.twinklePhase}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Galaxies */}
      {galaxies.map((galaxy, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${galaxy.x}%`,
            top: `${galaxy.y}%`,
            width: `${galaxy.size}px`,
            height: `${galaxy.size}px`,
            transform: `rotate(${galaxy.rotation}rad)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, ${colors.accent}80, ${colors.accent}40, transparent)`,
            }}
          />
          {[...Array(galaxy.arms)].map((_, a) => (
            <div
              key={a}
              className="absolute inset-0"
              style={{ transform: `rotate(${(a * 360) / galaxy.arms}deg)` }}
            >
              <div
                className="absolute left-1/2 top-1/2 w-full h-1 blur-md"
                style={{
                  background: `linear-gradient(to right, ${colors.accent}60, transparent)`,
                  transformOrigin: 'left center',
                  transform: 'translateY(-50%) scaleX(1.5) rotate(-30deg)',
                }}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Shooting Stars */}
      {shootingStars.map(star => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: '120px',
            height: '2px',
            background: `linear-gradient(to right, ${colors.stars}, transparent)`,
            transform: `rotate(${star.angle}deg)`,
            boxShadow: `0 0 10px ${colors.accent}`,
          }}
        />
      ))}

      {/* Nebula */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`,
              background: `radial-gradient(circle, ${colors.accent}40, transparent)`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${15 + i * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Aurora (Night/Sunset Only) */}
      {(timeOfDay === 'night' || timeOfDay === 'sunset') && (
        <div className="absolute top-0 left-0 right-0 h-1/2 animate-aurora"
          style={{
            background: `linear-gradient(to bottom, ${colors.accent}20, #10b98120, transparent)`,
            filter: 'blur(40px)',
          }}
        />
      )}

      {/* Mountains */}
      <div className="absolute bottom-0 left-0 right-0 h-64 flex items-end justify-center">
        <div
          className="absolute bottom-0 w-full h-48 opacity-30"
          style={{
            background: `linear-gradient(to bottom, transparent, ${colors.sky[2]}40)`,
            clipPath: 'polygon(0 100%, 0 60%, 10% 50%, 20% 45%, 30% 55%, 40% 40%, 50% 35%, 60% 45%, 70% 40%, 80% 50%, 90% 45%, 100% 55%, 100% 100%)',
          }}
        />
        <div
          className="absolute bottom-0 w-full h-40 opacity-50"
          style={{
            background: `linear-gradient(to bottom, transparent, ${colors.sky[2]}80)`,
            clipPath: 'polygon(0 100%, 0 80%, 15% 70%, 25% 60%, 35% 65%, 45% 55%, 55% 50%, 65% 60%, 75% 55%, 85% 65%, 95% 60%, 100% 70%, 100% 100%)',
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: colors.accent,
              opacity: 0.3,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${20 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.3;transform:scale(1);}50%{opacity:1;transform:scale(1.2);} }
        @keyframes float { 0%,100%{transform:translate(0,0);}50%{transform:translate(-10px,-20px);} }
        @keyframes float-slow { 0%,100%{transform:translate(0,0);}50%{transform:translate(-20px,-40px);} }
        @keyframes aurora { 0%,100%{opacity:.3;transform:translateX(0);}50%{opacity:.6;transform:translateX(20px);} }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 25s ease-in-out infinite; }
        .animate-aurora { animation: aurora 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default MagicalCosmicBackground;