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

function showRaceSelectionPopup(year, month, dayStage, races) {
  const modal = document.getElementById("race-popup") || document.createElement("div");
  modal.id = "race-popup";
  modal.classList.add("modal-overlay");
  document.body.appendChild(modal);
  modal.innerHTML = "";

  const popup = document.createElement("div");
  popup.classList.add("modal-content");

  const title = document.createElement("h3");
  title.textContent = `Race on ${month} - Day ${dayStage} (${year})`;
  popup.appendChild(title);

  const list = document.createElement("ul");
  list.classList.add("race-list");

  races.forEach((race, idx) => {
    const item = document.createElement("li");
    item.classList.add("race-item");

    // Xác định lớp CSS cho distance_type
    const distanceTypeClass = {
      Short: "distance-type-short",
      Mile: "distance-type-mile",
      Medium: "distance-type-medium",
      Long: "distance-type-long",
    }[race.distance_type] || "";

    // Nội dung hiển thị
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        ${race.race_banner ? `<img src="${race.race_banner}" alt="Race Banner" class="race-race_banner">` : ""}
        <div>
          <strong>${race.name || "Chưa đặt tên"}</strong><br>
          Location: ${race.location || "-"}<br>
          Surface: ${race.surface || "-"}<br>
          Distance type: <span class="distance-type ${distanceTypeClass}">${race.distance_type || "-"}</span><br>
          Distance: ${race.distance || "-"}<br>
          Fans: ${race.fans || "-"}<br>
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
    alert("No any race on today.");
    return;
  }
  showRaceSelectionPopup(year, month, dayStage, races);
}

// Tạo tiêu đề năm
function createYearTitle(year) {
  const title = document.createElement("h2");
  title.textContent = year;
  title.style.textAlign = "center"; // Canh giữa tiêu đề
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
    dayBox.title = `Đã chọn: ${selectedRace.name || "-"}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖"; // Sử dụng biểu tượng thay vì chữ "Remove"
    deleteBtn.style.margin = "0 auto"; // Căn giữa nút theo chiều ngang
    deleteBtn.style.padding = "2px 6px"; // Giảm padding để nút nhỏ hơn
    deleteBtn.style.fontSize = "0.7rem"; // Giảm kích thước chữ
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.backgroundColor = "#e74c3c";
    deleteBtn.style.color = "#fff";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "50%"; // Làm nút tròn
    deleteBtn.style.width = "20px"; // Đặt chiều rộng cố định
    deleteBtn.style.height = "20px"; // Đặt chiều cao cố định
    deleteBtn.style.display = "block"; // Đảm bảo nút là một khối riêng biệt
    deleteBtn.style.position = "relative"; // Đặt vị trí tương đối để căn chỉnh
    deleteBtn.style.top = "5px"; // Điều chỉnh khoảng cách từ trên xuống

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Ngăn chặn sự kiện click vào ô ngày
      delete selections[year][month][dayStage]; // Xóa cuộc đua đã chọn
      renderCalendar(); // Cập nhật lại lịch
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

// Tạo ô tháng
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

// Render ô lịch cho từng năm
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

let currentYearIndex = 0; // Chỉ số năm hiện tại trong mảng YEARS

// Cập nhật hàm renderCalendar để chỉ hiển thị năm hiện tại
function renderCalendar() {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  const year = YEARS[currentYearIndex];
  const yearDOM = renderYear(year);
  container.appendChild(yearDOM);

  // Cập nhật tổng số fan đã chọn
  updateTotalFans(getTotalFans([year]));
}

function setupYearNavigationButtons() {
  const prevYearBtn = document.getElementById("prev-year-btn");
  const nextYearBtn = document.getElementById("next-year-btn");

  prevYearBtn.addEventListener("click", () => {
    if (currentYearIndex > 0) {
      currentYearIndex--; // Chuyển sang năm trước
      renderCalendar(); // Render lại lịch
    }
  });

  nextYearBtn.addEventListener("click", () => {
    if (currentYearIndex < YEARS.length - 1) {
      currentYearIndex++; // Chuyển sang năm tiếp theo
      renderCalendar(); // Render lại lịch
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
  totalFansDiv.textContent = `${totalFanCount.toLocaleString()} fans total`;
}

function renderCalendar() {
  const container = document.getElementById("calendar-container");
  const currentYear = YEARS[currentYearIndex];
  
  // Tìm và loại bỏ các lớp hiệu ứng cũ
  const oldYearBlock = container.querySelector(".year-block");
  if (oldYearBlock) {
    oldYearBlock.classList.add(currentYearIndex > oldYearBlock.dataset.index ? "exit-left" : "exit-right");
    oldYearBlock.remove(); // Xóa phần tử sau khi hiệu ứng kết thúc
  }

  // Tạo và thêm năm mới với hiệu ứng
  const yearDOM = renderYear(currentYear);
  yearDOM.dataset.index = currentYearIndex;

  // Thêm lớp hiệu ứng trượt vào
  yearDOM.classList.add("year-block");
  yearDOM.classList.add(currentYearIndex > (oldYearBlock?.dataset.index || 0) ? "enter-right" : "enter-left");

  // Đợi một chút để kích hoạt hiệu ứng "active"
  setTimeout(() => {
    yearDOM.classList.add("active");
    yearDOM.classList.remove("enter-left", "enter-right");
  }, 50);

  container.appendChild(yearDOM);
  
  // Cập nhật tổng số fan đã chọn
  updateTotalFans(getTotalFans());
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

function main() {
  initCalendar(); // Khởi tạo dữ liệu lịch

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
    renderCalendar(); // Hiển thị lịch cho năm đầu tiên
  }).catch(err => {
    alert("Lỗi khi tải dữ liệu các năm: " + err.message);
  });

  setupYearNavigationButtons(); // Thiết lập sự kiện cho nút điều hướng
}

document.addEventListener("DOMContentLoaded", main);
