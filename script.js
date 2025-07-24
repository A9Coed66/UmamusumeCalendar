// script.js

const YEARS = ["First Year", "Second Year", "Third Year"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let calendar = {};
let selections = {};

// Khởi tạo calendar rỗng
function initCalendar() {
  YEARS.forEach(year => {
    calendar[year] = {};
    MONTHS.forEach(month => {
      calendar[year][month] = { 1: [], 2: [] };
    });
  });
}

// Xử lý dữ liệu races cho từng năm
function processRacesForYear(races, yearLabel) {
  races.forEach(race => {
    const month = race.month;
    const dayStage = race.dayStage || race.day || 1;
    if (calendar[yearLabel] && calendar[yearLabel][month]) {
      calendar[yearLabel][month][dayStage].push(race);
    }
  });
}

// Hiển thị popup chọn cuộc đua với banner & grade_ribbons
function showRaceSelectionPopup(year, month, dayStage, races) {
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
  title.textContent = `Cuộc đua ${month} - Day ${dayStage} (${year})`;
  popup.appendChild(title);

  // Danh sách các cuộc đua
  const list = document.createElement("ul");
  list.classList.add("race-list");

  races.forEach((race, idx) => {
    const item = document.createElement("li");
    item.classList.add("race-item");
    const isSelected = selections[year]?.[month]?.[dayStage] === idx;
    if (isSelected) item.classList.add("selected");

    // Hiển thị grade_ribbons (dạng mảng hoặc string)
    let gradeRibbonsHTML = "";
    if (race.grade_ribbons) {
      if (Array.isArray(race.grade_ribbons)) {
        gradeRibbonsHTML = race.grade_ribbons.map(src =>
          `<img src="${src}" alt="Grade Ribbon" style="width:24px; height:24px; margin-right:4px;">`
        ).join('');
      } else {
        gradeRibbonsHTML = `<img src="${race.grade_ribbons}" alt="Grade Ribbon" style="width:24px; height:24px;">`;
      }
    }

    // Nội dung hiển thị
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        ${race.banner ? `<img src="${race.banner}" alt="Race Banner" class="race-banner">` : ""}
        <div>
          <strong>${race.name || "Chưa đặt tên"}</strong><br>
          Địa điểm: ${race.location || "-"}<br>
          Loại đường đua: ${race.trackType || "-"}<br>
          Cự ly: ${race.distance || "-"}<br>
          Số fan: ${race.fans || "-"}<br>
          ${gradeRibbonsHTML}
        </div>
      </div>
    `;

    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      if (!selections[year]) selections[year] = {};
      if (!selections[year][month]) selections[year][month] = {};
      selections[year][month][dayStage] = idx;
      modal.style.display = "none";
      renderCalendar();
    });

    list.appendChild(item);
  });

  popup.appendChild(list);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Đóng";
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  popup.appendChild(closeBtn);

  modal.appendChild(popup);
  modal.style.display = "flex";
}

// Khi click ô ngày
function onDayBoxClick(event) {
  const target = event.currentTarget;
  const year = target.dataset.year;
  const month = target.dataset.month;
  const dayStage = Number(target.dataset.dayStage);

  const races = calendar[year][month][dayStage];
  if (!races || races.length === 0) {
    alert("Không có cuộc đua trong ngày này.");
    return;
  }
  showRaceSelectionPopup(year, month, dayStage, races);
}

// Render ô lịch cho từng năm
function renderYear(year) {
  const yearDiv = document.createElement("div");
  yearDiv.classList.add("year-block");
  yearDiv.dataset.year = year;

  const title = document.createElement("h2");
  title.textContent = year;
  yearDiv.appendChild(title);

  for (let row = 0; row < 2; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("month-row");

    for (let i = row * 6; i < row * 6 + 6; i++) {
      const month = MONTHS[i];
      const monthCell = document.createElement("div");
      monthCell.classList.add("month-cell");
      monthCell.dataset.month = month;

      const monthName = document.createElement("div");
      monthName.classList.add("month-name");
      monthName.textContent = month;
      monthCell.appendChild(monthName);

      for (let dayStage = 1; dayStage <= 2; dayStage++) {
        const dayBox = document.createElement("div");
        dayBox.classList.add("day-box");
        dayBox.dataset.year = year;
        dayBox.dataset.month = month;
        dayBox.dataset.dayStage = dayStage;

        // Nếu đã chọn cuộc đua cho ngày này
        const selIdx = selections[year]?.[month]?.[dayStage];
        const selectedRace = selIdx !== undefined
          ? calendar[year][month][dayStage][selIdx]
          : undefined;

        if (selectedRace) {
          // Hiển thị ảnh banner nhỏ
          dayBox.innerHTML = selectedRace.banner
            ? `<img src="${selectedRace.banner}" alt="Race Banner" style="width:40px;height:25px;object-fit:cover;border-radius:4px;display:block;margin:0 auto 3px;">`
            : "";
          // Hiển thị số fan
          dayBox.innerHTML += `<div style="font-size:0.8rem;color:#fff;text-align:center">Fan: ${selectedRace.fans || "?"}</div>`;
        } else {
          dayBox.textContent = `Day ${dayStage}`;
        }

        // Nếu có cuộc đua thì làm nổi bật
        if (calendar[year][month][dayStage].length > 0) {
          dayBox.classList.add("has-race");
        }
        // Nếu đã chọn thì highlight
        if (selectedRace) {
          dayBox.classList.add("selected-day");
          dayBox.title = `Đã chọn: ${selectedRace.name || "-"}`;
        }

        dayBox.addEventListener("click", onDayBoxClick);
        monthCell.appendChild(dayBox);
      }
      rowDiv.appendChild(monthCell);
    }
    yearDiv.appendChild(rowDiv);
  }
  return yearDiv;
}

// Tính tổng số fan đã chọn từ lịch
function getTotalFans(selectedYears) {
  let totalFans = 0;
  for (const year of selectedYears) {
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

// Hiển thị tổng số fan
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
  totalFansDiv.textContent = `Tổng số fan đã chọn: ${totalFanCount.toLocaleString()}`;
}

// Render toàn bộ calendar
function renderCalendar() {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  const checkedYears = Array.from(document.querySelectorAll("#year-select input[type=checkbox]:checked"))
    .map(cb => cb.value);

  if (checkedYears.length === 0) {
    container.textContent = "Vui lòng chọn ít nhất một năm để hiển thị lịch.";
    updateTotalFans(0);
    return;
  }

  checkedYears.forEach(year => {
    const yearDOM = renderYear(year);
    container.appendChild(yearDOM);
  });

  // Cập nhật tổng số fan đã chọn
  updateTotalFans(getTotalFans(checkedYears));
}

// Nút tải ảnh lịch
function setupDownloadButton() {
  const button = document.getElementById("download-btn");
  if (!button) return;

  button.addEventListener("click", () => {
    const container = document.getElementById("calendar-container");
    if (!container) {
      alert("Không tìm thấy lịch để tải ảnh.");
      return;
    }

    html2canvas(container).then(canvas => {
      const link = document.createElement("a");
      link.download = 'race-calendar.png';
      link.href = canvas.toDataURL("image/png");
      link.click();
    }).catch(err => {
      alert("Lỗi khi tải ảnh lịch: " + err.message);
    });
  });
}

// Hàm chính chạy khi DOM loaded
function main() {
  initCalendar();

  Promise.all([
    fetch('first_year.json').then(res => {
      if (!res.ok) throw new Error("Không tải được first_year.json");
      return res.json();
    }),
    fetch('second_year.json').then(res => {
      if (!res.ok) throw new Error("Không tải được second_year.json");
      return res.json();
    }),
    fetch('third_year.json').then(res => {
      if (!res.ok) throw new Error("Không tải được third_year.json");
      return res.json();
    })
  ]).then(([firstYearData, secondYearData, thirdYearData]) => {
    processRacesForYear(firstYearData, "First Year");
    processRacesForYear(secondYearData, "Second Year");
    processRacesForYear(thirdYearData, "Third Year");
    renderCalendar();
  }).catch(err => {
    alert("Lỗi khi tải dữ liệu các năm: " + err.message);
  });

  // Bắt sự kiện chọn năm lại
  const yearCheckboxes = document.querySelectorAll("#year-select input[type=checkbox]");
  yearCheckboxes.forEach(cb => {
    cb.addEventListener("change", renderCalendar);
  });

  setupDownloadButton();
}

document.addEventListener("DOMContentLoaded", main);
