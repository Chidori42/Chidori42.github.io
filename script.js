// Language translations
const translations = {
  en: {
    nav: {
      about: "About",
      projects: "Projects",
      skills: "Skills",
      education: "Education",
      contact: "Contact",
    },
    hero: {
      greeting: "Hello, I'm",
      name: "Abdellatif",
      description:
        "Passionate Web Developer from 1337 Coding School, crafting innovative digital experiences with modern technologies",
      viewWork: "View My Work",
      getInTouch: "Get In Touch",
    },
    about: {
      title: "About Me",
      text1:
        "I'm a passionate web developer with hands-on training from 1337 Coding School in Morocco. With a bachelor's degree and a drive for innovation, I've developed expertise in both front-end and back-end development.",
      text2:
        "My experience at 1337 immersed me in real-world projects and modern technologies. Through collaborative learning, I gained the skills to build dynamic, user-friendly web applications.",
      text3:
        "I bring a blend of creativity and technical know-how to every project—from concept to launch. Whether working solo or with a team, I focus on creating meaningful contributions to the ever-evolving world of technology.",
      technical: "Technical Expertise",
      technicalDesc: "Proficient in modern web technologies including React, Node.js, and database systems",
      problem: "Problem Solving",
      problemDesc: "Passionate about solving complex problems and crafting clean, efficient code",
      user: "User-Focused",
      userDesc: "Creating seamless, engaging digital experiences that deliver real impact",
      innovation: "Innovation",
      innovationDesc: "Always exploring new frameworks and staying up to date with tech trends",
    },
    projects: {
      title: "My Projects",
      description:
        "Here are some of my featured projects that showcase my skills and expertise in various technologies",
    },
    skills: {
      title: "My Skills",
      description: "Technologies and programming languages I work with",
      learning: "Always Learning",
      learningDesc:
        "I'm constantly expanding my skillset and exploring new technologies to stay at the forefront of web development.",
      projects: "Projects",
      years: "Years Learning",
    },
    education: {
      title: "My Education",
      description: "My educational journey that shaped my skills and perspective",
    },
    contact: {
      title: "Get In Touch",
      description: "Let's work together to bring your ideas to life. I'm always open to discussing new opportunities.",
      letsTalk: "Let's Talk",
      intro:
        "I'm always interested in hearing about new projects and opportunities. Whether you're a company looking to hire, or you're someone looking to collaborate, I'd love to hear from you.",
      email: "Email",
      location: "Location",
      available: "Available for Work",
      availableDesc:
        "I'm currently open to new opportunities and collaborations. Let's create something amazing together!",
      name: "Name",
      message: "Message",
      send: "Send Message",
    },
    cv: {
      download: "Download CV",
      view: "View CV",
    },
  },
  fr: {
    nav: {
      about: "À Propos",
      projects: "Projets",
      skills: "Compétences",
      education: "Formation",
      contact: "Contact",
    },
    hero: {
      greeting: "Bonjour, je suis",
      name: "Abdellatif",
      description:
        "Développeur Web passionné de l'École de Codage 1337, créant des expériences numériques innovantes avec des technologies modernes",
      viewWork: "Voir Mon Travail",
      getInTouch: "Me Contacter",
    },
    about: {
      title: "À Propos de Moi",
      text1:
        "Je suis un développeur web passionné avec une formation pratique de l'École de Codage 1337 au Maroc. Avec un diplôme de licence et une passion pour l'innovation, j'ai développé une expertise en développement front-end et back-end.",
      text2:
        "Mon expérience à 1337 m'a immergé dans des projets du monde réel et des technologies modernes. Grâce à l'apprentissage collaboratif, j'ai acquis les compétences pour créer des applications web dynamiques et conviviales.",
      text3:
        "J'apporte un mélange de créativité et de savoir-faire technique à chaque projet—du concept au lancement. Que ce soit en travaillant seul ou en équipe, je me concentre sur la création de contributions significatives au monde en constante évolution de la technologie.",
      technical: "Expertise Technique",
      technicalDesc:
        "Compétent dans les technologies web modernes incluant React, Node.js, et les systèmes de base de données",
      problem: "Résolution de Problèmes",
      problemDesc: "Passionné par la résolution de problèmes complexes et la création de code propre et efficace",
      user: "Centré sur l'Utilisateur",
      userDesc: "Création d'expériences numériques fluides et engageantes qui ont un impact réel",
      innovation: "Innovation",
      innovationDesc:
        "Toujours en train d'explorer de nouveaux frameworks et de rester à jour avec les tendances technologiques",
    },
    projects: {
      title: "Mes Projets",
      description:
        "Voici quelques-uns de mes projets phares qui démontrent mes compétences et mon expertise dans diverses technologies",
    },
    skills: {
      title: "Mes Compétences",
      description: "Technologies et langages de programmation avec lesquels je travaille",
      learning: "Toujours en Apprentissage",
      learningDesc:
        "J'élargis constamment mes compétences et j'explore de nouvelles technologies pour rester à la pointe du développement web.",
      projects: "Projets",
      years: "Années d'Apprentissage",
    },
    education: {
      title: "Ma Formation",
      description: "Mon parcours éducatif qui a façonné mes compétences et ma perspective",
    },
    contact: {
      title: "Entrer en Contact",
      description:
        "Travaillons ensemble pour donner vie à vos idées. Je suis toujours ouvert à discuter de nouvelles opportunités.",
      letsTalk: "Parlons",
      intro:
        "Je suis toujours intéressé d'entendre parler de nouveaux projets et opportunités. Que vous soyez une entreprise cherchant à embaucher, ou quelqu'un cherchant à collaborer, j'aimerais avoir de vos nouvelles.",
      email: "Email",
      location: "Localisation",
      available: "Disponible pour le Travail",
      availableDesc:
        "Je suis actuellement ouvert à de nouvelles opportunités et collaborations. Créons quelque chose d'incroyable ensemble!",
      name: "Nom",
      message: "Message",
      send: "Envoyer le Message",
    },
    cv: {
      download: "Télécharger CV",
      view: "Voir CV",
    },
  },
}

// Global variables
let currentLanguage = "en"
let isDarkMode = false
let isMobileMenuOpen = false

// DOM elements
const themeToggle = document.getElementById("theme-toggle")
const langToggle = document.getElementById("lang-toggle")
const langText = document.getElementById("lang-text")
const mobileMenuBtn = document.getElementById("mobile-menu-btn")
const mobileMenu = document.getElementById("mobile-menu")
const navLinks = document.querySelectorAll(".nav-link")
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")

// Initialize the website
document.addEventListener("DOMContentLoaded", () => {
  initializeTheme()
  initializeLanguage()
  initializeNavigation()
  initializeSkillBars()
  initializeScrollEffects()

  // Event listeners
  themeToggle.addEventListener("click", toggleTheme)
  langToggle.addEventListener("click", toggleLanguage)
  mobileMenuBtn.addEventListener("click", toggleMobileMenu)

  // Navigation event listeners
  ;[...navLinks, ...mobileNavLinks].forEach((link) => {
    link.addEventListener("click", handleNavClick)
  })

  // Smooth scrolling for hero buttons
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      closeMobileMenu()
    }
  })

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMobileMenu()
    }
  })
})

// Theme functions
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    isDarkMode = savedTheme === "dark"
  } else {
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  }
  applyTheme()
}

function toggleTheme() {
  isDarkMode = !isDarkMode
  applyTheme()
  localStorage.setItem("theme", isDarkMode ? "dark" : "light")
}

function applyTheme() {
  if (isDarkMode) {
    document.body.setAttribute("data-theme", "dark")
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
  } else {
    document.body.removeAttribute("data-theme")
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
  }
}

// Language functions
function initializeLanguage() {
  const savedLanguage = localStorage.getItem("language")
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage
  }
  applyLanguage()
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "fr" : "en"
  applyLanguage()
  localStorage.setItem("language", currentLanguage)
}

function applyLanguage() {
  langText.textContent = currentLanguage.toUpperCase()

  // Update all elements with data attributes
  document.querySelectorAll("[data-en][data-fr]").forEach((element) => {
    const text = element.getAttribute(`data-${currentLanguage}`)
    if (text) {
      element.textContent = text
    }
  })
}

// Navigation functions
function initializeNavigation() {
  updateActiveNavLink()
  window.addEventListener("scroll", throttle(updateActiveNavLink, 100))
}

function handleNavClick(e) {
  e.preventDefault()
  const targetId = this.getAttribute("href").substring(1)
  const targetElement = document.getElementById(targetId)

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  closeMobileMenu()
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]")
  const scrollPos = window.scrollY + 100

  sections.forEach((section) => {
    const top = section.offsetTop
    const height = section.offsetHeight
    const id = section.getAttribute("id")

    if (scrollPos >= top && scrollPos < top + height) {
      // Remove active class from all nav links
      ;[...navLinks, ...mobileNavLinks].forEach((link) => {
        link.classList.remove("active")
      })

      // Add active class to current section links
      document.querySelectorAll(`a[href="#${id}"]`).forEach((link) => {
        link.classList.add("active")
      })
    }
  })
}

function toggleMobileMenu() {
  isMobileMenuOpen = !isMobileMenuOpen

  if (isMobileMenuOpen) {
    mobileMenu.classList.add("active")
    mobileMenu.style.display = "flex"
    mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>'
    document.body.style.overflow = "hidden"
  } else {
    closeMobileMenu()
  }
}

function closeMobileMenu() {
  isMobileMenuOpen = false
  mobileMenu.classList.remove("active")
  mobileMenu.style.display = "none"
  mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>'
  document.body.style.overflow = "auto"
}

// Skill bars animation
function initializeSkillBars() {
  const skillBars = document.querySelectorAll(".skill-progress")

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const skillBar = entry.target
          const width = skillBar.getAttribute("data-width")

          skillBar.style.setProperty("--skill-width", width + "%")
          skillBar.style.width = width + "%"
          skillBar.classList.add("animate")

          observer.unobserve(skillBar)
        }
      })
    },
    {
      threshold: 0.5,
    },
  )

  skillBars.forEach((bar) => {
    observer.observe(bar)
  })
}

// Scroll effects
function initializeScrollEffects() {
  // Parallax effect for hero background elements
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const bgElements = document.querySelectorAll(".bg-element")

    bgElements.forEach((element, index) => {
      const speed = 0.5 + index * 0.1
      element.style.transform = `translateY(${scrolled * speed}px)`
    })
  })

  // Fade in animation for cards
  const cards = document.querySelectorAll(".highlight-card, .project-card, .education-card")

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }
      })
    },
    {
      threshold: 0.1,
    },
  )

  cards.forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    cardObserver.observe(card)
  })
}

// Utility functions
function throttle(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Form handling
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      // Add loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.innerHTML

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>'
      submitBtn.disabled = true

      // Reset button after a delay (form will submit normally)
      setTimeout(() => {
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
      }, 2000)
    })
  }
})

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.getElementById("header")
  if (window.scrollY > 50) {
    header.style.background = isDarkMode ? "rgba(31, 41, 55, 0.98)" : "rgba(255, 255, 255, 0.98)"
    header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
  } else {
    header.style.background = isDarkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)"
    header.style.boxShadow = "none"
  }
})

// Smooth reveal animations
const revealElements = document.querySelectorAll(".section-header, .about-text, .skills-bars, .contact-info")

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  },
  {
    threshold: 0.15,
  },
)

revealElements.forEach((element) => {
  element.style.opacity = "0"
  element.style.transform = "translateY(30px)"
  element.style.transition = "opacity 0.8s ease, transform 0.8s ease"
  revealObserver.observe(element)
})
