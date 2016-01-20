"use strict";
var publicAPIKey = 'AIzaSyBeTQ6HWplls742QA_bvODF-vPOFf4nm2U',
    $searchField = $('#searchBox'),
    $addField = $('#addBox'),
    queue = [],
    player,
	playButton = document.getElementById("playButton"),
	pauseButton = document.getElementById("pauseButton"),
	currentlyPlaying = document.getElementById("currentlyPlaying"),
	thumbnail = document.getElementById("thumbnail"),
	timePassed = document.getElementById("timePassed"),
	timeLeft = document.getElementById("timeLeft"),
	mediaProgressBar = document.getElementById("mediaProgressBar"),
	lastPlayerState,
	timeChanger;
	
function onYouTubeIframeAPIReady() {
    var initialVideoId = "-ncIVUXZla8";
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
function f()
{
	var currTime = Math.round(player.getCurrentTime());
	var dur = Math.round(player.getDuration());
	setTime(currTime, dur);
}
function onPlayerReady(event) {
    event.target.playVideo();
	playButton.style.display = "none";
    pauseButton.style.display = "inline-block";
	lastPlayerState = 1;
	thumbnail.src = "http://img.youtube.com/vi/" + event.target.B.videoData["video_id"] + "/0.jpg";
	currentlyPlaying.innerHTML = '<a href="' + event.target.getVideoUrl() + '">' + event.target.B.videoData.title + '</a>';
	//event.target.setPlayBackQuality(player.getAvailableQualityLevels()[0]); //Uncomment if not showing video frame
	timeChanger = setInterval(f, 1);
}
function onPlayerStateChange(event) {
    if (event.data === 0 && queue.length > 0) {
        playNextVideoInQueue();
		lastPlayerState = 1;
    }
	
	f();
	
	if (player.getPlayerState() != lastPlayerState)
	{
		if (player.getPlayerState() === 1)
	    {
            playButton.style.display = "none";
            pauseButton.style.display = "inline-block";
			timeChanger = setInterval(f, 500);
	    }
		else
		{
			pauseButton.style.display = "none";
            playButton.style.display = "inline-block";
			clearInterval(timeChanger);
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
        $('#queue').append('<li class="group">'+playerVidThumbnail+'<h3>'+playerVidTitle+
		'</h3><button id="deleteButton">Delete</button><button id="queueNextButton">Queue Next</button></li>');
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
            $('#queue').append('<li class="group">'+vidThumbnail+'<h3>'+vidTitle+
			'</h3><button id="deleteButton">Delete</button><button id="queueNextButton">Queue Next</button></li>');
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
    $('#queue').on('click', '#deleteButton', removeFromQueue);
	$('#queue').on('click', '#queueNextButton', queueNext);
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
function forward()
{
	if (queue.length > 0) {
        playNextVideoInQueue();
    }
}
function backward()
{
	player.seekTo(0, true);
}
function queueNext()
{
	var liToBeQueuedNext = $(this).closest('li');
    var listPosition = $('li').index(liToBeQueuedNext);
    var temp = queue[listPosition];
	queue[listPosition] = queue[0];
	queue[0] = temp;
    liToBeQueuedNext.parent().prepend(liToBeQueuedNext);
}
function setTime(secPassedOg, secTotalOg)
{
	var minPassed = Math.floor(secPassedOg / 60);
	var secPassed = secPassedOg - (minPassed * 60);
	var prettyPassed = str_pad_left(minPassed,'0',2)+':'+str_pad_left(secPassed,'0',2);
	if (timePassed.innerHTML != prettyPassed)
	    timePassed.innerHTML = prettyPassed;
	
	var minTotal = Math.floor(secTotalOg / 60);
	var secTotal = secTotalOg - (minTotal * 60);
	var prettyTotal = str_pad_left(minTotal,'0',2)+':'+str_pad_left(secTotal,'0',2);
	if (timePassed.innerHTML != prettyTotal)
	    timeLeft.innerHTML = prettyTotal;
	
	var percent = Math.round(100*(secPassedOg/secTotalOg));
	mediaProgressBar.style.width = percent + "%";
}
function str_pad_left(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}