var g_popupShown = false;

function getParameters(url) {
    if (!url) url = window.location.href;
    var query;
    var pos = location.href.indexOf("?");
    if(pos==-1) return {};
    query = location.href.substr(pos+1);
    var result = {};
    query.split("&").forEach(function(part) {
        if(!part) return;
        part = part.split("+").join(" "); // replace every + with space, regexp-free version
        var eq = part.indexOf("=");
        var key = eq>-1 ? part.substr(0,eq) : part;
        var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
        var from = key.indexOf("[");
        if(from==-1) result[decodeURIComponent(key)] = val;
        else {
            var to = key.indexOf("]",from);
            var index = decodeURIComponent(key.substring(from+1,to));
            key = decodeURIComponent(key.substring(0,from));
            if(!result[key]) result[key] = [];
            if(!index) result[key].push(val);
            else result[key][index] = val;
        }
    });
    return result;
}

function loadScript(src, scrid) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = src;

    if (scrid) {
      s.setAttribute('id', scrid);
    }

    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function show_pushwru_show(site) {
  if (location.protocol === 'https:' && !g_popupShown) {
    g_popupShown = true;
    var src = 'https://cf.just-news.pro/js/fcmjsgo/cfsubscribe3.js?data_callback=get_params&call_byfunc=1&site='+site;
    loadScript(src, "pushwscript").then(function (result) {
      if (typeof pushwru_show == 'function') {
        pushwru_show();
      }
    }, function (error) {
      console.log("push script not loaded :( " + error);
    });
  }
};

function pushw_webpushsub( afterfb = 0 ){
    var src = "https://cf.just-news.pro/js/fcmjsgo/pushwwp.js"
    loadScript(src, "pushwwpscript").then(function (result) {
        if (afterfb == 1){
            window.pushru_on_subscribed = function(){
                pushwru_SubscribeWebpush() ;
            }
            window.pushru_on_subscribe_fail = function(){
                pushwru_SubscribeWebpush() ;
            }
        }else{
            pushwru_SubscribeWebpush() ;
        }
    }, function (error) {
      console.log("webpush script not loaded :( " + error);
    });

}

