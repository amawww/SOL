document.getElementById("algorithm").addEventListener("change", function () {
  const quantumContainer = document.getElementById("quantum-container");
  quantumContainer.style.display = this.value === "RR" ? "block" : "none";
});

function addProcess() {
  const table = document.getElementById("process-rows");
  const rowCount = table.rows.length + 1;
  const row = table.insertRow();
  row.innerHTML = `
    <td>P${rowCount}</td>
    <td><input type="number" class="arrival" min="0" value="0"></td>
    <td><input type="number" class="burst" min="1" value="1"></td>
  `;
}

function getProcesses() {
  const arrival = document.querySelectorAll(".arrival");
  const burst = document.querySelectorAll(".burst");
  const processes = [];
  for (let i = 0; i < arrival.length; i++) {
    processes.push({
      id: `P${i + 1}`,
      arrival: parseInt(arrival[i].value),
      burst: parseInt(burst[i].value),
    });
  }
  return processes;
}

function simulate() {
  const algorithm = document.getElementById("algorithm").value;
  let processes = getProcesses();
  const quantum = parseInt(document.getElementById("quantum").value) || 2;

  switch (algorithm) {
    case "FIFO":
      processes.sort((a, b) => a.arrival - b.arrival);
      break;
    case "SJF":
      processes.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
      break;
  }

  let currentTime = 0;
  let resultHTML = "<table><tr><th>Proses</th><th>Start</th><th>End</th></tr>";
  let completed = [];
  let remaining = processes.map(p => ({ ...p, remaining: p.burst }));
  let readyQueue = [];

  if (algorithm === "RR") {
    while (remaining.length > 0) {
      let executed = false;
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].arrival <= currentTime) {
          let p = remaining[i];
          let runTime = Math.min(quantum, p.remaining);
          resultHTML += `<tr><td>${p.id}</td><td>${currentTime}</td><td>${currentTime + runTime}</td></tr>`;
          currentTime += runTime;
          p.remaining -= runTime;
          if (p.remaining === 0) remaining.splice(i--, 1);
          executed = true;
        }
      }
      if (!executed) currentTime++;
    }
  } else if (algorithm === "SRJF") {
    while (remaining.length > 0) {
      readyQueue = remaining.filter(p => p.arrival <= currentTime);
      if (readyQueue.length === 0) {
        currentTime++;
        continue;
      }
      readyQueue.sort((a, b) => a.remaining - b.remaining);
      let p = readyQueue[0];
      resultHTML += `<tr><td>${p.id}</td><td>${currentTime}</td><td>${currentTime + 1}</td></tr>`;
      p.remaining--;
      if (p.remaining === 0) {
        remaining = remaining.filter(proc => proc.id !== p.id);
      }
      currentTime++;
    }
  } else {
    for (let p of processes) {
      let start = Math.max(currentTime, p.arrival);
      let end = start + p.burst;
      resultHTML += `<tr><td>${p.id}</td><td>${start}</td><td>${end}</td></tr>`;
      currentTime = end;
    }
  }

  resultHTML += "</table>";
  document.getElementById("result").innerHTML = resultHTML;
}
