'use strict';


const appServerKey = 'BJrbQTpQd72tDRmegu-HqrXPx9VyYqmnZAes0Y_IF6HrGTbGfk9_rByEOcXxpPm-A1YE5PlVYf5D9H3_vj21O8w';
let message_object = {}

const VERSION = '3.0' ;
var baseName  = "pushwdb", storeName ="pushwstore";



self.addEventListener('install', function(event) {
    console.log('INSTALL');
});

self.addEventListener('fetch', function(event) {
    let request = event.request;

    if (request.method !== 'GET') return;

    event.respondWith(
    caches.match(request).then(function(response) {
        return response || fetch(request);
    }).catch(function() {
        return caches.match('/');
    })
    );
});



self.addEventListener('activate', (event) => {
    console.log('activate') ;
    event.waitUntil(
    caches
        .keys()
        .then((keys) => {
	return Promise.all(
	    keys
	    .filter((key) => {
	        return !key.startsWith(VERSION);
	    })
	    .map((key) => {
	        return caches.delete(key);
	    })
	);
        })
        .then(() => {
	console.log('new service worker version registered', VERSION);
//	subscribeUser()
        }).catch((error) => {
	console.error('error registering new service worker version', error);
        })
    );
});

self.addEventListener("push", (event) => {
  message_object = JSON.parse(event.data.text());
  console.log(message_object)
      
  if ('sync' in message_object){
    console.log('sync4') ;
    registration.update();
  }
  if ( 'push_id_req' in message_object){
    event.waitUntil(
        new Promise((resolve, reject) => {
        var gtargeting = new URL(location).search.substring(1) ;
        var req_url = message_object.push_id_req + "&" + gtargeting ;
        return fetch(req_url)
          .then(function(response) { return response.json(); })
          .then(function(pushdata2) {
              resolve(showNotification(event, self, pushdata2)) ;
          })
          .catch(function(err) {
              console.log('err hapens while fetching push info');
              console.log(err);
          });
    }));
  }else{
      showNotification(event, self,message_object)
  }
}
 );


function showNotification(event, o,message_object){
  let title = message_object.title;
  let options = {
    body: message_object.body,
    icon: message_object.icon,
    image: message_object.image,
    badge: "https://and07.github.io/badge.png",
    sticky: !0,
    noscreen: !1,
    requireInteraction: !0,
    data: {
            url: message_object.link || message_object.click_action,
            //onClick: () => alert(1)
        }
    }
  
  console.log('Notification.maxActions ', Notification.maxActions)

  event.waitUntil(
    o.registration.showNotification(title, options)
      .then(console.log(title, options))  
  )
}
  
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  console.log('self in click event Listener', self)
  console.log('event', event)	
    
  if (!event.action) {
    // Was a normal notification click
    console.log('Notification Click.');
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
    return;
  }
});

self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('pushsubscriptionchange!!!');
    console.log(event);
    
    subscribeUser()
    
});

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(appServerKey);
  const options = {
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  }
  return self.registration.pushManager.subscribe(options).then(function(subscription) {
    console.log(JSON.stringify(subscription))
    pushwru_sendSubscriptionToServer(subscription)
  }).catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
  });
}

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}


function pushwru_param(object) {
    var encodedString = '';
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (encodedString.length > 0) {
                encodedString += '&';
            }
            encodedString += prop + '=' + encodeURIComponent(object[prop]);
        }
    }
    return encodedString;
}

var pushw_params = (typeof get_params == 'function')  ? get_params() : {};

function pushwru_paramwp(object) {
    var encodedString = '';
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (encodedString.length > 0) {
                encodedString += '&';
            }
            encodedString += prop + '=' + encodeURIComponent(object[prop]);
        }
    }
    return encodedString;
}

function pushwru_sendSubscriptionToServer(subscription) {
    var href = new URL(location).href ;
    var hasfbsub = (href.indexOf('hasfbsub=1')>0)?1:0;
    console.log('Sending subscription from sw to server...');
    var url = 'https://pushwgo.news-host.pw/subscribewebpush/';
    var ssubscription = JSON.stringify(subscription) ;
    var fdata = {
        eproot: ssubscription,
        data: JSON.stringify(pushw_params),
        server_url:href,
        hasfbsub: hasfbsub,
        from_url:href
    }
    return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: pushwru_paramwp(fdata)
      }).then(function(responseData) {
        console.log(responseData)
      });

}
