
var urlsToCache = [
  "/",
  "/other_dirs"
];

const cacheName = "v0.0.1";

self.addEventListener("install", (e) => {
  console.log("service worker installed");
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("cachefilemuch");
        cache.addAll(urlsToCache);
      })
      .then()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache != cacheName) {
            console.log("deleting thingies");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});


function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

let regied = 0
const keyz = "ASDFGDfdjhdfgjfgVvtlwe4yNN80XvMFwnx3R7eI7kYDEGFgsHHfdjh54jgfjgfCf67Y0yV5YKrHecGrnTo9w82Q9fnSAGg"



self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});



self.addEventListener('notificationclick', event => {
	console.log(event.notification)
	//maybe a switch  for multi sub cases
	// switch(event.action){
    // case 'open_url':
    // clients.openWindow(event.notification.data.url); //which we got from above
    // break;
    // case 'any_other_action':
    // clients.openWindow("https://example.com");
    // break;
   // }
   if(event.notification.data){
   	clients.openWindow(event.notification.data);
   }
});

  


self.addEventListener("push", e => {
  const data = e.data.json();
  console.log(data)
  return self.registration.showNotification(data.title, {
    body: data.body,
    icon:data.icon,
    data: data.data,
    actions:[
      {action:"close", title:'Close'}
    ]
  });
});
