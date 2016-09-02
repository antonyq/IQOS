var swiping = false;
var cycling = false;
var cycles = [
    {   start: 5, end: 6, created: false   },
    {   start: 15, end: 16, created: false }
];
var texts = [
    {   start: 0, end: 3    },
    {   start: 5, end: 7    },
    {   start: 11, end: 14  },
    {   start: 15, end: 18  },
    {   start: 20, end: 22  },
    {   start: 24, end: 30  },
    {   start: 31, end: 33  },
    {   start: 37, end: 40  },
    {   start: 46, end: 50  }
];
var touchAreas = [
    {   start: 5, end: 7   },
    {   start: 7, end: 18  }
];
var currentScreen = 0;
var momentsMenu = [0, 11, 35, 42];
var animationDuration = 500; //ms

var video;

window.onload = function () {
    video = document.getElementsByTagName("video")[0];

    loadText("localization/copytext_en");

    $(video).swipe({
        swipe: function (event, direction, distance, duration, fingerCount) {
            if (!cycling){
                swiping = true;
                swipeHandler(video, direction);
            }
        }
    });
    video.addEventListener("timeupdate", mainFlowListener);
    video.addEventListener("timeupdate", touchAreaListener);
    video.addEventListener("timeupdate", menuListener);
    video.addEventListener("timeupdate", textListener);
}

function mainFlowListener () {
    for (var i = 0; i < momentsMenu.length; i++){
        if (video.currentTime > momentsMenu[i]) currentScreen = i;
    }
    cycles.forEach(function (cycle) {
        if (!swiping && !cycle.created && video.currentTime < cycle.start) {
            video.addEventListener("timeupdate", getCycleListener(cycle));
            cycle.created = true;
        }
    });
}

function swipeHandler (video, direction) {
    if (direction == 'left' && currentScreen != momentsMenu.length - 3) setCurrentScreen(video, ++currentScreen);
    else if (direction == 'right' && currentScreen != 0) setCurrentScreen(video, ++currentScreen);
    swiping = false;
}

function getCycleListener (cycle) {
    var touchAreaListeners = 0;
    var cycleListener = function () {
        if (!swiping){
            if (video.currentTime > cycle.start && video.currentTime < cycle.end && touchAreaListeners++ == 0) {
                if (!cycling) cycling = true;
                document.getElementsByClassName("touch-area")[0].addEventListener("mousedown", function () {
                    video.removeEventListener("timeupdate", cycleListener, false);
                    cycling = false;
                    cycle.created = false;
                });
            }
            if (video.currentTime > cycle.end) setCurrentMoment(video, cycle.start);
        }
    }
    return cycleListener;
}

function textListener() {
    var text = $(".text");
    for (var i = 0; i < texts.length; i++){
        if (video.currentTime > texts[i].end && video.currentTime < texts[i+1].start) text.fadeOut(animationDuration);
        else if (video.currentTime > texts[i].start && video.currentTime < texts[i+1].start) {
            text.html(window.localization["TEXT" + i]);
            text.fadeIn(animationDuration);
        }
    }
}

function menuListener() {
    document.getElementsByClassName("active")[0].classList.remove("active");
    if (video.currentTime < momentsMenu[1]) document.getElementById("li0").classList.add("active");
    else if (video.currentTime >= momentsMenu[1] && video.currentTime < momentsMenu[2]) document.getElementById("li1").classList.add("active");
    else if (video.currentTime >= momentsMenu[2] && video.currentTime < momentsMenu[3]) document.getElementById("li2").classList.add("active");
    else if (video.currentTime >= momentsMenu[3]) document.getElementById("li3").classList.add("active");
}

function touchAreaListener() {
    var touchArea = document.getElementsByClassName("touch-area")[0];
    if (video.currentTime > touchAreas[0].start && video.currentTime < touchAreas[0].end) touchArea.setAttribute("id", "touch-area1");
    if (video.currentTime > touchAreas[0].end && video.currentTime < touchAreas[1].start) touchArea.setAttribute("id", "");
    else if (video.currentTime > touchAreas[1].start && video.currentTime < touchAreas[1].end) touchArea.setAttribute("id", "touch-area2");
    else if (video.currentTime > touchAreas[1].end) touchArea.setAttribute("id", "");
}

function setCurrentScreen(video, currentScreen) {
    setCurrentMoment(video, momentsMenu[currentScreen]);
}

function setCurrentMoment(video, currentMoment) {
    video.currentTime = currentMoment;
    video.play();
}

function loadText(path) {
    if (window.location.href.match(/file:/)) {
        var script = document.createElement("script");
        script.src = path + ".js";
        document.head.appendChild(script);
    } else loadJSON(path + ".json");
}

function loadJSON(path) {
    var request = new XMLHttpRequest();
    request.open("POST", path, true);
    request.send();
    request.onreadystatechange = function () {
        if(request.readyState == 4) {
            if(request.status != 200) document.body.innerHTML = "Could not retrieve data";
            else window.localization = JSON.parse(request.responseText);
        }
    }
}
