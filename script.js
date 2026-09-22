/* =========================================================
   FITTRACK — MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  // Mobile navigation
  menuToggle?.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open);
    menuToggle.innerHTML = open
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
    document.body.classList.toggle("menu-open", open);
  });

  document.querySelectorAll(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      if (menuToggle) menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      document.body.classList.remove("menu-open");
    });
  });

  // Scroll reveal
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => revealObserver.observe(item));

  // Active navigation
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".main-nav a")];

  window.addEventListener("scroll", () => {
    let current = "top";

    sections.forEach(section => {
      const top = section.offsetTop - 130;
      if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach(link => {
      const target = link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("active", target === current || (current === "calculator" && target === "calculator"));
    });
  }, { passive: true });

  // Calculator
  const form = document.getElementById("fitnessForm") || document.getElementById("calc");
  const ageInput = document.getElementById("age");
  const heightInput = document.getElementById("height");
  const weightInput = document.getElementById("weight");
  const activityInput = document.getElementById("activity");
  const goalInput = document.getElementById("goal");
  const genderSelect = document.getElementById("gender");

  const bmiValue = document.getElementById("bmiValue") || document.getElementById("bmi");
  const bmiStatus = document.getElementById("bmiStatus") || document.getElementById("status");
  const bodyFat = document.getElementById("bodyFat") || document.getElementById("bf");
  const dailyCalories = document.getElementById("dailyCalories") || document.getElementById("tdee");
  const fatLossCalories = document.getElementById("fatLossCalories") || document.getElementById("target");
  const proteinRange = document.getElementById("proteinRange") || document.getElementById("prot");

  function calculateFitness(e) {
    e?.preventDefault();

    const age = Number(ageInput.value);
    const height = Number(heightInput.value);
    const weight = Number(weightInput.value);
    const activity = Number(activityInput.value);
    const goal = goalInput?.value || "loss";
    const gender = document.querySelector('input[name="gender"]:checked')?.value || genderSelect?.value || "male";

    if (!age || !height || !weight || !activity) {
      showToast("Please enter all calculator values.");
      return;
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    let status = "Normal";
    if (bmi < 18.5) status = "Underweight";
    else if (bmi >= 25 && bmi < 30) status = "Overweight";
    else if (bmi >= 30) status = "Obesity";

    // Mifflin-St Jeor estimate
    const bmr = gender === "male"
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    const tdee = Math.round(bmr * activity);
    const goalOffset = goal === "gain" ? 300 : goal === "maintain" ? 0 : -400;
    const low = Math.max(1200, Math.round((tdee + goalOffset) / 50) * 50);
    const high = goal === "maintain" ? low : Math.max(low + 100, Math.round((tdee + goalOffset + 200) / 50) * 50);
    const proteinLow = Math.round(weight * 1.6);
    const proteinHigh = Math.round(weight * 2);

    // Relative estimate only. This is deliberately shown as a range.
    const estimatedBF = gender === "male"
      ? Math.max(6, Math.min(35, 1.2 * bmi + 0.23 * age - 16.2))
      : Math.max(12, Math.min(45, 1.2 * bmi + 0.23 * age - 5.4));

    const bfLow = Math.max(5, Math.round(estimatedBF - 2));
    const bfHigh = Math.round(estimatedBF + 2);

    bmiValue.textContent = bmi.toFixed(1);
    bmiStatus.textContent = form?.id === "calc" ? `BMI • ${status}` : status;
    bodyFat.textContent = `${bfLow}–${bfHigh}%`;
    dailyCalories.textContent = `${tdee.toLocaleString()} kcal`;
    fatLossCalories.textContent = `${low.toLocaleString()}–${high.toLocaleString()} kcal`;
    if (proteinRange) proteinRange.textContent = `${proteinLow}–${proteinHigh} g/day`;

    showToast("Your estimated results have been updated.");
  }

  if (form?.id === "calc") {
    document.addEventListener("submit", event => {
      if (event.target !== form) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      calculateFitness(event);
    }, true);
  } else {
    form?.addEventListener("submit", calculateFitness);
  }

  document.getElementById("tryCalculator")?.addEventListener("click", () => {
    document.getElementById("age")?.focus();
  });

  document.getElementById("trackBtn")?.addEventListener("click", () => {
    showToast("Progress tracker is ready for the next app phase.");
  });

  // Demo buttons / empty links
  document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showToast("This section can be connected to your next page.");
    });
  });

  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
});
