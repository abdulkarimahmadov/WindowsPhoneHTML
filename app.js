function updateMetroTime() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const left = document.getElementById("time-left");
  const right = document.getElementById("time-right");
  if (left) left.textContent = time;
  if (right) right.textContent = time;
}

document.addEventListener("DOMContentLoaded", () => {
  updateMetroTime();
  setInterval(updateMetroTime, 1000);
});
