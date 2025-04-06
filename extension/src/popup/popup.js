var i = (t, e, o) =>
  new Promise((s, n) => {
    var r = (a) => {
        try {
          d(o.next(a));
        } catch (l) {
          n(l);
        }
      },
      c = (a) => {
        try {
          d(o.throw(a));
        } catch (l) {
          n(l);
        }
      },
      d = (a) => (a.done ? s(a.value) : Promise.resolve(a.value).then(r, c));
    d((o = o.apply(t, e)).next());
  });
const g = ["chat.openai.com", "chatgpt.com"];
function y(t) {
  return i(this, null, function* () {
    for (const e of t) {
      const s = (yield chrome.storage.sync.get([e.id]))[e.id],
        n = e.querySelector(".detector-toggle-input");
      n !== null && (n.checked = s);
    }
    setTimeout(() => {
      for (const e of t) {
        const o = e.querySelector(".detector-toggle-animation");
        o == null || o.classList.add("after:transition-all");
      }
    }, 1e3);
  });
}
function f(t) {
  for (const e of t)
    e.addEventListener("click", () => {
      chrome.runtime.sendMessage({ detectorToggle: e.id });
    });
}
function h() {
  return i(this, null, function* () {
    const t = document.getElementById("stats-page"),
      e = document.getElementById("stats-total"),
      o = document.createElement("span");
    o.classList.add("font-bold", "py-1");
    const s = document.createElement("span");
    if ((s.classList.add("font-bold", "py-1"), t !== null)) {
      const [n] = yield chrome.tabs.query({
        active: !0,
        lastFocusedWindow: !0,
      });
      if (
        n.id !== void 0 &&
        n.url !== void 0 &&
        g.some((r) => {
          var c;
          return (c = n.url) == null ? void 0 : c.includes(r);
        })
      )
        chrome.tabs.sendMessage(
          n.id,
          { triggeredDetectors: "GET" },
          function (r) {
            i(this, null, function* () {
              (o.textContent =
                r !== null && r.triggeredDetectors !== void 0
                  ? r.triggeredDetectors.toString()
                  : "0"),
                t.appendChild(o);
              const d = (yield chrome.storage.sync.get(["totalDetections"]))
                .totalDetections;
              (s.textContent = d.toString()), e == null || e.appendChild(s);
            });
          }
        );
      else {
        (o.textContent = "0"), t.appendChild(o);
        const c = (yield chrome.storage.sync.get(["totalDetections"]))
          .totalDetections;
        (s.textContent = c.toString()), e == null || e.appendChild(s);
      }
    }
  });
}
function p() {
  return i(this, null, function* () {
    const { accessToken: t, user: e } = yield chrome.storage.sync.get([
      "accessToken",
      "user",
    ]);
    t && e ? m(e) : u();
  });
}
function u() {
  const t = document.getElementById("loginForm"),
    e = document.getElementById("dashboard");
  t && (t.style.display = "block"), e && (e.style.display = "none");
}
function m(t) {
  const e = document.getElementById("loginForm"),
    o = document.getElementById("dashboard"),
    s = document.getElementById("username-display");
  e && (e.style.display = "none"),
    o && ((o.style.display = "block"), (o.style.height = "100%")),
    s && (s.innerHTML = t);
}
function E(t) {
  return i(this, null, function* () {
    t.preventDefault();
    const e = t.target,
      o = new FormData(e),
      s = { username: o.get("username"), password: o.get("password") };
    try {
      const n = yield fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s),
        }
      );
      if (n.ok) {
        const r = yield n.json();
        yield chrome.storage.sync.set({
          accessToken: r.access_token,
          user: r.user.username,
        }),
          m(r.user.username),
          yield D(r.access_token);
          window.location.reload()
      } else console.error("Login failed");
    } catch (n) {
      console.error("Error:", n);
    }
  });
}
function D(t) {
  return i(this, null, function* () {
    try {
      // Retrieve the user from chrome.storage.sync
      const userResult = yield new Promise((resolve, reject) => {
        chrome.storage.sync.get("user", (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      const user = userResult.user;

      if (!user) {
        console.error("User not found in storage");
        return;
      }

      // Use the retrieved user in the fetch URL
      const e = yield fetch(
        `http://127.0.0.1:8000/policy/list_policies`,
        { method: "GET", headers: { Authorization: `Bearer ${t}` } }
      );

      if (e.ok) {
        const o = yield e.json();
        console.log("API List:", o);

        // Send the API list via chrome.runtime.sendMessage
        yield new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ apiList: o }, () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending message:",
                chrome.runtime.lastError.message
              );
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              if (tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
              }
            }
          );
        });
      } else {
        console.error("Failed to fetch API list");
      }
    } catch (e) {
      console.error("Error fetching API list:", e);
    }
  });
}
function L() {
  window.location.reload()
  chrome.storage.sync.remove(["accessToken", "user"], () => {
    u();
   
  });
}
function T() {
  const t = document.getElementById("loginForm");
  t && t.addEventListener("submit", E);
  const e = document.getElementById("logout");
  e && e.addEventListener("click", L);
}
function S() {
  const t = document.querySelectorAll(".detector-toggle");
  y(t), f(t), h();
}
window.addEventListener("DOMContentLoaded", () => {
  p(), T(), S();
});
