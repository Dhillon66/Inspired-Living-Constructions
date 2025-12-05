// ===============================
// THEME TOGGLE
// ===============================
const bodyEl = document.body;
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

function updateThemeToggleLabel() {
  const dark = bodyEl.classList.contains("theme-dark");
  if (!themeIcon || !themeLabel) return;
  themeIcon.textContent = dark ? "🌙" : "☀";
  themeLabel.textContent = dark ? "Dark" : "Light";
}

function applyStoredTheme() {
  const stored = localStorage.getItem("ilc-theme");
  if (stored === "dark") {
    bodyEl.classList.add("theme-dark");
  } else {
    bodyEl.classList.remove("theme-dark");
  }
  updateThemeToggleLabel();
}

applyStoredTheme();

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    bodyEl.classList.toggle("theme-dark");
    const isDark = bodyEl.classList.contains("theme-dark");
    localStorage.setItem("ilc-theme", isDark ? "dark" : "light");
    updateThemeToggleLabel();
  });
}

// ===============================
// NAV ACTIVE + STICKY HEADER
// ===============================
const headerEl = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".main-nav .nav-link");
const currentPage = bodyEl.dataset.page;

navLinks.forEach((link) => {
  const href = link.getAttribute("href") || "";
  if (currentPage && href.startsWith(currentPage)) {
    link.classList.add("active");
  }
});

function handleScrollHeader() {
  if (!headerEl) return;
  if (window.scrollY > 10) {
    headerEl.classList.add("scrolled");
  } else {
    headerEl.classList.remove("scrolled");
  }
}

handleScrollHeader();
window.addEventListener("scroll", handleScrollHeader);

// ===============================
// MOBILE NAV
// ===============================
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    mainNav.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("open");
      mainNav.classList.remove("open");
    });
  });
}

// ===============================
// SCROLL ANIMATIONS
// ===============================
const animatedSections = document.querySelectorAll(".section-animated");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedSections.forEach((section) => sectionObserver.observe(section));
} else {
  animatedSections.forEach((section) => section.classList.add("in-view"));
}

// ===============================
// MODAL FOR SERVICES + PROJECTS
// ===============================
const modalBackdrop = document.getElementById("modal-backdrop");
const modalClose = document.getElementById("modal-close");

function openInfoModal(card) {
  if (!modalBackdrop) return;

  const titleEl = card.querySelector("h3, h2");
  const tagEl = card.querySelector(".project-tag");
  const descEl = card.querySelector("p");
  const pillsEl = card.querySelector(".pill-list");
  let imageSrc = card.getAttribute("data-image");
  if (!imageSrc) {
    const imgEl = card.querySelector("img");
    if (imgEl) imageSrc = imgEl.getAttribute("src");
  }

  const modalTitle = document.getElementById("modal-title");
  const modalTag = document.getElementById("modal-tag");
  const modalBody = document.getElementById("modal-body");
  const modalPills = document.getElementById("modal-pills");
  const modalImageContainer = modalBackdrop
    ? modalBackdrop.querySelector(".modal-image")
    : null;

  if (modalTitle) modalTitle.textContent = titleEl ? titleEl.textContent : "Details";
  if (modalTag)
    modalTag.textContent = tagEl
      ? tagEl.textContent
      : card.classList.contains("project-card")
      ? "Project details"
      : "Service details";
  if (modalBody)
    modalBody.textContent = descEl
      ? descEl.textContent
      : "More information about this item will be added soon.";
  if (modalPills) modalPills.innerHTML = pillsEl ? pillsEl.innerHTML : "";

  if (modalImageContainer) {
    if (imageSrc) {
      modalImageContainer.innerHTML = `<img src="${imageSrc}" alt="${
        titleEl ? titleEl.textContent : "Image"
      }">`;
    } else {
      modalImageContainer.innerHTML =
        '<p>Image coming soon<br/><span style="font-size:0.8rem;color:#6b7280;">Add your own project photo in the final site.</span></p>';
    }
  }

  modalBackdrop.classList.add("open");
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove("open");
    }
  });
}

if (modalClose) {
  modalClose.addEventListener("click", () => {
    modalBackdrop.classList.remove("open");
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalBackdrop && modalBackdrop.classList.contains("open")) {
    modalBackdrop.classList.remove("open");
  }
});

// Attach to ALL service + project cards (only on pages where they exist)
const infoCards = document.querySelectorAll(
  ".project-card, .service-card, .service-preview-grid .card"
);

infoCards.forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", (e) => {
    // Allow links inside card to work normally
    if (e.target.closest("a")) return;
    e.preventDefault();
    openInfoModal(card);
  });
});

// ===============================
// QUOTE CALCULATOR (Quote page)
// ===============================
const quoteForm = document.getElementById("quote-form");
const summaryTotal = document.getElementById("summary-total");
const summaryType = document.getElementById("summary-type");
const summaryArea = document.getElementById("summary-area");
const summaryFinish = document.getElementById("summary-finish");
const summaryExtrasList = document.getElementById("summary-extras");

function formatCurrencyRange(low, high) {
  const fmt = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
  return `${fmt.format(low)}–${fmt.format(high)}`;
}

function updateQuoteEstimate() {
  if (!quoteForm) return;

  const formData = new FormData(quoteForm);
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const area = parseFloat(formData.get("area") || "0") || 0;
  const service = (formData.get("service") || "").toString();
  const finishLevel = (formData.get("finish-level") || "standard").toString();
  const extras = formData.getAll("extras").map((e) => e.toString());
  const notes = (formData.get("notes") || "").toString().trim();

  let basePerSq = 60;
  let typeLabel = "Not selected";

  switch (service) {
    case "basement":
      basePerSq = 70;
      typeLabel = "Basement development";
      break;
    case "suite":
      basePerSq = 95;
      typeLabel = "Legal basement suite";
      break;
    case "kitchen":
      basePerSq = 140;
      typeLabel = "Kitchen renovation";
      break;
    case "bathroom":
      basePerSq = 220;
      typeLabel = "Bathroom renovation";
      break;
    case "reno":
      basePerSq = 110;
      typeLabel = "Whole-home renovation";
      break;
    default:
      basePerSq = 60;
  }

  let finishMultiplier = 1;
  let finishLabel = "Standard";
  if (finishLevel === "mid") {
    finishMultiplier = 1.2;
    finishLabel = "Mid-range";
  } else if (finishLevel === "premium") {
    finishMultiplier = 1.45;
    finishLabel = "Premium";
  }

  let extrasCost = 0;
  const extrasLabels = [];
  extras.forEach((extra) => {
    switch (extra) {
      case "bathroom":
        extrasCost += 18000;
        extrasLabels.push("Add full bathroom");
        break;
      case "kitchenette":
        extrasCost += 22000;
        extrasLabels.push("Add kitchenette / wet bar");
        break;
      case "separate-entry":
        extrasCost += 12000;
        extrasLabels.push("Separate entrance / egress changes");
        break;
      case "exterior":
        extrasCost += 8000;
        extrasLabels.push("Exterior upgrades as part of project");
        break;
    }
  });

  const baseEstimate = Math.max(area * basePerSq * finishMultiplier, 0);
  const low = baseEstimate * 0.9 + extrasCost;
  const high = baseEstimate * 1.1 + extrasCost;

  if (summaryTotal) summaryTotal.textContent = formatCurrencyRange(low, high);
  if (summaryType) summaryType.textContent = typeLabel;
  if (summaryArea) summaryArea.textContent = `${area || 0} sq. ft.`;
  if (summaryFinish) summaryFinish.textContent = finishLabel;

  if (summaryExtrasList) {
    summaryExtrasList.innerHTML = "";
    if (extrasLabels.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No additional add-ons selected.";
      summaryExtrasList.appendChild(li);
    } else {
      extrasLabels.forEach((label) => {
        const li = document.createElement("li");
        li.textContent = label;
        summaryExtrasList.appendChild(li);
      });
    }
  }

  // Store details for PDF
  window.__ilcQuote = {
    name,
    email,
    area,
    service,
    typeLabel,
    finishLabel,
    extrasLabels,
    low,
    high,
    notes,
  };
}

if (quoteForm) {
  quoteForm.addEventListener("input", updateQuoteEstimate);
  quoteForm.addEventListener("change", updateQuoteEstimate);
  updateQuoteEstimate();
}

// ===============================
// QUOTE PDF DOWNLOAD – INVOICE STYLE
// ===============================
const downloadBtn = document.getElementById("download-pdf");

function handleDownloadPdf() {
  if (!quoteForm) return;

  // Ensure latest values
  updateQuoteEstimate();
  const data = window.__ilcQuote || {};

  // Build a clean invoice layout just for the PDF
  const wrapper = document.createElement("div");
  wrapper.style.width = "100%";
  wrapper.style.maxWidth = "750px";
  wrapper.style.margin = "0 auto";
  wrapper.style.padding = "24px";
  wrapper.style.border = "1px solid #e5e7eb";
  wrapper.style.borderRadius = "8px";
  wrapper.style.fontFamily =
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  wrapper.style.fontSize = "12px";
  wrapper.style.color = "#111827";
  wrapper.style.boxSizing = "border-box";

  // Header: company + estimate meta
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "flex-start";
  header.style.gap = "16px";
  header.style.marginBottom = "16px";

  const left = document.createElement("div");
  const companyName = document.createElement("h1");
  companyName.textContent = "Inspired Living Constructions Inc.";
  companyName.style.fontSize = "18px";
  companyName.style.margin = "0 0 4px";

  const companyAddress = document.createElement("p");
  companyAddress.textContent =
    "Calgary, Alberta • dhillongagan566@gmail.com • (604) 368-3331";
  companyAddress.style.margin = "0";
  companyAddress.style.fontSize = "11px";

  left.appendChild(companyName);
  left.appendChild(companyAddress);

  const right = document.createElement("div");
  right.style.textAlign = "right";

  const title = document.createElement("h2");
  title.textContent = "Estimate";
  title.style.fontSize = "16px";
  title.style.margin = "0 0 4px";

  const now = new Date();
  const estNumber =
    "ILC-" +
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

  const estNumLine = document.createElement("p");
  estNumLine.textContent = "Estimate #: " + estNumber;
  estNumLine.style.margin = "0";
  estNumLine.style.fontSize = "11px";

  const dateLine = document.createElement("p");
  dateLine.textContent =
    "Date: " +
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  dateLine.style.margin = "0";
  dateLine.style.fontSize = "11px";

  right.appendChild(title);
  right.appendChild(estNumLine);
  right.appendChild(dateLine);

  header.appendChild(left);
  header.appendChild(right);
  wrapper.appendChild(header);

  // Divider
  const divider1 = document.createElement("hr");
  divider1.style.border = "none";
  divider1.style.borderTop = "1px solid #e5e7eb";
  divider1.style.margin = "8px 0 16px";
  wrapper.appendChild(divider1);

  // Client section
  const clientSection = document.createElement("div");
  clientSection.style.marginBottom = "14px";

  const clientHeading = document.createElement("h3");
  clientHeading.textContent = "Bill to";
  clientHeading.style.fontSize = "13px";
  clientHeading.style.margin = "0 0 4px";

  const clientName = document.createElement("p");
  clientName.textContent = data.name || "Client";
  clientName.style.margin = "0 0 2px";

  const clientEmail = document.createElement("p");
  clientEmail.textContent = data.email || "";
  clientEmail.style.margin = "0";
  clientEmail.style.fontSize = "11px";

  clientSection.appendChild(clientHeading);
  clientSection.appendChild(clientName);
  if (data.email) clientSection.appendChild(clientEmail);

  wrapper.appendChild(clientSection);

  // Divider
  const divider2 = document.createElement("hr");
  divider2.style.border = "none";
  divider2.style.borderTop = "1px solid #e5e7eb";
  divider2.style.margin = "8px 0 16px";
  wrapper.appendChild(divider2);

  // Project details table-style block
  const detailsSection = document.createElement("div");
  detailsSection.style.marginBottom = "16px";

  const detailsHeading = document.createElement("h3");
  detailsHeading.textContent = "Project details";
  detailsHeading.style.fontSize = "13px";
  detailsHeading.style.margin = "0 0 6px";

  const detailsTable = document.createElement("table");
  detailsTable.style.width = "100%";
  detailsTable.style.borderCollapse = "collapse";
  detailsTable.style.fontSize = "11px";

  function addRow(label, value) {
    const tr = document.createElement("tr");

    const tdLabel = document.createElement("td");
    tdLabel.textContent = label;
    tdLabel.style.fontWeight = "600";
    tdLabel.style.padding = "4px 6px 4px 0";
    tdLabel.style.verticalAlign = "top";
    tdLabel.style.width = "35%";

    const tdValue = document.createElement("td");
    tdValue.textContent = value;
    tdValue.style.padding = "4px 0";

    tr.appendChild(tdLabel);
    tr.appendChild(tdValue);
    detailsTable.appendChild(tr);
  }

  addRow("Project type", data.typeLabel || "Not selected");
  addRow("Approx. finished area", (data.area || 0) + " sq. ft.");
  addRow("Finish level", data.finishLabel || "Standard");

  const extras = data.extrasLabels || [];
  if (extras.length) {
    addRow("Included extras", extras.join(", "));
  } else {
    addRow("Included extras", "No additional add-ons selected.");
  }

  detailsSection.appendChild(detailsHeading);
  detailsSection.appendChild(detailsTable);
  wrapper.appendChild(detailsSection);

  // Estimate summary
  const estimateSection = document.createElement("div");
  estimateSection.style.marginBottom = "16px";

  const estimateHeading = document.createElement("h3");
  estimateHeading.textContent = "Estimated investment";
  estimateHeading.style.fontSize = "13px";
  estimateHeading.style.margin = "0 0 6px";

  const rangeLine = document.createElement("p");
  rangeLine.style.margin = "0 0 4px";
  rangeLine.style.fontSize = "12px";

  if (typeof data.low === "number" && typeof data.high === "number" && data.high > 0) {
    rangeLine.innerHTML =
      "<strong>Estimated range: </strong>" + formatCurrencyRange(data.low, data.high);
  } else {
    rangeLine.innerHTML = "<strong>Estimated range: </strong>$0–$0";
  }

  const estimateNote = document.createElement("p");
  estimateNote.textContent =
    "This estimate is a planning range based on the details provided. Final pricing will be confirmed after an on-site walkthrough, final design selections and permit review.";
  estimateNote.style.margin = "4px 0 0";
  estimateNote.style.fontSize = "11px";
  estimateNote.style.color = "#4b5563";

  estimateSection.appendChild(estimateHeading);
  estimateSection.appendChild(rangeLine);
  estimateSection.appendChild(estimateNote);

  wrapper.appendChild(estimateSection);

  // Client notes (optional)
  const notesText = (data.notes || "").trim();
  if (notesText) {
    const notesSection = document.createElement("div");
    notesSection.style.marginBottom = "16px";

    const notesHeading = document.createElement("h3");
    notesHeading.textContent = "Client notes";
    notesHeading.style.fontSize = "13px";
    notesHeading.style.margin = "0 0 4px";

    const notesPara = document.createElement("p");
    notesPara.textContent = notesText;
    notesPara.style.margin = "0";
    notesPara.style.fontSize = "11px";

    notesSection.appendChild(notesHeading);
    notesSection.appendChild(notesPara);
    wrapper.appendChild(notesSection);
  }

  // Next steps
  const stepsSection = document.createElement("div");
  const stepsHeading = document.createElement("h3");
  stepsHeading.textContent = "Next steps";
  stepsHeading.style.fontSize = "13px";
  stepsHeading.style.margin = "0 0 4px";

  const stepsPara = document.createElement("p");
  stepsPara.innerHTML =
    "1. Review this estimate and adjust scope, finishes and timeline as needed.<br>" +
    "2. Schedule an on-site walkthrough to confirm measurements and existing conditions.<br>" +
    "3. Receive a formal written quote and construction agreement based on the finalized scope.";
  stepsPara.style.margin = "0";
  stepsPara.style.fontSize = "11px";
  stepsPara.style.color = "#4b5563";

  stepsSection.appendChild(stepsHeading);
  stepsSection.appendChild(stepsPara);
  wrapper.appendChild(stepsSection);

  // Filename like: ILC-Estimate-Client-Name.pdf
  const nameForFile = (data.name || "Client").toString();
  const safeName = nameForFile.replace(/[^a-z0-9]+/gi, "-");
  const filename = "ILC-Estimate-" + (safeName || "Client") + ".pdf";

  if (window.html2pdf) {
    html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(wrapper)
      .save();
  } else {
    // Fallback if CDN fails
    window.print();
  }
}

if (downloadBtn) {
  downloadBtn.addEventListener("click", handleDownloadPdf);
}
