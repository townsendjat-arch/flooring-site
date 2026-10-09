import { estimateConfig } from "./estimate-config.js";
import { isConfigured, sendEstimate } from "./estimate-service.js";

const dialog = document.getElementById("estimateDialog");
const form = document.getElementById("estimateForm");
const steps = [...form.querySelectorAll(".form-step")];
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const progressBar = document.getElementById("progressBar");
const stepLabel = document.getElementById("stepLabel");
const stepHint = document.getElementById("stepHint");
const status = document.getElementById("formStatus");
const errorStatus = document.getElementById("formError");
const availabilityNotice = document.getElementById("formAvailability");
const onlineRequestsEnabled = isConfigured(estimateConfig.endpoint);
availabilityNotice.hidden = onlineRequestsEnabled;
dialog.setAttribute("aria-describedby", onlineRequestsEnabled ? "estimateIntro" : "estimateIntro formAvailability");
const field = name => form.elements.namedItem(name);
let currentStep = 1;
let sending = false;
let opener;

function clearStatus() {
  status.textContent = "";
  errorStatus.textContent = "";
}

function renderStep(focus = false) {
  steps.forEach(step => {
    const active = Number(step.dataset.step) === currentStep;
    step.classList.toggle("active", active);
    step.hidden = !active;
  });
  const active = steps.find(step => Number(step.dataset.step) === currentStep);
  backBtn.hidden = currentStep === 1 || currentStep === 5;
  backBtn.disabled = sending;
  nextBtn.textContent = sending ? "Sending…" : currentStep === 4 ? "Send request" : "Continue";
  nextBtn.hidden = currentStep === 5;
  nextBtn.disabled = sending;
  progressBar.style.width = `${Math.min(currentStep, 4) / 4 * 100}%`;
  stepLabel.textContent = currentStep === 5 ? "Complete" : `Step ${currentStep} of 4`;
  stepHint.textContent = active.dataset.hint;
  steps.forEach(step => step.setAttribute("aria-busy", String(sending)));
  if (focus && dialog.open) active.focus();
}

function updateContactRequirements() {
  const emailPreferred = field("contactPreference").value === "Email";
  field("email").required = emailPreferred;
  field("phone").required = !emailPreferred;
  document.getElementById("emailRequirement").textContent = emailPreferred ? "(required for email)" : "(optional)";
  document.getElementById("phoneRequirement").textContent = emailPreferred ? "(optional)" : "(required for text or call)";
}

const validationErrors = new Map();
const fieldNames = { projectType: "Project type", details: "Project details", location: "ZIP code or city", timing: "Project timing", spaceNote: "Space details", name: "Your name", phone: "Phone number", email: "Email", contactPreference: "Contact preference" };
for (const input of form.querySelectorAll(".form-step input, .form-step select, .form-step textarea")) {
  if (validationErrors.has(input.name)) continue;
  const message = document.createElement("span");
  message.id = `fieldError-${input.name}`;
  message.className = "field-error";
  message.hidden = true;
  // One persistent explanation per group or field, in the same visual location.
  if (input.type === "radio") {
    input.closest("fieldset").append(message);
  } else {
    const label = input.closest("label");
    const wrapper = document.createElement("div");
    wrapper.className = "form-field";
    label.replaceWith(wrapper);
    wrapper.append(label, message);
  }
  validationErrors.set(input.name, message);
}

function clearValidation(input) {
  const controls = input.type === "radio"
    ? [...form.querySelectorAll('input[type="radio"]')].filter(control => control.name === input.name)
    : [input];
  const message = validationErrors.get(input.name);
  for (const control of controls) {
    control.setCustomValidity("");
    control.removeAttribute("aria-invalid");
    const ids = (control.getAttribute("aria-describedby") || "").split(" ").filter(id => id && id !== message?.id);
    if (ids.length) control.setAttribute("aria-describedby", ids.join(" "));
    else control.removeAttribute("aria-describedby");
  }
  if (message) { message.textContent = ""; message.hidden = true; }
}

function validateStep(number) {
  updateContactRequirements();
  const step = steps.find(step => Number(step.dataset.step) === number);
  const controls = [...step.querySelectorAll("input, select, textarea")];
  controls.forEach(clearValidation);
  for (const input of controls) {
    if (input.type !== "radio" && input.required && !input.value.trim()) {
      input.setCustomValidity(`Please ${input.tagName === "SELECT" ? "choose" : "enter"} ${fieldNames[input.name].toLowerCase()}.`);
    }
    if (input.name === "phone" && input.value.trim()) {
      const digits = input.value.replace(/\D/g, "");
      if (!/^[+\d\s().-]+$/.test(input.value) || digits.length < 10 || digits.length > 15) {
        input.setCustomValidity("Enter a phone number with 10 to 15 digits.");
      }
    }
    if (!input.checkValidity()) {
      input.setAttribute("aria-invalid", "true");
      const message = validationErrors.get(input.name);
      message.textContent = input.type === "radio" ? `Please choose a ${fieldNames[input.name].toLowerCase()}.` : input.validationMessage;
      message.hidden = false;
      input.setAttribute("aria-describedby", [input.getAttribute("aria-describedby"), message.id].filter(Boolean).join(" "));
    }
  }
  const invalid = controls.find(input => !input.checkValidity());
  if (!invalid) return true;
  currentStep = number;
  renderStep();
  errorStatus.textContent = "Please check the highlighted field before continuing.";
  invalid.focus();
  return false;
}

function openEstimate(project = "", trigger) {
  if (dialog.open) return;
  opener = trigger;
  // Keep a partially completed or in-flight request when the dialog is reopened.
  if (project && !sending && currentStep < 5) {
    const choice = [...form.querySelectorAll('input[name="projectType"]')].find(input => input.value === project);
    if (choice) {
      choice.checked = true;
      currentStep = 1;
      clearStatus();
    }
  }
  updateContactRequirements();
  renderStep();
  dialog.showModal();
  // Keep the early availability notice in view, including on a small screen.
  const focusTarget = !onlineRequestsEnabled && currentStep === 1
    ? availabilityNotice
    : steps.find(step => Number(step.dataset.step) === currentStep);
  focusTarget.focus();
}

document.querySelectorAll("[data-open-estimate]").forEach(button => {
  button.addEventListener("click", () => openEstimate("", button));
});
document.querySelectorAll("[data-project]").forEach(button => {
  button.addEventListener("click", () => openEstimate(button.dataset.project, button));
});
document.getElementById("closeEstimate").addEventListener("click", () => dialog.close());
document.getElementById("doneEstimate").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => opener?.focus());
// Native Escape dismissal is retained. Closing does not cancel an in-flight send.

form.addEventListener("input", event => {
  if (event.target.setCustomValidity) clearValidation(event.target);
  if (!sending) clearStatus();
});
form.addEventListener("change", event => {
  if (event.target.name === "contactPreference") {
    updateContactRequirements();
    for (const name of ["email", "phone"]) {
      clearValidation(field(name));
    }
  }
});

const messages = {
  unconfigured: "Online requests are not available yet. Nothing was sent. Please use the call or text links below.",
  "rate-limit": "The request service is busy. Your details are still here. Please wait before trying again, or call or text Charles.",
  rejected: "The request service did not accept this request. Your details are still here. Please check them and try again, or call or text Charles.",
  timeout: "We could not confirm your request before the connection timed out. It may have arrived. Your details are still here; call or text Charles to check, or try again (which may send a duplicate).",
  network: "We could not confirm your request. It may have arrived. Your details are still here; check your connection and try again (which may send a duplicate), or call or text Charles.",
  unconfirmed: "We could not confirm your request. It may have arrived. Your details are still here; call or text Charles to check, or try again (which may send a duplicate).",
};

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (sending || currentStep === 5) return;
  clearStatus();
  if (!validateStep(currentStep)) return;
  if (currentStep < 4) {
    currentStep += 1;
    renderStep(true);
    return;
  }
  for (let number = 1; number <= 4; number += 1) {
    if (!validateStep(number)) return;
  }
  if (!isConfigured(estimateConfig.endpoint)) {
    errorStatus.textContent = messages.unconfigured;
    errorStatus.focus();
    return;
  }
  // Explicit allowlist: no photos, page URLs, tracking data, or arbitrary fields.
  const payload = {};
  for (const name of ["projectType", "details", "location", "timing", "spaceNote", "name", "phone", "email", "contactPreference", "_gotcha"]) {
    const value = field(name).value.trim();
    if (value || name === "_gotcha") payload[name] = value;
  }
  sending = true;
  const controls = [...form.querySelectorAll(".form-step input, .form-step select, .form-step textarea")];
  controls.forEach(input => { input.disabled = true; });
  renderStep();
  status.textContent = "Sending your request. Closing this window will not cancel it.";
  try {
    await sendEstimate(payload, estimateConfig);
    currentStep = 5;
    clearStatus();
  } catch (error) {
    errorStatus.textContent = messages[error.code] || messages.network;
  } finally {
    sending = false;
    controls.forEach(input => { input.disabled = false; });
    status.textContent = "";
    renderStep(currentStep === 5);
    if (errorStatus.textContent && dialog.open) errorStatus.focus();
  }
});

backBtn.addEventListener("click", () => {
  if (!sending && currentStep > 1 && currentStep < 5) {
    currentStep -= 1;
    clearStatus();
    renderStep(true);
  }
});
document.getElementById("newEstimate").addEventListener("click", () => {
  if (sending || currentStep !== 5) return;
  form.reset();
  form.querySelectorAll(".form-step input, .form-step select, .form-step textarea").forEach(clearValidation);
  currentStep = 1;
  clearStatus();
  updateContactRequirements();
  renderStep(true);
});

updateContactRequirements();
renderStep();
