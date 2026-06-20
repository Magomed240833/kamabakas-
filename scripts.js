document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const sections = document.querySelectorAll("section[id]");

  const closeMenu = () => {
    burger?.classList.remove("active");
    burger?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("open");
    document.body.classList.remove("menu-open");
  };

  burger?.addEventListener("click", () => {
    const isOpen = burger.classList.toggle("active");
    burger.setAttribute("aria-expanded", String(isOpen));
    nav?.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;

      if (!target) {
        return;
      }

      event.preventDefault();
      const headerOffset = (header?.offsetHeight || 0) + 24;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });

      closeMenu();
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));

  initSliders();

  initContactForm();
  initBnovo();
});

function initSliders(attempt = 0) {
  if (!document.querySelector(".villa-slider") && !document.querySelector(".facilities-slider")) {
    return;
  }

  if (!window.Swiper && attempt < 20) {
    window.setTimeout(() => initSliders(attempt + 1), 150);
    return;
  }

  if (!window.Swiper) {
    initFallbackSlider(".villa-slider");
    initFallbackSlider(".facilities-slider");
    return;
  }

  const sliderOptions = {
    slidesPerView: 1,
    loop: true,
    speed: 650,
    grabCursor: true,
    simulateTouch: true,
    touchRatio: 1,
    threshold: 6,
    observer: true,
    observeParents: true,
    resizeObserver: true,
    watchOverflow: true,
    keyboard: {
      enabled: true,
    },
  };

  new Swiper(".villa-slider", {
    ...sliderOptions,
    navigation: {
      nextEl: ".villa-slider .swiper-button-next",
      prevEl: ".villa-slider .swiper-button-prev",
    },
    pagination: {
      el: ".villa-slider .swiper-pagination",
      clickable: true,
    },
    autoplay: {
      delay: 4200,
      disableOnInteraction: false,
    },
  });

  new Swiper(".facilities-slider", {
    ...sliderOptions,
    navigation: {
      nextEl: ".facilities-slider .swiper-button-next",
      prevEl: ".facilities-slider .swiper-button-prev",
    },
    autoplay: {
      delay: 4700,
      disableOnInteraction: false,
    },
  });
}

function initFallbackSlider(selector) {
  const slider = document.querySelector(selector);

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll(".swiper-slide"));
  const nextButton = slider.querySelector(".swiper-button-next");
  const prevButton = slider.querySelector(".swiper-button-prev");
  let activeIndex = 0;
  let touchStartX = 0;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
  };

  slider.classList.add("fallback-slider");
  showSlide(0);

  nextButton?.addEventListener("click", () => showSlide(activeIndex + 1));
  prevButton?.addEventListener("click", () => showSlide(activeIndex - 1));

  slider.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < 40) {
      return;
    }

    showSlide(activeIndex + (diff > 0 ? 1 : -1));
  }, { passive: true });
}

function initContactForm() {
  const form = document.querySelector(".needs-validation");
  const result = document.getElementById("result");

  if (!form || !result) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    result.className = "form-result";
    result.style.display = "block";

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      form.querySelector(":invalid")?.focus();
      result.textContent = "Проверьте заполнение полей.";
      result.classList.add("error");
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    result.textContent = "Отправляем заявку...";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось отправить заявку.");
      }

      result.textContent = "Спасибо! Заявка отправлена.";
      result.classList.add("success");
      form.reset();
      form.classList.remove("was-validated");
    } catch (error) {
      result.textContent = error.message || "Что-то пошло не так. Напишите нам в WhatsApp.";
      result.classList.add("error");
    }
  });
}

function initBnovo() {
  if (window.Bnovo_Widget && !window.bnovoInitialized) {
    window.bnovoInitialized = true;
    window.Bnovo_Widget.init(() => {
      window.Bnovo_Widget.open("_bn_widget_", {
        type: "vertical",
        uid: "2a6f733e-9fd8-4b98-97bf-02f554f14b06",
        lang: "ru",
        currency: "RUB",
        width: "100%",
        background: "#0B7189",
        bg_alpha: "18",
        padding: "28",
        border_radius: "8",
        font_type: "arial",
        font_size: "15",
        title_color: "#ffffff",
        title_size: "18",
        inp_color: "#18262f",
        inp_bordhover: "#0B7189",
        inp_bordcolor: "#d8d3c8",
        inp_alpha: "95",
        btn_background: "#0B7189",
        btn_background_over: "#075264",
        btn_textcolor: "#ffffff",
        btn_textover: "#ffffff",
        btn_bordcolor: "#0B7189",
        btn_bordhover: "#075264",
        adults_default: "1",
        text_concierge: "Получите скидку через Bnovo Concierge",
      });
    });
  }

  if (window.BookingIframe) {
    const bookingIframe = new window.BookingIframe({
      html_id: "booking_iframe",
      uid: "2a6f733e-9fd8-4b98-97bf-02f554f14b06",
      lang: "ru",
      width: "100%",
      height: "auto",
      rooms: "",
      scroll_to_rooms: "1",
      margin: "0",
    });

    bookingIframe.init();
  }
}
