self.addEventListener("push", (event) => {
  let data = { title: "SCUDO ITALIA", body: "Nuova allerta", url: "/" };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: "/icon.svg", badge: "/icon.svg", data }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
