const form = document.getElementById("form");
const input = document.getElementById("text");
const list = document.getElementById("list");

async function refresh() {
  const res = await fetch("/api/notes");
  const notes = await res.json();

  list.innerHTML = "";
  for (const n of notes) {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.innerHTML = `<div>${escapeHtml(n.text)}</div><small>${n.created_at}</small>`;

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "Delete";
    del.onclick = async () => {
      await fetch(`/api/notes/${n.id}`, { method: "DELETE" });
      refresh();
    };

    li.appendChild(left);
    li.appendChild(del);
    list.appendChild(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  input.value = "";
  refresh();
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

refresh();
