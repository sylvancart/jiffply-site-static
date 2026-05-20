const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const mobileBackdrop = document.querySelector("[data-mobile-backdrop]");
const menuCloseButtons = document.querySelectorAll("[data-menu-close]");
const revealItems = document.querySelectorAll(".reveal");
const faqButtons = document.querySelectorAll("[data-faq-button]");
const demoForm = document.querySelector("[data-demo-form]");

if (header) {
  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

if (menuToggle && mobilePanel) {
  let menuTimer;

  const closeMenu = ({ immediate = false } = {}) => {
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    mobilePanel.classList.remove("is-open");
    mobileBackdrop?.classList.remove("is-open");
    window.clearTimeout(menuTimer);

    const finish = () => {
      mobilePanel.hidden = true;
      if (mobileBackdrop) {
        mobileBackdrop.hidden = true;
      }
    };

    if (immediate) {
      finish();
      return;
    }

    menuTimer = window.setTimeout(finish, 260);
  };

  const openMenu = () => {
    window.clearTimeout(menuTimer);
    menuToggle.setAttribute("aria-expanded", "true");
    mobilePanel.hidden = false;
    if (mobileBackdrop) {
      mobileBackdrop.hidden = false;
    }
    document.body.classList.add("menu-open");

    window.requestAnimationFrame(() => {
      mobilePanel.classList.add("is-open");
      mobileBackdrop?.classList.add("is-open");
    });
  };

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuCloseButtons.forEach((button) => {
    button.addEventListener("click", () => closeMenu());
  });

  mobilePanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  mobileBackdrop?.addEventListener("click", () => closeMenu());

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960 && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu({ immediate: true });
    }
  });
}

if (revealItems.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealItems.forEach((item) => observer.observe(item));
}

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const expanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!expanded));
    if (panel) {
      panel.hidden = expanded;
    }
  });
});

if (demoForm) {
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = demoForm.querySelector("[data-form-status]");
    
    const nameInput = demoForm.querySelector("#name");
    const businessInput = demoForm.querySelector("#business");
    const channelSelect = demoForm.querySelector("#channel");
    const messageTextarea = demoForm.querySelector("#message");
    
    const name = nameInput ? nameInput.value.trim() : "";
    const business = businessInput ? businessInput.value.trim() : "";
    const channel = channelSelect ? channelSelect.value : "";
    const message = messageTextarea ? messageTextarea.value.trim() : "";
    
    // Store user data in session
    const submissionData = {
      name,
      business,
      channel,
      message,
      submittedAt: new Date().toISOString()
    };
    sessionStorage.setItem("jiffply_demo_submission", JSON.stringify(submissionData));

    if (status) {
      status.style.color = "var(--teal)";
      if (name && business) {
        status.textContent = `Thank you, ${name}! Your demo request for ${business} has been received successfully. We will reach out on ${channel}.`;
      } else if (name) {
        status.textContent = `Thank you, ${name}! Your demo request has been received successfully. We will reach out on ${channel}.`;
      } else {
        status.textContent = `Thank you! Your demo request has been received successfully. We will reach out on ${channel}.`;
      }
    }

    demoForm.reset();
  });
}


// ============================================================================
// JIFFPLY CORE v2.0 - CONVERSATION ENGINE INTERACTIVE PHYSICS
// ============================================================================

(function() {
  const canvas = document.getElementById("conversationEngineCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const wrapper = canvas.parentElement;

  let dpi = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;

  // Particle & Spark Arrays
  let activeFlows = [];
  let orbitParticles = [];
  let sparks = [];
  let time = 0;
  let coreScale = 1;
  let targetCoreScale = 1;

  // Mouse Interaction Parameters
  let mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    radius: 120,
    pullForce: 0.35
  };

  // Speed & Physics Configurations
  const engineModes = {
    reasoning: {
      speed: 0.006,
      spawnRate: 45,
      sparkColor: "#00ffcc",
      gravity: 0.2,
      orbitRadius: 40,
      orbitSpeed: 0.04,
      flowThickness: 1.5,
      coreGlow: "rgba(0, 255, 204, 0.25)"
    },
    turbo: {
      speed: 0.015,
      spawnRate: 15,
      sparkColor: "#00b3ff",
      gravity: 0.05,
      orbitRadius: 28,
      orbitSpeed: 0.08,
      flowThickness: 2.2,
      coreGlow: "rgba(0, 179, 255, 0.35)"
    },
    quantum: {
      speed: 0.009,
      spawnRate: 28,
      sparkColor: "#cc00ff",
      gravity: 0.4,
      orbitRadius: 52,
      orbitSpeed: 0.025,
      flowThickness: 1.8,
      coreGlow: "rgba(204, 0, 255, 0.28)"
    }
  };

  let activeMode = "reasoning";

  // Coordinates of Entry Nodes (as fractions of Canvas width/height)
  const entryNodes = [
    { name: "WhatsApp", xFraction: 0.16, yFraction: 0.28, color: "#25d366", initialAngle: Math.PI * 0.95 },
    { name: "Instagram", xFraction: 0.14, yFraction: 0.72, color: "#e1306c", initialAngle: Math.PI * 1.15 },
    { name: "Web Chat", xFraction: 0.86, yFraction: 0.28, color: "#00ffcc", initialAngle: Math.PI * 0.05 },
    { name: "Email", xFraction: 0.84, yFraction: 0.72, color: "#ffb300", initialAngle: Math.PI * 0.25 }
  ];

  // Helper: Get node coordinate
  const getNodePos = (node) => {
    return {
      x: node.xFraction * width,
      y: node.yFraction * height
    };
  };

  // Helper: Cubic Bezier formula
  const getBezierPoint = (t, p0, p1, p2, p3) => {
    const cX = 3 * (p1.x - p0.x);
    const bX = 3 * (p2.x - p1.x) - cX;
    const aX = p3.x - p0.x - cX - bX;

    const cY = 3 * (p1.y - p0.y);
    const bY = 3 * (p2.y - p1.y) - cY;
    const aY = p3.y - p0.y - cY - bY;

    const x = ((aX * t + bX) * t + cX) * t + p0.x;
    const y = ((aY * t + bY) * t + cY) * t + p0.y;

    return { x, y };
  };

  // Resize canvas with high DPI adjustments
  const handleResize = () => {
    const rect = wrapper.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    ctx.scale(dpi, dpi);
  };

  // Modern ResizeObserver to handle dynamic layout shifts and eliminate canvas stretching/distortion
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", handleResize);
  }
  
  handleResize();
  
  // Settle again after page fully loads and layout stabilizes
  window.addEventListener("load", () => {
    handleResize();
  });
  
  // Rapid settle timeout for flex containers
  setTimeout(handleResize, 150);

  // Mouse Tracking Setup
  const viewport = document.querySelector(".canvas-viewport-wrapper");
  if (viewport) {
    viewport.addEventListener("mousemove", (e) => {
      const rect = viewport.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;

      // Update interactive border shine variable
      viewport.style.setProperty("--mouse-x", `${(mouse.targetX / rect.width) * 100}%`);
      viewport.style.setProperty("--mouse-y", `${(mouse.targetY / rect.height) * 100}%`);
    });

    viewport.addEventListener("mouseleave", () => {
      mouse.active = false;
      mouse.targetX = width / 2;
      mouse.targetY = height / 2;
    });

    viewport.addEventListener("click", (e) => {
      const rect = viewport.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      spawnSparks(clickX, clickY, 35, engineModes[activeMode].sparkColor);
      targetCoreScale = 1.35;
    });
  }

  // Initialize Core Orbit Particles
  const initOrbitals = () => {
    orbitParticles = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      orbitParticles.push({
        angle: (i / count) * Math.PI * 2,
        radiusOffset: Math.random() * 12 - 6,
        size: Math.random() * 1.5 + 0.6,
        speedFactor: Math.random() * 0.4 + 0.8,
        opacity: Math.random() * 0.6 + 0.3
      });
    }
  };
  initOrbitals();

  // Sparks Emitter Physics
  const spawnSparks = (x, y, count, color) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.8 + 1.2;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 0.8,
        color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  };

  // Switch Engine Modes
  const selectorBtns = document.querySelectorAll("[data-engine-mode]");
  selectorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectorBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeMode = btn.getAttribute("data-engine-mode");
      
      // Trigger dynamic radial shockwave
      spawnSparks(width / 2, height / 2, 40, engineModes[activeMode].sparkColor);
      targetCoreScale = 1.45;
    });
  });

  // Flow Generator: Spawn an incoming conversational particle
  const spawnFlowParticle = () => {
    const randomNode = entryNodes[Math.floor(Math.random() * entryNodes.length)];
    const start = getNodePos(randomNode);
    const core = { x: width / 2, y: height / 2 };

    // Bezier control points to create organic routing curves
    const controlOffset = width * 0.22;
    const cp1 = {
      x: start.x + Math.cos(randomNode.initialAngle) * controlOffset,
      y: start.y + Math.sin(randomNode.initialAngle) * controlOffset
    };
    
    // Curve coordinates that lead gracefully into the center core
    const cp2 = {
      x: core.x - (core.x - start.x) * 0.4 + (Math.random() * 20 - 10),
      y: core.y - (core.y - start.y) * 0.4 + (Math.random() * 20 - 10)
    };

    activeFlows.push({
      t: 0,
      speed: engineModes[activeMode].speed * (Math.random() * 0.35 + 0.85),
      start,
      cp1,
      cp2,
      core,
      color: randomNode.color,
      size: Math.random() * 2 + 1.2,
      history: [],
      stage: "inbound", // "inbound", "orbit", "outbound"
      orbitAngle: Math.random() * Math.PI * 2,
      orbitTimer: 0,
      orbitMax: Math.floor(Math.random() * 60) + 40,
      outboundAngle: Math.random() * Math.PI * 2
    });
  };

  // Core Render & Physics Loop
  const loop = () => {
    time += 0.02;
    ctx.clearRect(0, 0, width, height);

    const coreX = width / 2;
    const coreY = height / 2;

    // Smooth Mouse position interpolation (lerp)
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
    } else {
      mouse.x += (coreX - mouse.x) * 0.08;
      mouse.y += (coreY - mouse.y) * 0.08;
    }

    // Spawn Particles periodically
    if (Math.floor(Math.random() * engineModes[activeMode].spawnRate) === 0) {
      spawnFlowParticle();
    }

    // Core Scale transition
    coreScale += (targetCoreScale - coreScale) * 0.1;
    targetCoreScale += (1.0 - targetCoreScale) * 0.15;

    const modeCfg = engineModes[activeMode];

    // ==========================================
    // 1. RENDER CHANNELS & BACKGROUND WIREFRAMES
    // ==========================================
    ctx.strokeStyle = "rgba(255, 255, 255, 0.022)";
    ctx.lineWidth = 1.0;
    
    // Draw concentric core orbit rings
    ctx.beginPath();
    ctx.arc(coreX, coreY, modeCfg.orbitRadius * 1.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(coreX, coreY, modeCfg.orbitRadius * 2.8, 0, Math.PI * 2);
    ctx.stroke();

    // Draw vector wireframe paths connecting nodes
    entryNodes.forEach((node) => {
      const pos = getNodePos(node);
      
      // Node wire connecting lines
      // Node wire connecting lines (particles flow towards these coordinate hooks)
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.bezierCurveTo(
        pos.x + Math.cos(node.initialAngle) * (width * 0.22),
        pos.y + Math.sin(node.initialAngle) * (width * 0.22),
        coreX - (coreX - pos.x) * 0.4,
        coreY - (coreY - pos.y) * 0.4,
        coreX,
        coreY
      );
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // ==========================================
    // 2. PHYSICS & RENDERING FOR ACTIVE PARTICLES
    // ==========================================
    for (let i = activeFlows.length - 1; i >= 0; i--) {
      const p = activeFlows[i];
      let currentPos = { x: 0, y: 0 };

      if (p.stage === "inbound") {
        p.t += p.speed;
        
        // Calculate point on bezier trajectory
        currentPos = getBezierPoint(p.t, p.start, p.cp1, p.cp2, p.core);

        // Magnetic Pull Field deformation
        if (mouse.active) {
          const dx = mouse.x - currentPos.x;
          const dy = mouse.y - currentPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const pull = (1.0 - dist / mouse.radius) * mouse.pullForce;
            currentPos.x += dx * pull;
            currentPos.y += dy * pull;
          }
        }

        // Particle reached Core
        if (p.t >= 1.0) {
          p.stage = "orbit";
          targetCoreScale = 1.12;
        }
      } 
      
      else if (p.stage === "orbit") {
        p.orbitTimer++;
        p.orbitAngle += modeCfg.orbitSpeed * p.speedFactor;

        // Circular orbit physics with mathematical pulse scaling
        const radius = modeCfg.orbitRadius + Math.sin(time * 3 + p.orbitAngle) * 5;
        currentPos.x = coreX + Math.cos(p.orbitAngle) * radius;
        currentPos.y = coreY + Math.sin(p.orbitAngle) * radius;

        // Pull core coordinates slightly to mouse in orbit phase
        if (mouse.active) {
          const dx = mouse.x - currentPos.x;
          const dy = mouse.y - currentPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const pull = (1.0 - dist / mouse.radius) * mouse.pullForce * 0.4;
            currentPos.x += dx * pull;
            currentPos.y += dy * pull;
          }
        }

        // Reasoning completed -> discharge outbound
        if (p.orbitTimer >= p.orbitMax) {
          p.stage = "outbound";
          p.t = 0;
          
          // Velocity metrics for outbound path direction
          p.vx = Math.cos(p.outboundAngle) * (modeCfg.speed * 450);
          p.vy = Math.sin(p.outboundAngle) * (modeCfg.speed * 450);
          
          // Generate micro sparkles on exit discharge
          spawnSparks(coreX, coreY, 6, p.color);
        }
      } 
      
      else if (p.stage === "outbound") {
        // Direct linear acceleration outward to bottom-right (grid breaking effect)
        p.t += 0.02;
        p.vx += 0.15;
        p.vy += 0.18;
        
        currentPos.x = coreX + p.vx * p.t;
        currentPos.y = coreY + p.vy * p.t;

        // Magnetic bend on outbound discharge
        if (mouse.active) {
          const dx = mouse.x - currentPos.x;
          const dy = mouse.y - currentPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const pull = (1.0 - dist / mouse.radius) * mouse.pullForce * 0.3;
            currentPos.x += dx * pull;
            currentPos.y += dy * pull;
          }
        }

        // Delete particles that escape the grid viewport
        if (currentPos.x > width + 40 || currentPos.y > height + 40 || currentPos.x < -40 || currentPos.y < -40) {
          activeFlows.splice(i, 1);
          continue;
        }
      }

      // Add to trailing history to build fluid trails
      p.history.push({ x: currentPos.x, y: currentPos.y });
      if (p.history.length > 8) p.history.shift();

      // Render the Flow Trails
      if (p.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.history[0].x, p.history[0].y);
        for (let h = 1; h < p.history.length; h++) {
          ctx.lineTo(p.history[h].x, p.history[h].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = modeCfg.flowThickness;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Render the Flow Core node bead
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // reset blur
    }

    // ==========================================
    // 3. RENDER CORE ORB & CONCENTRIC PULSES
    // ==========================================
    
    // Core Outer Ambient glow layer
    const coreGlowRad = (38 * coreScale) + Math.sin(time * 3) * 3;
    const radialGlow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreGlowRad * 1.65);
    radialGlow.addColorStop(0, modeCfg.coreGlow);
    radialGlow.addColorStop(1, "transparent");
    
    ctx.beginPath();
    ctx.arc(coreX, coreY, coreGlowRad * 1.65, 0, Math.PI * 2);
    ctx.fillStyle = radialGlow;
    ctx.fill();

    // Solid inner luxury obsidian core ring
    ctx.beginPath();
    ctx.arc(coreX, coreY, 18 * coreScale, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(4, 4, 8, 0.95)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // High intensity neon core dot
    ctx.beginPath();
    ctx.arc(coreX, coreY, 4 * coreScale, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = modeCfg.sparkColor;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Orbiting micro core systems (The Reasoning Orbs)
    orbitParticles.forEach((op) => {
      op.angle += modeCfg.orbitSpeed * op.speedFactor * 0.8;
      const radius = modeCfg.orbitRadius + op.radiusOffset;
      const opX = coreX + Math.cos(op.angle) * radius;
      const opY = coreY + Math.sin(op.angle) * radius;

      ctx.beginPath();
      ctx.arc(opX, opY, op.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${op.opacity})`;
      ctx.fill();
    });

    // Elegant text labels below the core
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.font = "700 7px monospace";
    ctx.textAlign = "center";
    ctx.fillText("JIFFPLY CORE ENGINE", coreX, coreY + modeCfg.orbitRadius + 24);

    // ==========================================
    // 4. PHYSICS & RENDERING FOR RIPPLE SPARKS
    // ==========================================
    for (let k = sparks.length - 1; k >= 0; k--) {
      const sp = sparks[k];
      sp.x += sp.vx;
      sp.y += sp.vy;
      
      // Add simulated friction and air resistance
      sp.vx *= 0.96;
      sp.vy *= 0.96;
      
      sp.life -= sp.decay;

      if (sp.life <= 0) {
        sparks.splice(k, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.life * 0.95;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(loop);
  };

  // Trial registration form event hook
  const waitlistForm = document.getElementById("heroWaitlistForm");
  if (waitlistForm) {
    const input = waitlistForm.querySelector(".waitlist-input");
    const feedback = waitlistForm.querySelector("[data-waitlist-status]");
    const submitBtn = waitlistForm.querySelector(".btn-waitlist-submit");
    
    // Check if email already registered in localStorage
    const savedEmail = localStorage.getItem("jiffply_trial_email");
    if (savedEmail) {
      if (input) {
        input.value = savedEmail;
        input.disabled = true;
      }
      if (submitBtn) {
        submitBtn.innerHTML = "<span>Active Trial</span>";
        submitBtn.disabled = true;
        submitBtn.style.background = "#00ffcc";
        submitBtn.style.color = "#030306";
      }
      if (feedback) {
        feedback.textContent = "You already have an active trial account setup!";
        feedback.className = "waitlist-feedback success";
      }
    }
    
    waitlistForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!input || !feedback) return;
      const email = input.value.trim();
      if (!email) return;
      
      // Persist in localStorage
      localStorage.setItem("jiffply_trial_email", email);
      
      feedback.textContent = "";
      feedback.className = "waitlist-feedback";
      
      if (submitBtn) {
        submitBtn.innerHTML = "<span>Registering...</span>";
        submitBtn.disabled = true;
      }
      
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = "<span>Trial Activated!</span>";
          submitBtn.style.background = "#00ffcc";
          submitBtn.style.color = "#030306";
        }
        input.disabled = true;
        
        // Celebratory shockwave wave on the central reasoning canvas!
        spawnSparks(width / 2, height / 2, 45, "#00ffcc");
        targetCoreScale = 1.45;
        
        feedback.textContent = `Success! Setting up your trial account... check your email to activate.`;
        feedback.classList.add("success");
      }, 1000);
    });
  }

  // Start Rendering Loop
  requestAnimationFrame(loop);
})();
