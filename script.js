// script.js

const YEARS = ["First Year", "Second Year", "Third Year"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let calendar = {};
let selections = {};

// Initialize an empty calendar
function initCalendar() {
  YEARS.forEach(year => {
    calendar[year] = {};
    MONTHS.forEach(month => {
      calendar[year][month] = { 1: [], 2: [] };
    });
  });
}

// Process race data for each year
function processRacesForYear(races, yearLabel) {
  races.forEach(race => {
    const month = race.month;
    const dayStage = race.dayStage || race.day || 1;
    if (calendar[yearLabel] && calendar[yearLabel][month]) {
      calendar[yearLabel][month][dayStage].push(race);
    }
  });
}

function showRaceSelectionPopup(year, month, dayStage, races) {
  // Get checked distance types from checkboxes
  const checkedTypes = Array.from(document.querySelectorAll('.distance-type-filter:checked'))
    .map(cb => cb.value);

  // Get checked grade filters from checkboxes
  const checkedGrades = Array.from(document.querySelectorAll('.grade-filter:checked'))
    .map(cb => cb.value);

  // Filter races by checked distance types if any are checked
  let filteredRaces = races;
  if (checkedTypes.length >= 0) {
    filteredRaces = races.filter(race => checkedTypes.includes(race.distance_type));
  }

  // Filter races by checked grades if any are checked
  if (checkedGrades.length >= 0) {
    filteredRaces = filteredRaces.filter(race => checkedGrades.includes(race.grade_image))
  }

  filteredRaces.sort((a, b) => {
    const fansA = parseInt(a.fans?.replace(/[^0-9]/g, "") || "0", 10);
    const fansB = parseInt(b.fans?.replace(/[^0-9]/g, "") || "0", 10);
    return fansB - fansA; // Sort in descending order
  });

  let modal = document.getElementById("race-popup");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "race-popup";
    modal.classList.add("modal-overlay");
    document.body.appendChild(modal);
  }
  modal.innerHTML = "";

  const popup = document.createElement("div");
  popup.classList.add("modal-content");

  const title = document.createElement("h3");
  title.textContent = `Race on ${month} - Day ${dayStage} (${year})`;
  popup.appendChild(title);

  // Add filter info if filters are active
  if (checkedTypes.length > 0) {
    const filterInfo = document.createElement("div");
    filterInfo.style.fontSize = "0.95em";
    filterInfo.style.marginBottom = "8px";
    filterInfo.style.color = "#888";
    filterInfo.textContent = `Filtered by: ${checkedTypes.join(", ")}`;
    popup.appendChild(filterInfo);
  }

  const list = document.createElement("ul");
  list.classList.add("race-list");

  if (filteredRaces.length === 0) {
    const noItem = document.createElement("li");
    noItem.textContent = "No races match the selected type(s).";
    noItem.style.color = "#c00";
    list.appendChild(noItem);
  } else {
    filteredRaces.forEach((race, idx) => {
      const item = document.createElement("li");
      item.classList.add("race-item");

      const distanceTypeClass = {
        Short: "distance-type-short",
        Mile: "distance-type-mile",
        Medium: "distance-type-medium",
        Long: "distance-type-long",
      }[race.distance_type] || "";

      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <div>
            ${race.race_banner ? `<img src="${race.race_banner}" alt="Race Banner" class="race-race_banner">` : ""} <br>
            ${race.grade_image ? `<img src="${race.grade_image}" alt="Race Grade" class="race-race_grade" style="height:24px; width:auto; object-fit:contain;">` : ""}
          </div>
          <div>
            <strong>${race.name || "Unnamed"}</strong><br>
            Location: ${race.location || "-"}<br>
            Surface: ${race.surface || "-"}<br>
            Distance type: <span class="distance-type ${distanceTypeClass}">${race.distance_type || "-"}</span><br>
            Distance: ${race.distance || "-"}<br>
            Fans: ${race.fans || "-"}</br>
          </div>
        </div>
      `;

      item.style.cursor = "pointer";
      // Find the original index in the races array for selection
      const originalIdx = races.indexOf(race);
      item.addEventListener("click", () => {
        if (!selections[year]) selections[year] = {};
        if (!selections[year][month]) selections[year][month] = {};
        selections[year][month][dayStage] = originalIdx;
        modal.style.display = "none";
        removeListeners();
        renderCalendar();
      });

      list.appendChild(item);
    });
  }

  popup.appendChild(list);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    removeListeners();
  });
  popup.appendChild(closeBtn);

  modal.appendChild(popup);
  modal.style.display = "flex";

  // --- Add click outside and ESC close logic ---
  function onOverlayClick(e) {
    if (e.target === modal) {
      modal.style.display = "none";
      removeListeners();
    }
  }
  function onEsc(e) {
    if (e.key === "Escape") {
      modal.style.display = "none";
      removeListeners();
    }
  }
  function removeListeners() {
    modal.removeEventListener("click", onOverlayClick);
    document.removeEventListener("keydown", onEsc);
  }
  modal.addEventListener("click", onOverlayClick);
  document.addEventListener("keydown", onEsc);
}

// When clicking on a day box
function onDayBoxClick(event) {
  const target = event.currentTarget;
  const year = target.dataset.year;
  const month = target.dataset.month;
  const dayStage = Number(target.dataset.dayStage);

  const races = calendar[year][month][dayStage];
  if (!races || races.length === 0) {
    alert("No races today.");
    return;
  }
  showRaceSelectionPopup(year, month, dayStage, races);
}

// Create year title
function createYearTitle(year) {
  const title = document.createElement("h2");
  title.textContent = year;
  title.style.textAlign = "center"; // Center the title
  return title;
}

function createDayBox(year, month, dayStage) {
  const dayBox = document.createElement("div");
  dayBox.classList.add("day-box");
  dayBox.dataset.year = year;
  dayBox.dataset.month = month;
  dayBox.dataset.dayStage = dayStage;

  const selIdx = selections[year]?.[month]?.[dayStage];
  const selectedRace = selIdx !== undefined
    ? calendar[year][month][dayStage][selIdx]
    : undefined;

  if (selectedRace) {
    dayBox.innerHTML = selectedRace.race_banner
      ? `<img src="${selectedRace.race_banner}" alt="Race race_banner" style="width:100px;height:50px;object-fit:cover;border-radius:4px;display:block;margin:0 auto 5px;">`
      : "";
    dayBox.innerHTML += `<div style="font-size:0.9rem;color:#fff;text-align:center;font-weight:bold;">Fan: ${selectedRace.fans || "?"}</div>`;
    dayBox.classList.add("selected-day");
    dayBox.title = `Selected: ${selectedRace.name || "-"}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖"; // Use icon instead of "Remove"
    deleteBtn.style.margin = "0 auto"; // Center the button horizontally
    deleteBtn.style.padding = "2px 6px"; // Reduce padding for a smaller button
    deleteBtn.style.fontSize = "0.7rem"; // Reduce font size
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.backgroundColor = "#e74c3c";
    deleteBtn.style.color = "#fff";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "50%"; // Make the button round
    deleteBtn.style.width = "20px"; // Set fixed width
    deleteBtn.style.height = "20px"; // Set fixed height
    deleteBtn.style.display = "block"; // Ensure the button is a separate block
    deleteBtn.style.position = "relative"; // Set relative position for alignment
    deleteBtn.style.top = "5px"; // Adjust top margin

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent click event on the day box
      delete selections[year][month][dayStage]; // Remove the selected race
      renderCalendar(); // Update the calendar
    });

    dayBox.appendChild(deleteBtn);
  } else {
    dayBox.textContent = `Day ${dayStage}`;
    dayBox.style.fontSize = "1rem";
    dayBox.style.textAlign = "center";
    dayBox.style.padding = "10px";
    dayBox.style.backgroundColor = "#f0f0f0";
    dayBox.style.borderRadius = "6px";
  }

  if (calendar[year][month][dayStage].length > 0) {
    dayBox.classList.add("has-race");
  }

  dayBox.addEventListener("click", onDayBoxClick);
  return dayBox;
}

// Create month cell
function createMonthCell(year, month) {
  const monthCell = document.createElement("div");
  monthCell.classList.add("month-cell");
  monthCell.dataset.month = month;

  const monthName = document.createElement("div");
  monthName.classList.add("month-name");
  monthName.textContent = month;
  monthCell.appendChild(monthName);

  for (let dayStage = 1; dayStage <= 2; dayStage++) {
    const dayBox = createDayBox(year, month, dayStage);
    monthCell.appendChild(dayBox);
  }

  return monthCell;
}

// Render calendar for each year
function renderYear(year) {
  const yearDiv = document.createElement("div");
  yearDiv.classList.add("year-block");
  yearDiv.dataset.year = year;

  const title = createYearTitle(year);
  yearDiv.appendChild(title);

  for (let row = 0; row < 2; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("month-row");

    for (let i = row * 6; i < row * 6 + 6; i++) {
      const month = MONTHS[i];
      const monthCell = createMonthCell(year, month);
      rowDiv.appendChild(monthCell);
    }

    yearDiv.appendChild(rowDiv);
  }

  return yearDiv;
}

let currentYearIndex = 0; // Current year index in the YEARS array

// Update renderCalendar to display only the current year
function renderCalendar() {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  const year = YEARS[currentYearIndex];
  const yearDOM = renderYear(year);
  container.appendChild(yearDOM);

  // Update total selected fans
  updateTotalFans(getTotalFans([year]));
}

function setupYearNavigationButtons() {
  const prevYearBtn = document.getElementById("prev-year-btn");
  const nextYearBtn = document.getElementById("next-year-btn");

  prevYearBtn.addEventListener("click", () => {
    if (currentYearIndex > 0) {
      currentYearIndex--; // Switch to the previous year
      renderCalendar(); // Re-render the calendar
    }
  });

  nextYearBtn.addEventListener("click", () => {
    if (currentYearIndex < YEARS.length - 1) {
      currentYearIndex++; // Switch to the next year
      renderCalendar(); // Re-render the calendar
    }
  });
}

function getTotalFans() {
  let totalFans = 0;
  for (const year of YEARS) {
    for (const month of MONTHS) {
      for (const dayStage of [1, 2]) {
        const selIdx = selections[year]?.[month]?.[dayStage];
        if (selIdx !== undefined && selIdx !== null) {
          const race = calendar[year][month][dayStage][selIdx];
          if (race && race.fans) {
            let fansCount = 0;
            if (typeof race.fans === "number") {
              fansCount = race.fans;
            } else if (typeof race.fans === "string") {
              const parsed = parseInt(race.fans.replace(/[^0-9]/g, ""));
              fansCount = isNaN(parsed) ? 0 : parsed;
            }
            totalFans += fansCount;
          }
        }
      }
    }
  }
  return totalFans;
}

// Display total fans
function updateTotalFans(totalFanCount) {
  let totalFansDiv = document.getElementById("total-fans");
  if (!totalFansDiv) {
    totalFansDiv = document.createElement("div");
    totalFansDiv.id = "total-fans";
    totalFansDiv.style.margin = "12px 0";
    totalFansDiv.style.fontWeight = "700";
    totalFansDiv.style.fontSize = "1.15rem";
    totalFansDiv.style.color = "#27ae60";
    const calendarContainer = document.getElementById("calendar-container");
    calendarContainer.parentNode.insertBefore(totalFansDiv, calendarContainer);
  }
  totalFansDiv.textContent = `${totalFanCount.toLocaleString()} fans total`;
}

function renderCalendar() {
  const container = document.getElementById("calendar-container");
  const currentYear = YEARS[currentYearIndex];
  
  // Find and remove old effect classes
  const oldYearBlock = container.querySelector(".year-block");
  if (oldYearBlock) {
    oldYearBlock.classList.add(currentYearIndex > oldYearBlock.dataset.index ? "exit-left" : "exit-right");
    oldYearBlock.remove(); // Remove the element after the effect ends
  }

  // Create and add the new year with effects
  const yearDOM = renderYear(currentYear);
  yearDOM.dataset.index = currentYearIndex;

  // Add sliding effect classes
  yearDOM.classList.add("year-block");
  yearDOM.classList.add(currentYearIndex > (oldYearBlock?.dataset.index || 0) ? "enter-right" : "enter-left");

  // Wait a bit to trigger the "active" effect
  setTimeout(() => {
    yearDOM.classList.add("active");
    yearDOM.classList.remove("enter-left", "enter-right");
  }, 50);

  container.appendChild(yearDOM);
  
  // Update total selected fans
  updateTotalFans(getTotalFans());
}

// Calendar image download button
function setupDownloadButton() {
  const button = document.getElementById("download-btn");
  if (!button) return;

  button.addEventListener("click", () => {
    const container = document.getElementById("calendar-container");
    if (!container) {
      alert("Cannot find the calendar to download.");
      return;
    }

    html2canvas(container).then(canvas => {
      const link = document.createElement("a");
      link.download = 'race-calendar.png';
      link.href = canvas.toDataURL("image/png");
      link.click();
    }).catch(err => {
      alert("Error downloading calendar image: " + err.message);
    });
  });
}

function main() {
  initCalendar(); // Initialize calendar data

  Promise.all([
    fetch('first_year.json').then(res => {
      if (!res.ok) throw new Error("Failed to load first_year.json");
      return res.json();
    }),
    fetch('second_year.json').then(res => {
      if (!res.ok) throw new Error("Failed to load second_year.json");
      return res.json();
    }),
    fetch('third_year.json').then(res => {
      if (!res.ok) throw new Error("Failed to load third_year.json");
      return res.json();
    })
  ]).then(([firstYearData, secondYearData, thirdYearData]) => {
    processRacesForYear(firstYearData, "First Year");
    processRacesForYear(secondYearData, "Second Year");
    processRacesForYear(thirdYearData, "Third Year");
    renderCalendar(); // Display the calendar for the first year
  }).catch(err => {
    alert("Error loading year data: " + err.message);
  });

  setupYearNavigationButtons(); // Set up navigation button events
}

document.addEventListener("DOMContentLoaded", main);
