var u = (s, o, e) =>
  new Promise((c, a) => {
    var n = (t) => {
        try {
          r(e.next(t));
        } catch (l) {
          a(l);
        }
      },
      i = (t) => {
        try {
          r(e.throw(t));
        } catch (l) {
          a(l);
        }
      },
      r = (t) => (t.done ? c(t.value) : Promise.resolve(t.value).then(n, i));
    r((e = e.apply(s, o)).next());
  });
let g = [];
chrome.runtime.onInstalled.addListener(function (s) {
  u(this, null, function* () {
    if (s.reason === "install") {
      const o = {
        "credit-card-number": !0,
        name: !0,
        "email-address": !0,
        "phone-number": !0,
        address: !0,
        "social-security-number": !0,
        "secret-key": !0,
      };
      yield chrome.storage.sync.set(o),
        yield chrome.storage.sync.set({ totalDetections: 3 });
    }
  });
});
chrome.runtime.onMessage.addListener(function (s, o, e) {
  var c, a, n;
  if ((console.log(s, "request in background"), s.apiList))
    return (
      (g = (c = s.apiList) == null ? void 0 : c.policies),
      chrome.storage.local.set(
        { apiList: (a = s.apiList) == null ? void 0 : a.policies },
        () => {
          console.log("API List stored in Chrome storage.");
        }
      ),
      e({ success: !0, message: "API List stored successfully" }),
      !0
    );
  if (s.type === "PROCESS_MESSAGE") {
    const i = s.message,
      r =
        (n = g == null ? void 0 : g.map((t) => t.detectors)) == null
          ? void 0
          : n.flat();
    return (
      chrome.storage.sync.get(["accessToken", "user"], function (t) {
        return u(this, null, function* () {
          const l = t.accessToken;
          if (!l) {
            console.log("User is not logged in, accessToken not found."),
              e({ success: !0, response:{original_input:i} });
            return;
          }
          try {
            const d = yield fetch(
              "http://localhost:5000/masking/mask",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${l}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user_input: i,
                  sensitive_data_params: r,
                }),
              }
            );
            if (!d.ok)
              throw new Error(`Backend API returned error: ${d.statusText}`);
            const h = yield d.json();
            console.log("Backend response:", h),
            e(h),
              chrome.storage.sync.set({ totalDetections: 3 }, () => {
                console.log("Total detections set to 3.");
              });
          } catch (d) {
            console.error("Error contacting backend:", d),
              e({ success: !1, error: d.message, modifiedMessage: s.message }),
              chrome.storage.sync.set({ totalDetections: 0 }, () => {
                console.log("Error detected, reset total detections to 0.");
              });
          }
        });
      }),
      !0
    );
  }
});
function m(s) {
  return u(this, null, function* () {
    try {
      const o = yield fetch(
        "http://localhost:5000/policy/list",
        { method: "GET", headers: { Authorization: `Bearer ${s}` } }
      );
      if (o) {
        const e = yield o.json();
        e != null &&
          e.policies &&
          (console.log("API List fetched:", e),
          (g = e == null ? void 0 : e.policies),
          chrome.storage.local.set(
            { apiList: e == null ? void 0 : e.policies },
            () => {
              console.log("API List stored in Chrome storage.");
            }
          ));
        return;
      } else console.error("Failed to fetch API list");
    } catch (o) {
      console.error("Error fetching API list:", o);
    }
  });
}
chrome.runtime.onMessage.addListener((s, o, e) => {
  if (s.type === "login") {
    const { username: c, password: a } = s.formData,
      n = { username: c, password: a };
    try {
      fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n),
      })
        .then((r) => {
          r
            ? r
                .json()
                .then((t) => {
                  chrome.storage.sync.set({
                    accessToken: t.access_token,
                    user: t.user,
                  }),
                    m(t.access_token),
                    e({ success: !0, user: t.user });
                })
                .catch((t) => {
                  console.error("Error parsing JSON:", t),
                    e({ success: !1, error: t.message });
                })
            : e({ success: !1, error: "Invalid credentials" });
        })
        .catch((r) => {
          console.error("Error:", r), e({ success: !1, error: r.message });
        });
    } catch (i) {
      console.error("Error:", i), e({ success: !1 });
    }
  }
  return !0;
});
chrome.runtime.onMessage.addListener(function (s) {
  u(this, null, function* () {
    if (s.detectorToggle !== void 0) {
      const o = s.detectorToggle,
        c = (yield chrome.storage.sync.get([o]))[o];
      yield chrome.storage.sync.set({ [o]: !c });
    }
  });
});
