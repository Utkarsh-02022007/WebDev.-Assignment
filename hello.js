let addBtn = document.getElementById("addEvent");
let eventList = document.getElementById("eventList");

addBtn.addEventListener("click", function () {
  let title = document.getElementById("title").value;
  let date = document.getElementById("date").value;
  let cat = document.getElementById("category").value;
  let desc = document.getElementById("desc").value;

  if (title === "" || date === "") {
    alert("Title and Date required");
    return;
  }

  eventList.innerHTML = "";

  let div = document.createElement("div");
  div.className = "event-item";
  div.innerHTML = "<h4>" + title + "</h4><p>" + date + " | " + cat + "</p><p>" + desc + "</p>";

  eventList.appendChild(div);
});

document.getElementById("clearAll").onclick = function () {
  eventList.innerHTML = '<p class="empty">No events yet. Add your first event!</p>';
};

document.getElementById("sample").onclick = function () {
  eventList.innerHTML = "";
  let sample = document.createElement("div");
  sample.className = "event-item";
  sample.innerHTML = "<h4>Sample Event</h4><p>2026-02-20 | Workshop</p><p>Demo event</p>";
  eventList.appendChild(sample);
};



