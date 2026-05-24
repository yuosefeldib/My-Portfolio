tsParticles.load("tsparticles", {
  background: {
    color: {
      value: "#0b0f19"
    }
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: "#ffffff"
    },
    links: {
      enable: false
    },
    move: {
      direction: "bottom",
      enable: true,
      outModes: {
        default: "out"
      },
      random: true,
      speed: 1,
      straight: false
    },
    number: {
      value: 80
    },
    opacity: {
      value: 0.5
    },
    shape: {
      type: "circle"
    },
    size: {
      value: { min: 1, max: 3 }
    }
  },
  detectRetina: true
});
