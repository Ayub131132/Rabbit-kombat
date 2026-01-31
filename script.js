// ================= CONFIG =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxLT9y-1YFG6LLRBcePEmMcTFvq2NiZ4A",
  authDomain: "rabbit-kombat-56122.firebaseapp.com",
  projectId: "rabbit-kombat-56122",
  storageBucket: "rabbit-kombat-56122.firebasestorage.app",
  messagingSenderId: "744320568726",
  appId: "1:744320568726:web:acfb93b1e16e68b56921b7"
};

const BACKEND_URL = "https://patient-bush-ad54.ayubgaming867.workers.dev";

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tg = window.Telegram.WebApp;
tg?.ready();
tg?.expand();

const tgUser = tg?.initDataUnsafe?.user;

if (!tgUser) {
  alert("Please open this app from Telegram");
  document.body.style.display = "none";
  throw new Error("Not opened inside Telegram");
}

const userId = String(tgUser.id);
const refDoc = doc(db, "users", userId);

// ================= UI =================
const pointsDisplay = document.getElementById("points");
const loading = document.getElementById("loading");
const appUI = document.getElementById("app");

// ================= START =================
async function startApp() {
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    await setDoc(refDoc, {
      userName: tgUser.username || "Player",
      name: tgUser.first_name || "Player",
      coins: 0,
      completedTasks: {}
    });
  }
  setupGame();
}

// ================= GAME CORE =================
function setupGame() {
  onSnapshot(refDoc, snap => {
    if (!snap.exists()) return;
    pointsDisplay.innerText = snap.data().coins || 0;
    loading.style.display = "none";
    appUI.style.display = "block";
  });

  // Tap
  document.getElementById("logo").addEventListener("click", async e => {
    showFloatingText(e);
    await updateBackend("tap_reward");
  });

  // Referral
  const inviteLink = `https://t.me/Rabbitkombatofc_bot?startapp=${userId}`;
  document.getElementById("referral-link").value = inviteLink;
}

// ================= EFFECT =================
function showFloatingText(e) {
  const el = document.createElement("p");
  el.className = "el";
  el.innerText = "+10";
  el.style.top = e.clientY + "px";
  el.style.left = e.clientX + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// ================= BACKEND =================
async function updateBackend(taskId) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData: tg.initData,
        taskId
      })
    });

    const data = await res.json();
    if (data.success) {
      pointsDisplay.innerText = data.newBalance;
      return true;
    } else {
      tg.showAlert(data.error || "Failed");
      return false;
    }
  } catch (e) {
    tg.showAlert("Server error");
    return false;
  }
}

// ================= TASK FLOW =================
window.handleTask = async function(taskId, reward, link) {
  const btn = document.getElementById(`btn-${taskId}`);

  // GO
  if (btn.innerText === "Go") {
    tg.openLink(link);
    btn.innerText = "Check";
    return;
  }

  // CHECK
  if (btn.innerText === "Check") {
    btn.innerText = "Checking...";
    btn.disabled = true;

    const ok = await updateBackend(taskId);

    if (ok) {
      btn.innerText = "Claim";
      btn.disabled = false;
    } else {
      btn.innerText = "Go";
      btn.disabled = false;
    }
    return;
  }

  // CLAIM
  if (btn.innerText === "Claim") {
    btn.innerText = "Completed";
    btn.disabled = true;
  }
};

// ================= LEADERBOARD =================
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(target).classList.add("active");
    if (target === "leaderboard") updateLeaderboard();
  });
});

async function updateLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  const q = query(
    collection(db, "users"),
    orderBy("coins", "desc"),
    limit(100)
  );

  const snap = await getDocs(q);
  list.innerHTML = "";
  let rank = 1;

  snap.forEach(doc => {
    const u = doc.data();
    list.innerHTML += `
      <div class="lb-row">
        <span>#${rank}. ${u.name || "Player"}<br><small>@${u.userName || ""}</small></span>
        <span class="coins">${u.coins} 🥕</span>
      </div>
    `;
    rank++;
  });
}

// ================= COPY =================
document.getElementById("copy-btn").addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementById("referral-link").value);
  tg.showAlert("Link Copied!");
});

// ================= START =================
startApp();