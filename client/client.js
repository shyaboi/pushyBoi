const publicVapidKey =
  "BPE9zLVlRtVvtlwe4yNN80XvMFwnx3R7eI7kYXwtsQF1ceKJIqoCeZ1Cf67Y0yV5YKrHecGrnTo9w82Q9fnSAGg";





// Register SW, Register Push, Send Push
async function send() {
  // Register Service Worker
  console.log("Registering service worker...");
  const register = await navigator.serviceWorker.register("/worker.js", {
    scope: "/"
  });
  console.log("Service Worker Registered...");

  // Register Push
  console.log("Registering Push...");
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log("Push subscribed...");

 return subscription
}



// let ok = document.getElementById('butt');
// ok.addEventListener('click',()=>{
  // Check for service worker
  if ("serviceWorker" in navigator) {
    send().then((sub)=>{
      fetch("/sub", {
        method: "POST",
        body: JSON.stringify({
          endpoint:sub.endpoint, 
          host:'benix.com',
          sub:JSON.stringify(sub)
        }),
        headers: {
          "content-type": "application/json"
        }
      });
    }).catch(err => console.error(err));
  }
// })


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