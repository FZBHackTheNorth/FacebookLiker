var ip = '192.168.1.119'
var port = ':5657'
var app_json = ''
var current = null;

Pebble.addEventListener("ready",
	function(e) {
		console.log("started js app");

		if (window.localStorage.getItem('ip') !== null) {
			ip = window.localStorage.getItem('ip');
			console.log("Loading config ip=" + ip);
		}

		var xhr = new XMLHttpRequest();
		xhr.open("GET", 'http://' + ip + port + "/assets/app.json", true);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if(xhr.status === 200) {
					console.log("connected");
					console.log(xhr.responseText);
					app_json = JSON.parse(xhr.responseText);
					console.log(app_json.nodeDataArray[0].key);
					current = app_json.nodeDataArray[0].key;
					var filename = app_json.nodeDataArray[0].source.substring(2);
					console.log("getting initial image: " + filename);

					getPNG(filename, function(bytes) {transferImageBytes(bytes, 2044);});

				} else {
					console.log(xhr.statusText);
				}
			}else{
				console.log("status wrong " + xhr.statusText);
			}
		}
		xhr.onerror = function (e) {
			console.log(xhr.statusText);
		}
		xhr.send(null);
	}
	);

function transferImageBytes(bytes, chunkSize) {
	var retries = 0;

// This function sends chunks of data.
sendChunk = function(start) {
		var txbuf = bytes.slice(start, start + chunkSize);
		console.log("Sending " + txbuf.length + " bytes - starting at offset " + start);
		Pebble.sendAppMessage({ "png_data": txbuf },
			function(e) {
			// If there is more data to send - send it.
				if (bytes.length > start + chunkSize) {
					sendChunk(start + chunkSize);
				}
			},
			// Failed to send message - Retry a few times.
			function (e) {
				if (retries++ < 3) {
					console.log("Got a nack for chunk #" + start + " - Retry...");
					sendChunk(start);
				}
			}
		);
};

//start sending png data to pebble
sendChunk(0);
}



function getPNG(filename, callback, errorCallback) {
	var req = new XMLHttpRequest();
	req.open("GET", "http://" + ip + port + "/" + filename,true);
	req.responseType = "arraybuffer";
	req.onload = function(e) {
		console.log("loaded");
		var buf = req.response;
		if(req.status == 200 && buf) {
			var byteArray = new Uint8Array(buf);
			var arr = [];
			for(var i=0; i<byteArray.byteLength; i++) {
				arr.push(byteArray[i]);
			}

			console.log("Received image with " + byteArray.length + " bytes.");
			callback(arr);
		} else {
			errorCallback("Request status is " + req.status);
		}
	}
	req.onerror = function(e) {
		errorCallback(e);
	}
	req.send(null);
}

// got message from pebble
Pebble.addEventListener("appmessage", function(e) {
	console.log("got message " + JSON.stringify(e.payload));
	if (e.payload.button_event !== undefined) {
			console.log("button_event: " + e.payload.button_event);
			var button_map = {
				"1": "Up",
				"2": "Sel",
				"3": "Dwn"
			};

			console.log("current:" + current);

			for( var link_id in app_json.linkDataArray){
				if( app_json.linkDataArray[link_id].from === current &&
					app_json.linkDataArray[link_id].fromPort === button_map[e.payload.button_event]){
						console.log("to:" + app_json.linkDataArray[link_id].to);
						//set the new current node
						current = app_json.linkDataArray[link_id].to;

						for (var node_id in app_json.nodeDataArray) {
							if( app_json.nodeDataArray[node_id].key === current) {
								var filename = app_json.nodeDataArray[node_id].source.substring(2);
								console.log("image:" + filename);

								getPNG(filename, function(bytes) {transferImageBytes(bytes, 2044);
								});
								break;
							}
						}
						break;
			}
		}
	}
});

// !do not do this with the full content
// just point to github url (but look ad how the pebblejs://close response returns
// the data to webviewclosed
Pebble.addEventListener("showConfiguration", function() {
	console.log("showing configuration");
	Pebble.openURL("data:text/html,"+encodeURI('<!DOCTYPE html> <html> <head> <title>Configure_Sketchup</title> <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><input type="text" id="ip" value="10.0.127.103" style="height:30px;"/><br><br><button style="width:100px;height:60px;" onclick="saveConf();">Save</button><script type="text/javascript">function saveConf(){var result = {}; result["ip"] = document.getElementById("ip").value;document.location = "pebblejs://close#" + encodeURIComponent(JSON.stringify(result));}</script></body></html><!--.html'));
});

Pebble.addEventListener("webviewclosed", function(e) {
	console.log("configuration closed");
	if (e.response && e.response.length) {
		var json_data = decodeURIComponent(e.response);
		var config = JSON.parse(json_data);
		window.localStorage.setItem("ip",config.ip);
		console.log("setting ip to " + config.ip);
	}
});