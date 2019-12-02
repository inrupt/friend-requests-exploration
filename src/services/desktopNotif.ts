import SolidAuth from 'solid-auth-client';

function subscribe(url: string, wssObj: WebSocket) {
  const msg = 'sub ' + url;
  console.log(msg)
  wssObj.send(msg)
}
    
export type MessageFormatter = (url: string, isSub: boolean) => Promise<string>;

const webSocketClients: { [url: string]: Promise<WebSocket> } = {}
function setupWebSocketClient(wssUrl: string, messageFormatter: MessageFormatter): Promise<WebSocket> {
  if (!webSocketClients[wssUrl]) {
    webSocketClients[wssUrl] = new Promise((resolve) => {
      const wssObj = new WebSocket(wssUrl)
      wssObj.onmessage = (msg) => {
        console.log(msg.data)
        if (msg.data.substring(0, 4) === 'ack ') {
          messageFormatter(msg.data.substring(4), true).then((formatted: string) => {
            var notification = new Notification(formatted);
            void notification;
          });

          var notification = new Notification('subscribed to ' + msg.data.substring(4));
          void notification;
        } else {
          messageFormatter(msg.data.substring(4), false).then((formatted: string) => {
            var notification = new Notification(formatted);
            void notification;
          });
        }
      }
      wssObj.onopen = () => {
        resolve(wssObj)
      }
    });
  }
  return webSocketClients[wssUrl];
}

async function discoverAndSubscribe(url: string, messageFormatter: MessageFormatter) {
  console.log('discovering Updates-Via for:', url);
  const response = await SolidAuth.fetch(url);
  const wssUrl = response.headers.get('Updates-Via')
  if (wssUrl === null) {
    const session = await SolidAuth.currentSession();
    if (!session) {
      window.alert('Please log in to access ' + wssUrl)
    } else {
      window.alert(session.webId + ' has no access to ' + url)
    }
    return
  }
  console.log('setting up WebSocket', wssUrl)
  const wssObj = await setupWebSocketClient(wssUrl, messageFormatter)
  subscribe(url, wssObj);
}

export function notifyMe(url: string, messageFormatter: MessageFormatter) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    discoverAndSubscribe(url, messageFormatter);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        discoverAndSubscribe(url, messageFormatter);
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}