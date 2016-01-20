"use strict";
var publicAPIKey = 'AIzaSyDJZ9zP-lyOtZGMJuvSqJSqhhkSGVIZJao',
    $searchField = $('#searchBox'),
    $addField = $('#addBox'),
    queue = [],
    player,
	playButton = document.getElementById("playButton"),
	pauseButton = document.getElementById("pauseButton"),
	currentlyPlaying = document.getElementById("currentlyPlaying"),
	thumbnail = document.getElementById("thumbnail"),
	lastPlayerState;
	
function onYouTubeIframeAPIReady() {
    var initialVideoId = "cHHLHGNpCSA";
    player = new YT.Player('player', {
        height: '205',
        width: '300',
        videoId: initialVideoId,
        playerVars: {
            autoplay: 1,
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
	playButton.style.display = "none";
    pauseButton.style.display = "inline-block";
	lastPlayerState = 1;
	thumbnail.src = "http://img.youtube.com/vi/" + event.target.B.videoData["video_id"] + "/0.jpg";
	currentlyPlaying.innerHTML = '<a href="' + event.target.getVideoUrl() + '">' + event.target.B.videoData.title + '</a>';
	//event.target.setPlayBackQuality(player.getAvailableQualityLevels()[0]); //Uncomment if not showing video frame
}
function onPlayerStateChange(event) {
    if (event.data === 0 && queue.length > 0) {
        playNextVideoInQueue();
		lastPlayerState = 1;
    }
	
	if (player.getPlayerState() != lastPlayerState)
	{
		if (player.getPlayerState() === 1)
	    {
            playButton.style.display = "none";
            pauseButton.style.display = "inline-block";
	    }
		else
		{
			pauseButton.style.display = "none";
            playButton.style.display = "inline-block";
		}
		lastPlayerState = player.getPlayerState();
	}
}
function playNextVideoInQueue() {
    var nextVidID = queue[0].id;
    player.loadVideoById(nextVidID);
	//player.setPlayBackQuality(player.getAvailableQualityLevels()[0]); //Uncomment if not showing video frame
	thumbnail.src = "http://img.youtube.com/vi/" + queue[0].id + "/0.jpg";
	currentlyPlaying.innerHTML = '<a href="' + player.getVideoUrl() + '">' + queue[0].title + '</a>';
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
function play()
{
	if (player.getPlayerState() === -1, 2)
	{
        player.playVideo();
        playButton.style.display = "none";
        pauseButton.style.display = "inline-block";
	}
}
function pause()
{
	if (player.getPlayerState() === 1)
	{
        player.pauseVideo();
        pauseButton.style.display = "none";
        playButton.style.display = "inline-block";
	}
}
function foward()
{
	if (queue.length > 0) {
        playNextVideoInQueue();
    }
}