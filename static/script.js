var currentImage = null;
var init = true;
var thumbs;
var images;

function createElements(imgUrl, thumbUrl, caption, index) {
	// Returns image div and thumbnail image
    var div = document.createElement('div');
  	var img = document.createElement('img');
	var thumb = document.createElement('img');	
	var closeButton = document.createElement('img');
	  	
	closeButton.src = 'https://i.imgur.com/RvawxUU.png';
	closeButton.classList.add('close');
	img.src = imgUrl;
	thumb.src = thumbUrl;
	div.id = 'img' + (index+1);
	thumb.id = 'thumb' + (index+1);

	closeButton.addEventListener('click', function() {
		close();
	})

	var p = document.createElement('p');

  	p.appendChild(document.createTextNode(caption));
  	div.appendChild(closeButton);
  	div.appendChild(img);
  	div.appendChild(document.createElement('br'));
  	div.appendChild(p);

  	return [div, thumb]; 
}

function adjustThumbIds() {
	for (var i=1; i<20; i++) {
		thumbs.children[i].id = 'thumb' + (i+1);
	}
}

function adjustImgIds() {
	for (var i=1; i<20; i++) {
		images.children[i].id = 'img' + (i+1);
	}
}

function processJSON (json) {
    for (var i=0; i < json.data.length; i++) {
    	var divThumb = createElements(json.data[i].images.standard_resolution.url,
    				   					json.data[i].images.thumbnail.url,
    				   					json.data[i].caption.text,
    				   					i);

    	var div = divThumb[0];
    	var thumb = divThumb[1];

	  	thumb.addEventListener('click', function() {
	  		var index = this.id.substring(5);
	  		currentImage = parseInt(index);
	  		var id = 'img' + index;
	  		showImg(id);
	  	});

	  	if (!init) {
	  		thumbs.insertBefore(thumb, thumbs.firstChild);
	  		thumbs.removeChild(thumbs.lastChild);
	  		images.insertBefore(div, images.firstChild);
	  		images.removeChild(images.lastChild);
	  		adjustThumbIds();
	  		adjustImgIds();
	  		break; // Only need to load in the most recent photo
	  	} else {
	  		thumbs.appendChild(thumb);
	  		images.appendChild(div);	
	  	}
    }
    init = false;
};

function hideImg(id) {
	document.getElementById(id).style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
	document.getElementById(id).firstChild.style.display = 'none';
};

function showImg(id) {
	document.getElementById(id).style.display = 'block';
	document.getElementById('overlay').style.display = 'block';
	document.getElementById(id).firstChild.style.display = 'block';
};

function close() {
	var index = currentImage;
	var id = 'img' + index;
	currentImage = null;
	hideImg(id);
}

window.onload = function() {
	thumbs = document.getElementById('thumbs');
	images = document.getElementById('images');

	// Socket handling
	var socket = io.connect();

	socket.on('update', function(data) {
		fetchData();
	})

	// JSONP long polling
	var tag = 'berkeley';
	var clientId = '1ac7b79de31245f48db7fbb5726eb85e';

	function fetchData() {
		var script_element = document.createElement('script');
		script_element.src = "https://api.instagram.com/v1/tags/" + tag + "/media/recent?client_id=" + clientId + "&callback=processJSON";
		var head = document.getElementsByTagName('head')[0];
		if (!init) { head.removeChild(head.lastChild) };
		head.appendChild(script_element);
	}

	// Initial fetch
	fetchData();

	// Event listeners
	document.getElementById('overlay').addEventListener('click', function() {
		close();
	})
}

// Keypress listeners
window.onkeyup = function(e) {
	if (!currentImage) { return; }
	var index = currentImage;
	var id = 'img' + index;
	switch(e.which) {
		case 27: // ESC
			currentImage = null;
			hideImg(id);
		break;
		case 37: // left
			if (index > 1) {
				currentImage -= 1;
				hideImg(id);
				var prevIndex = index - 1;
				showImg('img' + prevIndex);
			}
		break;
		case 39: // right
			if (index < 20) {
				currentImage += 1;
				hideImg(id);
				var nextIndex = index + 1;
				showImg('img' + nextIndex);
			}
		break;
	}
}