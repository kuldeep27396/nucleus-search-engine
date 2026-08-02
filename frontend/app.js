const API_BASE = "http://localhost:8000";

const PERSONAS = {
  intern: {
    userId: "usr_intern_01",
    email: "intern@acme.com",
    role: "intern",
    acls: "group_all"
  },
  eng_lead: {
    userId: "usr_alex_02",
    email: "alex@acme.com",
    role: "employee",
    acls: "group_all,group_eng"
  },
  hr_manager: {
    userId: "usr_sarah_03",
    email: "sarah@acme.com",
    role: "manager",
    acls: "group_all,group_hr,group_exec"
  },
  admin: {
    userId: "usr_admin_00",
    email: "admin@acme.com",
    role: "admin",
    acls: "group_all,group_eng,group_hr,group_exec"
  }
};

function getHeaders() {
  const pKey = document.getElementById("personaSelect").value;
  const p = PERSONAS[pKey] || PERSONAS.hr_manager;

  return {
    "Content-Type": "application/json",
    "X-User-Id": p.userId,
    "X-Tenant-Id": "tenant_acme",
    "X-User-Email": p.email,
    "X-User-Role": p.role,
    "X-User-ACLs": p.acls
  };
}

async function checkLicenseStatus() {
  try {
    const res = await fetch(`${API_BASE}/v1/enterprise/license-status`);
    const data = await res.json();
    const badge = document.getElementById("editionBadge");
    if (data.mode === "enterprise") {
      badge.innerText = "ENTERPRISE UNLOCKED (Ed25519)";
      badge.style.background = "rgba(16, 185, 129, 0.2)";
      badge.style.color = "#34d399";
      badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
    } else {
      badge.innerText = "COMMUNITY EDITION";
      badge.style.background = "rgba(59, 130, 246, 0.2)";
      badge.style.color = "#60a5fa";
    }
  } catch (e) {
    console.error("Health check error:", e);
  }
}

async function executeSearch() {
  const query = document.getElementById("searchInput").value;
  if (!query.trim()) return;

  const aiBox = document.getElementById("aiAnswerBox");
  const aiText = document.getElementById("aiAnswerText");
  const resultsContainer = document.getElementById("resultsContainer");

  aiBox.style.display = "block";
  aiText.innerHTML = "<em>Generating grounded answer & executing hybrid RLS vector search...</em>";
  resultsContainer.innerHTML = "<div style='color: var(--text-muted); text-align: center;'>Searching...</div>";

  try {
    const res = await fetch(`${API_BASE}/v1/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ query, top_k: 5 })
    });

    const data = await res.json();

    // Render AI RAG Answer
    aiText.innerHTML = `<p>${data.answer}</p>
      <div style="margin-top: 12px; font-size: 0.8rem; color: var(--text-muted);">
        Model: ${data.model_used} | Latency: ${data.execution_time_ms}ms | RLS Protected: True
      </div>`;

    // Render Search Results Chunks
    if (!data.retrieved_chunks || data.retrieved_chunks.length === 0) {
      resultsContainer.innerHTML = `<div class="result-card" style="text-align: center; color: var(--text-muted);">
        🔒 Zero document chunks retrieved (Filtered by PostgreSQL RLS for identity: ${getHeaders()["X-User-Email"]})
      </div>`;
      return;
    }

    let html = "";
    data.retrieved_chunks.forEach(item => {
      let badgeClass = "badge-hybrid";
      if (item.match_type === "bm25") badgeClass = "badge-bm25";
      if (item.match_type === "vector") badgeClass = "badge-vector";

      html += `
        <div class="result-card">
          <div class="result-header">
            <a class="result-title" href="${item.url || '#'}" target="_blank">📄 ${item.title}</a>
            <div class="result-meta">
              <span class="badge ${badgeClass}">${item.match_type.toUpperCase()} MATCH</span>
              <span class="badge" style="background: rgba(255,255,255,0.1);">RRF Score: ${item.score}</span>
              <span class="badge" style="background: rgba(139,92,246,0.2); color:#c084fc;">Chunk: ${item.chunk_id}</span>
            </div>
          </div>
          <div class="result-snippet">${item.content}</div>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;

  } catch (e) {
    aiText.innerText = "Error executing search: " + e.message;
    resultsContainer.innerHTML = "";
  }
}

async function syncLocalDir() {
  const statusEl = document.getElementById("syncStatus");
  statusEl.innerText = "Syncing local directory files...";
  try {
    const res = await fetch(`${API_BASE}/v1/documents/sync-directory?directory_path=.`, {
      method: "POST",
      headers: getHeaders()
    });
    const data = await res.json();
    statusEl.innerText = `Synced ${data.synced_count} documents cleanly into PostgreSQL vector database.`;
  } catch (e) {
    statusEl.innerText = "Sync failed: " + e.message;
  }
}

async function syncGDrive() {
  const statusEl = document.getElementById("syncStatus");
  statusEl.innerText = "Syncing Google Drive stub documents...";
  try {
    const res = await fetch(`${API_BASE}/v1/documents/sync-gdrive`, {
      method: "POST",
      headers: getHeaders()
    });
    const data = await res.json();
    statusEl.innerText = `Synced ${data.synced_count} Google Drive confidential files cleanly into PostgreSQL vector database.`;
  } catch (e) {
    statusEl.innerText = "Sync failed: " + e.message;
  }
}

async function fetchAuditLogs() {
  const tbody = document.getElementById("auditLogsBody");
  tbody.innerHTML = "<tr><td colspan='5'>Fetching immutable audit logs...</td></tr>";

  try {
    const res = await fetch(`${API_BASE}/v1/audit/logs`, {
      headers: getHeaders()
    });
    const data = await res.json();

    if (!data.logs || data.logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan='5' style='text-align:center; color: var(--text-muted);'>${data.message || 'No audit logs found.'}</td></tr>`;
      return;
    }

    let html = "";
    data.logs.forEach(l => {
      html += `
        <tr>
          <td>${new Date(l.timestamp).toLocaleTimeString()}</td>
          <td><span style="color:#60a5fa; font-family:monospace;">${l.user_id}</span></td>
          <td>${l.query}</td>
          <td><span style="font-size:0.75rem; color:#c084fc;">${(l.retrieved_doc_ids || []).join(', ')}</span></td>
          <td>${l.execution_time_ms}ms</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='5' style='color:red;'>Error fetching audit logs: ${e.message}</td></tr>`;
  }
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById(tabId).style.display = "block";
  event.target.classList.add("active");

  if (tabId === "auditTab") {
    fetchAuditLogs();
  }
}

function openLicenseModal() {
  document.getElementById("licenseModal").style.display = "flex";
}

function closeLicenseModal() {
  document.getElementById("licenseModal").style.display = "none";
}

async function activateLicense() {
  const jwtToken = document.getElementById("licenseJwtInput").value.trim();
  if (!jwtToken) return;

  try {
    const res = await fetch(`${API_BASE}/v1/enterprise/activate-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: jwtToken })
    });
    const data = await res.json();
    if (res.ok) {
      alert("🎉 " + data.message);
      closeLicenseModal();
      checkLicenseStatus();
    } else {
      alert("❌ Activation Error: " + data.detail);
    }
  } catch (e) {
    alert("Activation Error: " + e.message);
  }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  checkLicenseStatus();
  // Sync Google Drive stub automatically on load to populate demo data
  syncGDrive().then(() => executeSearch());
});
