// Theme toggle and saved preference
document.querySelector("#current-year").textContent = new Date().getFullYear();

const siteLoader = document.querySelector("#site-loader");
window.setTimeout(() => {
  siteLoader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
  window.setTimeout(() => siteLoader.remove(), 450);
}, 3550);

const rootElement = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle.querySelector("span");

function setTheme(theme) {
  rootElement.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggle.setAttribute(
    "aria-label",
    `Switch to ${isDark ? "light" : "dark"} theme`,
  );
  themeIcon.textContent = isDark ? "\u2600" : "\u263e";
  document.querySelector('meta[name="theme-color"]').content = isDark
    ? "#131b18"
    : "#f7f8f5";
}

const savedTheme = localStorage.getItem("portfolio-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
setTheme(savedTheme || preferredTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = rootElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
});

// Mobile navigation
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const navigationLinks = [...document.querySelectorAll(".nav-link")];

function closeMenu() {
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
});

navigationLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// Highlight the section currently in view
const sections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-25% 0px -60% 0px" },
);

sections.forEach((section) => sectionObserver.observe(section));

// Reveal content as it enters the viewport
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);

revealElements.forEach((element) => revealObserver.observe(element));

// Back-to-top control
const backToTop = document.querySelector(".back-to-top");

window.addEventListener(
  "scroll",
  () => {
    backToTop.classList.toggle("visible", window.scrollY > 500);
  },
  { passive: true },
);

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Validate the form and prepare an email in the visitor's email app.
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const formFields = [...contactForm.querySelectorAll("input, textarea")];
const submitButton = contactForm.querySelector('button[type="submit"]');
const contactEmail = "Getachewshifera27@gmail.com";
const emailJsServiceId = "YOUR_EMAILJS_SERVICE_ID";
const emailJsTemplateId = "YOUR_EMAILJS_TEMPLATE_ID";
const emailJsPublicKey = "YOUR_EMAILJS_PUBLIC_KEY";

const emailJsIsConfigured = [
  emailJsServiceId,
  emailJsTemplateId,
  emailJsPublicKey,
].every((value) => value && !value.startsWith("YOUR_EMAILJS_")) &&
  typeof emailjs !== "undefined";

if (emailJsIsConfigured) {
  emailjs.init({ publicKey: emailJsPublicKey });
}

function getFieldError(field) {
  if (field.validity.valueMissing) return "Please fill out this field.";
  if (field.validity.typeMismatch) return "Please enter a valid email address.";
  if (field.validity.tooShort)
    return `Please enter at least ${field.minLength} characters.`;
  return "";
}

function validateField(field) {
  const error = getFieldError(field);
  const errorMessage = document.querySelector(`#${field.id}-error`);
  errorMessage.textContent = error;
  field.classList.toggle("is-invalid", Boolean(error));
  field.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}

formFields.forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.classList.contains("is-invalid")) validateField(field);
  });
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = formFields.map(validateField).every(Boolean);

  if (!isValid) {
    formStatus.textContent =
      "Please correct the highlighted fields before continuing.";
    formStatus.classList.remove("success");
    contactForm.querySelector(":invalid")?.focus();
    return;
  }

  if (!emailJsIsConfigured) {
    const name = contactForm.elements.name.value.trim();
    const email = contactForm.elements.email.value.trim();
    const subject = contactForm.elements.subject.value.trim();
    const message = contactForm.elements.message.value.trim();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const gmailComposeUrl = new URL("https://mail.google.com/mail/");
    gmailComposeUrl.searchParams.set("view", "cm");
    gmailComposeUrl.searchParams.set("fs", "1");
    gmailComposeUrl.searchParams.set("to", contactEmail);
    gmailComposeUrl.searchParams.set("su", subject);
    gmailComposeUrl.searchParams.set("body", body);

    window.open(gmailComposeUrl.toString(), "_blank", "noopener,noreferrer");
    formStatus.textContent =
      "Gmail opened with your message ready. Review it and press Send to deliver.";
    formStatus.classList.remove("success");
    return;
  }

  const email = contactForm.elements.email.value.trim();
  const templateParams = {
    name: contactForm.elements.name.value.trim(),
    email,
    reply_to: email,
    subject: contactForm.elements.subject.value.trim(),
    message: contactForm.elements.message.value.trim(),
  };

  submitButton.disabled = true;
  formStatus.textContent = "Sending your message...";
  formStatus.classList.remove("success");

  try {
    await emailjs.send(emailJsServiceId, emailJsTemplateId, templateParams);

    formStatus.textContent = "Message sent successfully. Thank you for reaching out.";
    formStatus.classList.add("success");
    contactForm.reset();
    formFields.forEach((field) => {
      field.classList.remove("is-invalid");
      field.setAttribute("aria-invalid", "false");
      document.querySelector(`#${field.id}-error`).textContent = "";
    });
  } catch {
    formStatus.textContent =
      "We couldn't send your message. Please try again or email Getachewshifera27@gmail.com directly.";
  } finally {
    submitButton.disabled = false;
  }
});
