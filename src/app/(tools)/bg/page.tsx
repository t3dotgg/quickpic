"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const backgroundEffects = [
  {
    name: "Starry Night",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Flowing Waves",
    component: () => (
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M0 50 Q250 0 500 50 T1000 50 T1500 50 T2000 50"
          fill="none"
          stroke="rgba(59, 130, 246, 0.5)"
          strokeWidth="2"
          animate={{
            d: [
              "M0 50 Q250 0 500 50 T1000 50 T1500 50 T2000 50",
              "M0 50 Q250 100 500 50 T1000 50 T1500 50 T2000 50",
              "M0 50 Q250 0 500 50 T1000 50 T1500 50 T2000 50",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 70 Q250 20 500 70 T1000 70 T1500 70 T2000 70"
          fill="none"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="2"
          animate={{
            d: [
              "M0 70 Q250 20 500 70 T1000 70 T1500 70 T2000 70",
              "M0 70 Q250 120 500 70 T1000 70 T1500 70 T2000 70",
              "M0 70 Q250 20 500 70 T1000 70 T1500 70 T2000 70",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    ),
  },
  {
    name: "Electric Pulse",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-purple-500 opacity-50"
            style={{
              width: "2px",
              height: "100%",
              left: `${(i + 1) * 20}%`,
            }}
            animate={{
              scaleY: [0, 1, 0],
              y: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Orbital Rings",
    component: () => (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-cyan-500"
            style={{
              width: `${(i + 1) * 25}%`,
              height: `${(i + 1) * 25}%`,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20 / (i + 1),
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Prismatic Glow",
    component: () => {
      const colors = ["#ff0080", "#7928ca", "#0070f3", "#00b4d8", "#00f5d4"];
      return (
        <div className="absolute inset-0 overflow-hidden">
          {colors.map((color, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full blur-3xl"
              style={{
                backgroundColor: color,
                width: "50%",
                height: "50%",
                top: "25%",
                left: "25%",
              }}
              animate={{
                x: ["-25%", "25%", "-25%"],
                y: ["-25%", "25%", "-25%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      );
    },
  },
  {
    name: "Particle Drift",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              top: `${Math.random() * 100}%`,
              left: `-5%`,
            }}
            animate={{
              x: ["0%", "105%"],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Data Stream",
    component: () => (
      <div className="absolute inset-0 overflow-hidden font-mono text-xs text-green-500">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute whitespace-nowrap"
            style={{
              top: `${(i + 1) * 5}%`,
              left: "100%",
            }}
            animate={{
              x: [0, "-100%"],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(50)].map(() => Math.round(Math.random())).join("")}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    name: "Digital Fingerprint",
    component: () => (
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[...Array(5)].map((_, i) => (
          <motion.path
            key={i}
            d={`M${50 + i * 20},0 Q${75 + i * 20},${50 + i * 10} ${50 + i * 20},100`}
            fill="none"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
            animate={{
              pathLength: [0, 1],
              pathOffset: [0, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}
      </svg>
    ),
  },
  {
    name: "Geometric Morph",
    component: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-64 w-64 border-4 border-purple-500"
          animate={{
            rotate: 360,
            borderRadius: ["0%", "50%", "0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    ),
  },
  {
    name: "Constellation Connect",
    component: () => {
      const points = [...Array(10)].map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r="2"
              fill="#fff"
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
          {points.map((point, i) =>
            points.slice(i + 1).map((nextPoint, j) => (
              <motion.line
                key={`${i}-${j}`}
                x1={`${point.x}%`}
                y1={`${point.y}%`}
                x2={`${nextPoint.x}%`}
                y2={`${nextPoint.y}%`}
                stroke="#fff"
                strokeWidth="0.5"
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: (i + j) * 0.1,
                }}
              />
            )),
          )}
        </svg>
      );
    },
  },
  {
    name: "Neon Pulse",
    component: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i + 1) * 100}px`,
              height: `${(i + 1) * 100}px`,
              border: "2px solid #ff00ff",
              boxShadow: "0 0 20px #ff00ff",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Matrix Rain",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute whitespace-nowrap font-mono text-sm text-green-500"
            style={{
              top: `-20%`,
              left: `${i * 5}%`,
            }}
            animate={{
              y: ["0%", "120%"],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(20)]
              .map(() => String.fromCharCode(Math.floor(Math.random() * 128)))
              .join("")}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    name: "Firefly Swarm",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-yellow-300"
            style={{
              width: "4px",
              height: "4px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Plasma Field",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        <svg width="100%" height="100%">
          <filter id="plasma">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="2"
              seed="1"
            />
            <feDisplacementMap in="SourceGraphic" scale="170" />
          </filter>
          <motion.rect
            width="100%"
            height="100%"
            filter="url(#plasma)"
            animate={{
              "--tw-hue-rotate": ["0deg", "360deg"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="opacity-50 hue-rotate-15"
            style={{
              fill: "hsl(250, 100%, 50%)",
            }}
          />
        </svg>
      </div>
    ),
  },
  {
    name: "Quantum Particles",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: "8px",
              height: "8px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Nebula Cloud",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    ),
  },
  {
    name: "Glitch Effect",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-black"
          animate={{
            clipPath: [
              "inset(0% 0% 0% 0%)",
              "inset(10% -5% 85% -5%)",
              "inset(85% -5% -5% -5%)",
              "inset(40% -5% 40% -5%)",
              "inset(0% 0% 0% 0%)",
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />
      </div>
    ),
  },
  {
    name: "Ripple Effect",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-blue-500"
            style={{
              width: "10vmin",
              height: "10vmin",
              top: "50%",
              left: "50%",
            }}
            animate={{
              scale: [1, 5],
              opacity: [1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Aurora Borealis",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to left, #43e97b 0%, #38f9d7 100%)",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>
    ),
  },
  {
    name: "Floating Bubbles",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-200 opacity-50"
            style={{
              width: `${Math.random() * 50 + 10}px`,
              height: `${Math.random() * 50 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: "100%",
            }}
            animate={{
              y: [0, "-100vh"],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Fractal Tree",
    component: () => (
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M250,450 L250,350"
          stroke="#4CAF50"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M250,450 L250,350",
              "M250,450 L250,350 M250,350 L200,250 M250,350 L300,250",
              "M250,450 L250,350 M250,350 L200,250 M250,350 L300,250 M200,250 L175,200 M200,250 L225,200 M300,250 L275,200 M300,250 L325,200",
            ],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </svg>
    ),
  },
  {
    name: "Spiral Vortex",
    component: () => (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          className="h-0 w-0 border-b-[200px] border-l-[200px] border-r-[200px] border-t-[200px] border-b-transparent border-l-transparent border-r-blue-500 border-t-transparent"
          animate={{
            rotate: 360,
            scale: [1, 0.5, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    ),
  },
  {
    name: "Pulsating Grid",
    component: () => (
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-2 p-4">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="rounded-md bg-purple-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Liquid Swirl",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #ff0000, #00ff00, #0000ff)",
            filter: "blur(30px)",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    ),
  },
  {
    name: "Neon Trails",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        <svg className="h-full w-full">
          <motion.path
            d="M0,50 Q250,0 500,50 T1000,50"
            fill="none"
            stroke="url(#neon-gradient)"
            strokeWidth="4"
            animate={{
              d: [
                "M0,50 Q250,0 500,50 T1000,50",
                "M0,50 Q250,100 500,50 T1000,50",
                "M0,50 Q250,0 500,50 T1000,50",
              ],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient
              id="neon-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ff00de" />
              <stop offset="50%" stopColor="#00ff00" />
              <stop offset="100%" stopColor="#00ffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
  },
  {
    name: "Cosmic Dust",
    component: () => (
      <div className="absolute inset-0 overflow-hidden bg-black">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    name: "Digital Rain",
    component: () => (
      <div className="absolute inset-0 overflow-hidden bg-black">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute whitespace-nowrap font-mono text-xs text-green-500"
            style={{
              top: `-20%`,
              left: `${i * 5}%`,
            }}
            animate={{
              y: ["0%", "120%"],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(20)]
              .map(() => String.fromCharCode(Math.floor(Math.random() * 128)))
              .join("")}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    name: "Geometric Kaleidoscope",
    component: () => (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          className="h-64 w-64 bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{
            rotate: 360,
            scale: [1, 1.5, 1],
            borderRadius: ["0%", "50%", "0%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    ),
  },
  {
    name: "Hypnotic Spiral",
    component: () => (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <svg className="h-64 w-64" viewBox="0 0 100 100">
          <motion.path
            d="M50,50 m0,-45 a45,45 0 1,1 0,90 a45,45 0 1,1 0,-90"
            fill="none"
            stroke="url(#spiral-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            animate={{
              pathLength: [0, 1],
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <defs>
            <linearGradient
              id="spiral-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ff00de" />
              <stop offset="50%" stopColor="#00ff00" />
              <stop offset="100%" stopColor="#00ffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
  },
  {
    name: "Ethereal Mist",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          // @ts-expect-error: Framer Motion types are not correct
          className="absolute inset-0 opacity-50"
          style={{
            background: "linear-gradient(45deg, #00ffff, #ff00ff)",
            filter: "blur(100px)",
          }}
          animate={{
            x: ["-25%", "25%", "-25%"],
            y: ["-25%", "25%", "-25%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    ),
  },
  {
    name: "Cyber Circuit",
    component: () => (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <svg className="h-full w-full">
          <motion.path
            d="M0,50 L100,50 M50,0 L50,100 M0,0 L100,100 M0,100 L100,0"
            stroke="#00ff00"
            strokeWidth="0.5"
            fill="none"
            animate={{
              pathLength: [0, 1],
              pathOffset: [0, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>
      </div>
    ),
  },
  {
    name: "Quantum Entanglement",
    component: () => (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500"
            style={{
              width: "10px",
              height: "10px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    ),
  },
];

export default function AnimatedBackgrounds() {
  const [currentEffect, setCurrentEffect] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const CurrentEffect = backgroundEffects[currentEffect].component;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900">
      {isClient && <CurrentEffect />}
      <div className="relative z-10 p-4 text-center">
        <h1 className="mb-8 text-4xl font-bold text-white">
          Animated Dark Backgrounds
        </h1>
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
          {backgroundEffects.map((effect, index) => (
            <Button
              key={effect.name}
              onClick={() => setCurrentEffect(index)}
              variant={currentEffect === index ? "default" : "outline"}
            >
              {effect.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
