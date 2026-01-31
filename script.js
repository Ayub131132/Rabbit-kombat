import { initializeApp} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxLT9y-1YFG6LLRBcePEmMcTFvq2NiZ4A",
  authDomain: "rabbit-kombat-56122.firebaseapp.com",
  projectId: "rabbit-kombat-56122",
  storageBucket: "rabbit-kombat-56122.firebasestorage.app",
  messagingSenderId: "744320568726",
  appId: "1:744320568726:web:acfb93b1e16e68b56921b7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const tgUser = tg?.initDataUnsafe?.user;
const userId = tgUser?.id ? String(tgUser.id) : "1234567890";
const refDoc = doc(db, "users", userId);

const loading = document.getElementById("loading");
const appUI = document.getElementById("app");
const pointsDisplay = document.getElementById("points");


async function startApp() {
    const userSnap = await getDoc(refDoc);
    const startParam = tg?.initDataUnsafe?.start_param;

    if (!userSnap.exists()) {
        await setDoc(refDoc, {
            userName: tgUser?.username || "Player",
            name: (tgUser?.first_name || "Dev") + " " + (tgUser?.last_name || ""),
            coins: 0,
            isPremium: tgUser?.is_premium || false
        });
    }

    setupGame();
}

function setupGame() {
    let isAppReady = false;
    onSnapshot(refDoc, (snap) => {
        if (!snap.exists()) return;
        pointsDisplay.innerText = snap.data().coins || 0;
        if (!isAppReady) {
            loading.style.display = "none";
            appUI.style.display = "block";
            isAppReady = true;
        }
    });

    // Click Logic
    document.getElementById("logo").addEventListener("click", (e) => {
        showFloatingText(e);
    });

    // Referral Link
    const botUsername = "Rabbitkombatofc_bot";
    const inviteLink = `https://t.me/${botUsername}?startapp=${userId}`;
    document.getElementById("referral-link").value = inviteLink;
}

// --- HELPERS ---
function showFloatingText(e) {
    const el = document.createElement("p");
    el.className = "el";
    el.innerText = "+10";
    el.style.top = e.clientY + "px";
    el.style.left = e.clientX + "px";
    el.style.animation = "floatUp 2s ease infinite"
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

// Tabs Logic
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
    limit(200)
  );

  const snap = await getDocs(q);
  list.innerHTML = "";
  let rank = 1;

  snap.forEach(doc => {
    const u = doc.data();
    list.innerHTML += `
      <div class="lb-row">
        <span class="lb-name">#${rank}. ${u.name || "Player"}
        <br>
        <small>@${u.userName || "Player"}</small>
        </span>
        <span class="coins">${u.coins} 🥕</span>
      </div>
    `;
    rank++;
  });
}

document.getElementById("copy-btn").addEventListener("click", () => {
    const link = document.getElementById("referral-link").value;
    navigator.clipboard.writeText(link);
    tg.showAlert("Link Copied!");
});
const BACKEND_URL = "https://patient-bush-ad54.ayubgaming867.workers.dev";
async function updateBackend(taskId, reward) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                initData: tg.initData,
                taskId: taskId,
                rewardAmount: reward
            })
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById("points").innerText = result.newBalance;
            return true;
        } else {
            tg.showAlert("Verification failed: " + (result.error || "Unknown error"));
            return false;
        }
    } catch (e) {
        console.error("Backend Error:", e);
        tg.showAlert("Server connection failed.");
        return false;
    }
}
document.getElementById("logo").addEventListener("click", async (e) => {
    showFloatingText(e);
    await updateBackend("tap_reward", 10);
});
window.handleTask = async function(taskId, reward, link) {
    tg.openLink(link);
    const btn = document.getElementById(`btn-${taskId}`);
    const originalText = btn.innerText;
    btn.innerText = "⏳";
    btn.disabled = true;

    setTimeout(async () => {
        const success = await updateBackend(taskId, reward);
        if (success) {
            tg.showAlert(`Success! You earned ${reward} coins.`);
            btn.innerText = "✅";
        } else {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }, 5000);
};
startApp();