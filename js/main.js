"use strict";
var publicAPIKey = 'AIzaSyDJZ9zP-lyOtZGMJuvSqJSqhhkSGVIZJao',
    $searchField = $('#searchBox'),
    $addField = $('#addBox'),
    queue = [],
    player;
function onYouTubeIframeAPIReady() {
    var initialVideoId = "iS1g8G_njx8";
    player = new YT.Player('player', {
        height: '205',
        width: '300',
        videoId: initialVideoId,
        playerVars: {
            autoplay: 0,
            controls: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            showinfo: 1,
            rel: 1,
            loop: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}
function onPlayerReady(event) {
    event.target.playVideo();
}
function onPlayerStateChange(event) {
    if (event.data === 0 && queue.length > 0) {
        playNextVideoInQueue();
    }
}
function playNextVideoInQueue() {
    var nextVidID = queue[0].id;
    player.loadVideoById(nextVidID);
    queue.shift();
    $('#queue li:first-child').remove();
} 
function Song(id, title, thumbnail) {
    this.id = id;
    this.title = title;
    this.thumbnail = thumbnail;
}
function addCurrentlyPlayingVid(e) {
    var playerVidId = player.B.videoData["video_id"];
    var playerVidTitle = player.B.videoData.title;
    var playerVidThumbnail = '<img src = http://img.youtube.com/vi/'+playerVidId+'/0.jpg>';
    if (e.which === 17 && playerVidId !== "" && playerVidTitle !== "") {
        queue.push(new Song(playerVidId,playerVidTitle,playerVidThumbnail));
        $('#queue').append('<li class="group">'+playerVidThumbnail+'<h3>'+playerVidTitle+'</h3><button>Delete</button></li>');
    }
}
function removeFromQueue() {
    var liToBeDeleted = $(this).closest('li');
    var listPosition = $('li').index(liToBeDeleted);
    queue.remove(listPosition);
    liToBeDeleted.remove();
}
function playVideo(videoId) {
    player.loadVideoById(videoId);
}
function makeRequest(keyword, type) {
    var request = gapi.client.youtube.search.list({
        q: keyword,
        type: 'video',
        part: 'snippet',
        maxResults: 3,
        order: 'viewCount'
    });
    request.execute(function(response) {
        var vidId = response.items[0].id.videoId;
        var vidTitle = response.items[0].snippet.title;
        var vidThumbnail = '<img src = http://img.youtube.com/vi/'+vidId+'/0.jpg>';
        if (type === 'searchBox') {
            playVideo(vidId);
        } else if (type === 'addBox') {
            queue.push(new Song(vidId,vidTitle,vidThumbnail));
            $('#queue').append('<li class="group">'+vidThumbnail+'<h3>'+vidTitle+'</h3><button>Delete</button></li>');
        }
    });
}
function search(e) {
    var key = e.which;
    if (key === 13) {
        makeRequest($(this).val(), this.id);
    }
}
function dataAPIReady() {
    $searchField.keypress(search);
    $addField.keypress(search);
}
function loadYouTubeIframeAPI () {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};
loadYouTubeIframeAPI();
function init() {
    gapi.client.setApiKey(publicAPIKey);
    gapi.client.load('youtube', 'v3').then(dataAPIReady);
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
$(document).ready(function() {
    $(document).keydown(addCurrentlyPlayingVid);
    $('#queue').on('click', 'button', removeFromQueue);
});

