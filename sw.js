// Service worker: cho phép cài app và mở giao diện khi mất mạng.
// Các lệnh gọi API và proxy là cross-origin nên không bao giờ bị cache ở đây.
const CACHE = "dich-truyen-v2";
const SHELL = ["./", "index.html", "cao-truyen.html", "manifest.webmanifest", "icon.svg", "cover-template.jpg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  // Cache từng file riêng, thiếu một file không làm hỏng cả quá trình cài.
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Mạng trước (để bản mới hiện ngay sau khi cập nhật), mất mạng thì dùng bản đã lưu.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./")))
  );
});
