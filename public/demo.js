const form = document.getElementById("slot-form");
const results = document.getElementById("results");
const status = document.getElementById("status");

const toInputDate = (date) => date.toISOString().slice(0, 10);

const today = new Date();
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);
document.getElementById("from").value = toInputDate(today);
document.getElementById("to").value = toInputDate(nextWeek);

const renderSlots = (timezone, slots) => {
  results.innerHTML = "";
  if (!slots.length) {
    results.innerHTML =
      '<div class="empty">No slots matched those rules. Try widening the date window or reducing the restrictions.</div>';
    return;
  }

  slots.forEach((slot) => {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <time>${start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", timeZone: timezone })}</time>
      <strong>${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: timezone })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: timezone })}</strong>
      <p>${timezone}</p>
    `;
    results.appendChild(card);
  });
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "Calculating available windows...";
  results.innerHTML = "";

  const formData = new FormData(form);
  const payload = {
    from: `${formData.get("from")}T00:00:00`,
    to: `${formData.get("to")}T23:59:59`,
    timezone: formData.get("timezone"),
    slotDuration: Number(formData.get("slotDuration")),
    dailyFromHour: Number(formData.get("dailyFromHour")),
    dailyToHour: Number(formData.get("dailyToHour")),
    slots: Number(formData.get("slots")),
    padding: Number(formData.get("padding")),
    days: formData.getAll("days").map(Number),
    strategies: formData.getAll("strategies"),
  };

  try {
    const response = await fetch("/api/slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");

    status.textContent = `${data.slots.length} slot${data.slots.length === 1 ? "" : "s"} ready`;
    renderSlots(data.timezone, data.slots);
  } catch (error) {
    status.textContent = error.message;
    results.innerHTML =
      '<div class="empty">The demo could not generate slots right now. Please try again with a different range.</div>';
  }
});
