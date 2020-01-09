(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

mejs.i18n.en['mejs.playlist'] = 'Toogle Timeshifts';
mejs.i18n.en['mejs.speed-rate'] = 'Speed Rate';

// Changing source per HLS //
function changeSource(url){
    hls.detachMedia(video);
    hls.loadSource(url);
    hls.attachMedia(video);
    video.load();
    video.play();
}
// Adding sources to video element //
function addSourceToVideo(element, id, src, type, title) {
    var source = document.createElement('source');
    source.id = id;
    source.src = src;
    source.type = type;
    source.title = title;

    element.appendChild(source);
}
// Adding timeshifts of today hours //
document.addEventListener("timeupdate", addPlaylist);
function addPlaylist(){
    var h = new Date();
    var lengthOfSources = h.getHours()+1;
    for (var i=0; i<lengthOfSources; i++){
        var src = "http://e21.plius.tv:64144/p127/mono-timeshift_rel-"+i*3600 + ".m3u8?token=8cc77969e2a7d99372080a15889387b433c5708a"; 
        var title = lengthOfSources-i;
        var timeshiftTitle = title-1+"-"+title+"h";
        if(i!=0){
            addSourceToVideo(video, i, src,'application/x-mpegURL',timeshiftTitle);
        }
    }
}
// Real time at the moment // 
document.addEventListener("timeupdate", timeNow);
function timeNow() {
    var today = new Date();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var sval = Math.floor(m*60+s);
    return parseInt(sval);
}
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};
Object.assign(mejs.MepDefaults, {
    playlist: [],

    showPlaylist: true,

    autoClosePlaylist: true,

    prevText: null,

    nextText: null,

    loopText: null,

    shuffleText: null,

    playlistTitle: null,

    currentMessage: null,

    speeds: ['4', '2', '1'],

    defaultSpeed: '1',

    speedChar: 'x',

    speedText: null
});
addPlaylist();
var live = "http://e21.plius.tv:64144/p127/mono.m3u8"; 
var slider = document.getElementById("myRange");
var pressedValue = 0;
var lengthOfTimeshift = 0;
var inputs = 0;
var valueHover = 0;
var newSpeed = 0;
var safeDistance = 0;
var speeds = [];
// Building HTML input type Range // 
Object.assign(MediaElementPlayer.prototype, {
    buildrange: function buildrange(player, controls, layers, media) {
        var t = this,
            input = document.createElement('div');

        input.className = 'slidercontainer';
        input.innerHTML = '<input type="range" min="0" max="3600" value="0" class="slider" step="1" id="myRange">'
        +'<div id="slidertitle"></div>';

        t.addControlElement(input, 'range');
        var slider = document.getElementById("myRange");
        var video = document.getElementById("video");
        var sources = video.getElementsByTagName("source");
        var live = "http://e21.plius.tv:64144/p127/mono.m3u8";
        slider.addEventListener("input", whenPress); 
        video.addEventListener("timeupdate", realTime); 
        video.addEventListener("play", firstPlay);
        function firstPlay() {
            if(player.currentPlaylistItem==0){
                pressedValue = timeNow();
            }
            video.removeEventListener("play",firstPlay);
        }
        function calcSliderPos(e) {
            return e.offsetX / e.target.clientWidth * parseInt(e.target.getAttribute('max'),10);
        }
        //attach to slider and fire on mousemove
        document.getElementById('myRange').addEventListener('mousemove', function(e) {
            var slidertitle = document.getElementById("slidertitle");
            valueHover = Math.floor(calcSliderPos(e).toFixed(2));
            var today = new Date();
            var h = today.getHours()-player.currentPlaylistItem;
            var m = parseInt(valueHover/60,10);
            var s = parseInt(valueHover%60);
            slidertitle.style.top = -5+'px';
            slidertitle.style.left = e.offsetX + 55 + 'px';
            if(valueHover<0 || valueHover>3600){
                slidertitle.innerHTML = "";
            }else if(player.currentPlaylistItem==0){
                if(valueHover>timeNow()){
                    slidertitle.innerHTML = "LIVE";
                }
                else{
                    slidertitle.innerHTML = h+":"+checkTime(m)+":"+checkTime(s)
                }
            }else{
            slidertitle.innerHTML = h+":"+checkTime(m)+":"+checkTime(s);
            }
        });
        document.getElementById('myRange').addEventListener('mouseout', function(e) {
                var slidertitle = document.getElementById("slidertitle");
                slidertitle.innerHTML = "";
        });
        function resetSpeed(){
            // Speed style reseting //
            /*var selected = player.speedButton.querySelectorAll('.' + t.options.classPrefix + 'speed-selected');
            for (var _i5 = 0, _total5 = selected.length; _i5 < _total5; _i5++) {
                mejs.Utils.removeClass(selected[_i5], t.options.classPrefix + 'speed-selected');
            }
            var selector = player.speedButton.querySelectorAll('.' + t.options.classPrefix + 'speed-selector-label');
            selector[2].classList.add(t.options.classPrefix + 'speed-selected');
            player.speedButton.querySelector('button').innerHTML = speeds[2].name;*/
            media.playbackRate = 1;
        }
        function realTime(){
            safeDistance = parseInt(slider['value'])+parseInt(30);
            // Real time slider //
            var x = Math.floor(video.currentTime);
            slider['value'] = pressedValue+x;
            document.getElementById("myRange").setAttribute('value', slider['value']);
            // Playback speed //
            var speed = document.getElementById("speedBtn");
            if(player.currentPlaylistItem==0){
                if(parseInt(safeDistance)>timeNow()){  
                    resetSpeed();
                }
            //console.log('slider value: ',slider['value'])
            }
        }
        // Slider functionallity //
        function whenPress(){
            pressedValue = valueHover;
            slider['value'] = pressedValue;
            lengthOfTimeshift=timeNow()-pressedValue; 
            // Live hour        
            if(player.currentPlaylistItem==0){
                if(lengthOfTimeshift<=0){
                        pressedValue = timeNow();
                        slider['value'] = timeNow();
                        changeSource(live);        
                }else{ 
                    var timeshift = "http://e21.plius.tv:64144/p127/mono-timeshift_rel-" + lengthOfTimeshift + ".m3u8?token=8cc77969e2a7d99372080a15889387b433c5708a";
                    if(lengthOfTimeshift < 10){
                        slider['value'] = timeNow();
                        changeSource(live);
                        } else{
                        pressedValue = valueHover;
                        changeSource(timeshift);
                        }
                }
            }
            // Timeshifts
            else{
                //var x = parseInt(Math.floor(video.currentTime));
                var slice = sources[player.currentPlaylistItem].src;
                //var url = slice.slice(0, slice.lastIndexOf("=")+1);
                var url = "http://e21.plius.tv:64144/p127/mono-timeshift_rel-";
                var currentTimeshift = parseInt(slice.substr(slice.lastIndexOf('=') + 1));
                var newTimeshift = currentTimeshift + timeNow() - pressedValue;
                var lengthOfTimeshift = url + newTimeshift + ".m3u8?token=8cc77969e2a7d99372080a15889387b433c5708a"; 
                changeSource(lengthOfTimeshift);
            }
        }
    },
    // End Time.
    buildtime: function buildtime(player, controls, layers, media) {
        var t = this,
            time = document.createElement('div');
            time.className = 'time';
            time.innerHTML = '<span id="time"></span>';

            t.addControlElement(time, 'time');
            var video = document.getElementById("video");
            video.addEventListener("timeupdate", sliderUpdate);
            function sliderUpdate() {
                var today = new Date();
                var h=0;
                if(today.getHours()-player.currentPlaylistItem+1 == 24){
                    h==0;
                }else{
                    h=today.getHours()-player.currentPlaylistItem+1;
                }
                var m = 0;
                var s = 0;
                m = checkTime(m);
                s = checkTime(s);
                document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
            }
    },
    // Current Time //
    buildcurrtime: function buildcurrtime(player, controls, layers, media){
        var t = this,
            currtime = document.createElement('div');
            currtime.className = 'curr';
            currtime.innerHTML = '<span id="currtime"></span>';
            t.addControlElement(currtime, 'currtime');
            var video = document.getElementById("video");
            var sources = video.getElementsByTagName("source");
            var slider = document.getElementById("myRange");
            document.getElementById('currtime').innerHTML = 0;
            video.addEventListener("timeupdate", sliderUpdate);
            player.prevPlaylistCallback = function () {
                var count = parseInt(player.currentPlaylistItem)-1;
                var slice = sources[count].src;
                var url = slice.slice(0, slice.lastIndexOf("=")+1);
                var currentTimeshift = parseInt(slice.substr(slice.lastIndexOf('=') + 1));
                var newTimeshift = currentTimeshift + timeNow();
                var src = "";
                if(count!=0){
                    src = url + newTimeshift; 
                }else {
                    src = live;
                }
                if (player.playlist[player.currentPlaylistItem--]){
                    //Changing style of selected item.
                    var ex = inputs[player.currentPlaylistItem+1];
                    var cur = inputs[player.currentPlaylistItem];
                    changeSource(src); 
                    cur.closest('.' + player.options.classPrefix + 'playlist-selector-list-item').querySelector('label').innerHTML = '<span>\u25B6</span> ' + cur.closest('.' + player.options.classPrefix + 'playlist-selector-list-item').querySelector('label').innerHTML;
                    mejs.Utils.addClass(cur.closest('.' + player.options.classPrefix + 'playlist-selector-list-item'), player.options.classPrefix + 'playlist-selected');
                    var str = ex.closest('.' + player.options.classPrefix + 'playlist-selector-list-item').querySelector('label').innerHTML;
                    str = str.replace("<span>\u25B6</span>","");
                    ex.closest('.' + player.options.classPrefix + 'playlist-selector-list-item').querySelector('label').innerHTML = str;
                    mejs.Utils.removeClass(ex.closest('.' + player.options.classPrefix + 'playlist-selector-list-item'), player.options.classPrefix + 'playlist-selected');      
                } else {
                    ++player.currentPlaylistItem;
                }
            }
            function sliderUpdate() {
                var val = document.getElementById("myRange").value;
                var today = new Date();
                var h = today.getHours()-player.currentPlaylistItem;
                var m = today.getMinutes();
                var s = today.getSeconds();
                if(player.currentPlaylistItem!=0){
                    m = parseInt(val/60,10);
                    s = val%60;
                    if(m==60&&s==0){
                        m=0;
                        s=0;
                        if(parseInt(player.currentPlaylistItem)-1!=0){
                            pressedValue = 0;
                        }else{
                            pressedValue = timeNow();
                        }
                        player.prevPlaylistCallback();
                    }
                }
                else{
                    if(lengthOfTimeshift<=0){
                        m = parseInt(val/60,10);
                        s = val%60;
                    }
                }
                m = checkTime(m);
                s = checkTime(s);
                document.getElementById('currtime').innerHTML = h + ":" + m + ":" + s;
            }
    },
    buildplaylist: function buildplaylist(player, controls, layers, media) {
        
        var defaultPlaylistTitle = mejs.i18n.t('mejs.playlist'),
            playlistTitle = mejs.Utils.isString(player.options.playlistTitle) ? player.options.playlistTitle : defaultPlaylistTitle;

        if (player.createPlayList_()) {
            return;
        }

        player.currentPlaylistItem = 0;
        player.originalControlsIndex = controls.style.zIndex;
        controls.style.zIndex = 5;

        player.endedCallback = function () {
            if (player.currentPlaylistItem < player.listItems.length) {
                player.setSrc(player.playlist[++player.currentPlaylistItem]);
                player.load();
                setTimeout(function () {
                    player.play();
                }, 200);
            }
        };

        media.addEventListener('ended', player.endedCallback);

        if (player.options.showPlaylist) {
            player.playlistLayer = document.createElement('div');
            player.playlistLayer.className = player.options.classPrefix + 'playlist-layer  ' + player.options.classPrefix + 'layer ' + (player.isVideo ? player.options.classPrefix + 'playlist-hidden' : '') + ' ' + player.options.classPrefix + 'playlist-selector';
            player.playlistLayer.innerHTML = '<ul class="' + player.options.classPrefix + 'playlist-selector-list"></ul>';
            layers.insertBefore(player.playlistLayer, layers.firstChild);

            for (var i = 0, total = player.listItems.length; i < total; i++) {
                player.playlistLayer.querySelector('ul').innerHTML += player.listItems[i];
            }

            if (player.isVideo) {
                player.playlistButton = document.createElement('div');
                player.playlistButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'playlist-button';
                player.playlistButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + playlistTitle + '" aria-label="' + playlistTitle + '" tabindex="0"></button>';
                player.playlistButton.addEventListener('click', function () {
                    mejs.Utils.toggleClass(player.playlistLayer, player.options.classPrefix + 'playlist-hidden');
                });
                player.addControlElement(player.playlistButton, 'playlist');
            } else {
                var _items = player.playlistLayer.querySelectorAll('li');

                if (_items.length <= 10) {
                    var height = 0;
                    for (var _i = 0, _total = _items.length; _i < _total; _i++) {
                        height += _items[_i].offsetHeight;
                    }
                    player.container.style.height = height + 'px';
                }
            }

            var items = player.playlistLayer.querySelectorAll('.' + player.options.classPrefix + 'playlist-selector-list-item');
                inputs = player.playlistLayer.querySelectorAll('input[type=radio]');

            for (var _i2 = 0, _total2 = inputs.length; _i2 < _total2; _i2++) {
                inputs[_i2].disabled = false;
                inputs[_i2].addEventListener('click', function () {
                    pressedValue = 0;
                    var radios = player.playlistLayer.querySelectorAll('input[type="radio"]'),
                    selected = player.playlistLayer.querySelectorAll('.' + player.options.classPrefix + 'playlist-selected');

                    for (var j = 0, total2 = radios.length; j < total2; j++) {
                        radios[j].checked = false;
                    }
                    for (var _j = 0, _total3 = selected.length; _j < _total3; _j++) {
                        mejs.Utils.removeClass(selected[_j], player.options.classPrefix + 'playlist-selected');
                        selected[_j].querySelector('label').querySelector('span').remove();
                    }
                    // On click change source values from playlist. Timeshift(s)=3600*H(hours of timeshift)+TimeNow(s of this hour).
                    this.checked = true;
                    this.closest('.' + player.options.classPrefix + 'playlist-selector-list-item').querySelector('label').innerHTML = '<span>\u25B6</span> ' + this.closest('.' + player.options.classPrefix + 'playlist-selector-list-item').querySelector('label').innerHTML;
                    mejs.Utils.addClass(this.closest('.' + player.options.classPrefix + 'playlist-selector-list-item'), player.options.classPrefix + 'playlist-selected');
                    player.currentPlaylistItem = this.getAttribute('data-playlist-index');
                    var slice = this.value;
                    var url = slice.slice(0, slice.lastIndexOf("=")+1);
                    var currentTimeshift = parseInt(slice.substr(slice.lastIndexOf('=') + 1));
                    var newTimeshift = currentTimeshift + timeNow();
                    var src = url + newTimeshift;       
                    if(this.value == live){
                        changeSource(live);
                        pressedValue = timeNow();
                    }
                    else{
                        pressedValue = 0;
                        changeSource(src); 
                    }

                    if (player.isVideo && player.options.autoClosePlaylist === true) {
                        mejs.Utils.toggleClass(player.playlistLayer, player.options.classPrefix + 'playlist-hidden');
                    }
                });
            }

            for (var _i3 = 0, _total4 = items.length; _i3 < _total4; _i3++) {
                items[_i3].addEventListener('click', function () {
                    var radio = mejs.Utils.siblings(this.querySelector('.' + player.options.classPrefix + 'playlist-selector-label'), function (el) {
                        return el.tagName === 'INPUT';
                    })[0],
                        event = mejs.Utils.createEvent('click', radio);
                    radio.dispatchEvent(event);
                });
            }

            player.keydownCallback = function (e) {
                var event = mejs.Utils.createEvent('click', e.target);
                e.target.dispatchEvent(event);
                return false;
            };

            player.playlistLayer.addEventListener('keydown', function (e) {
                var keyCode = e.which || e.keyCode || 0;
                if (~[13, 32, 38, 40].indexOf(keyCode)) {
                    player.keydownCallback(e);
                }
            });
        } else {
            mejs.Utils.addClass(player.container, player.options.classPrefix + 'no-playlist');
        }
    },
    cleanplaylist: function cleanplaylist(player, controls, layers, media) {
        media.removeEventListener('ended', player.endedCallback);
    },
    buildprevtrack: function buildprevtrack(player) {

        var defaultPrevTitle = mejs.i18n.t('mejs.playlist-prev'),
            prevTitle = mejs.Utils.isString(player.options.prevText) ? player.options.prevText : defaultPrevTitle;
        player.prevButton = document.createElement('div');
        player.prevButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'prev-button';
        player.prevButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + prevTitle + '" aria-label="' + prevTitle + '" tabindex="0"></button>';

        player.prevPlaylistCallback = function () {
            if (player.playlist[--player.currentPlaylistItem]) {
                player.setSrc(player.playlist[player.currentPlaylistItem].src); 
                player.load();
                player.play();
            } else {
                ++player.currentPlaylistItem;
            }

        };
        player.prevButton.addEventListener('click', player.prevPlaylistCallback);
        player.addControlElement(player.prevButton, 'prevtrack');
    },
    cleanprevtrack: function cleanprevtrack(player) {
        player.prevButton.removeEventListener('click', player.prevPlaylistCallback);
    },
    buildnexttrack: function buildnexttrack(player) {
        var defaultNextTitle = mejs.i18n.t('mejs.playlist-next'),
            nextTitle = mejs.Utils.isString(player.options.nextText) ? player.options.nextText : defaultNextTitle;
        player.nextButton = document.createElement('div');
        player.nextButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'next-button';
        player.nextButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + nextTitle + '" aria-label="' + nextTitle + '" tabindex="0"></button>';

        player.nextPlaylistCallback = function () {
            if (player.playlist[++player.currentPlaylistItem]) {
                player.setSrc(player.playlist[player.currentPlaylistItem].src);
                player.load();
                player.play();
            } else {
                --player.currentPlaylistItem;
            }
        };

        player.nextButton.addEventListener('click', player.nextPlaylistCallback);
        player.addControlElement(player.nextButton, 'nexttrack');
    },
    cleannexttrack: function cleannexttrack(player) {
        player.nextButton.removeEventListener('click', player.nextPlaylistCallback);
    },
    createPlayList_: function createPlayList_() {
        var t = this;

        t.playlist = t.options.playlist.length ? t.options.playlist : [];

        if (!t.playlist.length) {
            var children = t.mediaFiles || t.media.originalNode.children;

            for (var i = 0, total = children.length; i < total; i++) {
                var childNode = children[i];

                if (childNode.tagName.toLowerCase() === 'source') {
                    (function () {
                        var elements = {};
                        Array.prototype.slice.call(childNode.attributes).forEach(function (item) {
                            elements[item.name] = item.value;
                        });

                        if (elements.src && elements.type && elements.title) {
                            elements.type = mejs.Utils.formatType(elements.src, elements.type);
                            t.playlist.push(elements);
                        }
                    })();
                }
            }
        }

        if (t.playlist.length < 2) {
            return;
        }

        t.listItems = [];
        for (var _i4 = 0, _total5 = t.playlist.length; _i4 < _total5; _i4++) {
            var element = t.playlist[_i4],
                item = document.createElement('li'),
                id = t.id + '_playlist_item_' + _i4,
                thumbnail = element['data-playlist-thumbnail'] ? '<div class="' + t.options.classPrefix + 'playlist-item-thumbnail"><img tabindex="-1" src="' + element['data-playlist-thumbnail'] + '"></div>' : '',
                description = element['data-playlist-description'] ? '<div class="' + t.options.classPrefix + 'playlist-item-description">' + element['data-playlist-description'] + '</div>' : '';
            item.tabIndex = 0;
            item.className = t.options.classPrefix + 'playlist-selector-list-item' + (_i4 === 0 ? ' ' + t.options.classPrefix + 'playlist-selected' : '');
            item.innerHTML = '<div class="' + t.options.classPrefix + 'playlist-item-inner">' + ('' + thumbnail) + ('<div class="' + t.options.classPrefix + 'playlist-item-content">') + ('<div><input type="radio" class="' + t.options.classPrefix + 'playlist-selector-input" ') + ('name="' + t.id + '_playlist" id="' + id + '" data-playlist-index="' + _i4 + '" value="' + element.src + '" disabled>') + ('<label class="' + t.options.classPrefix + 'playlist-selector-label" ') + ('for="' + id + '">' + (_i4 === 0 ? '<span>\u25B6</span> ' : '') + (element.title || _i4) + '</label></div>' + description + '</div></div>');

            t.listItems.push(item.outerHTML);
        }
    },
    buildspeed: function buildspeed(player, controls, layers, media) {
        var t = this,
            isNative = t.media.rendererName !== null && /(native|html5)/i.test(t.media.rendererName);

        if (!isNative) {
            return;
        }

        speeds = [];
            var speedTitle = mejs.Utils.isString(t.options.speedText) ? t.options.speedText : mejs.i18n.t('mejs.speed-rate'),
            getSpeedNameFromValue = function getSpeedNameFromValue(value) {
            for (var i = 0, total = speeds.length; i < total; i++) {
                if (speeds[i].value === value) {
                    return speeds[i].name;
                }
            }
        };

        var playbackSpeed = void 0,
         defaultInArray = false;

        for (var i = 0, total = t.options.speeds.length; i < total; i++) {
            var s = t.options.speeds[i];

            if (typeof s === 'string') {
                speeds.push({
                    name: '' + s + t.options.speedChar,
                    value: s
                });

                if (s === t.options.defaultSpeed) {
                    defaultInArray = true;
                }
            } else {
                speeds.push(s);
                if (s.value === t.options.defaultSpeed) {
                    defaultInArray = true;
                }
            }
        }

        if (!defaultInArray) {
            speeds.push({
                name: t.options.defaultSpeed + t.options.speedChar,
                value: t.options.defaultSpeed
            });
        }

        speeds.sort(function (a, b) {
            return parseFloat(b.value) - parseFloat(a.value);
        });

        t.cleanspeed(player);

        player.speedButton = document.createElement('div');
        player.speedButton.setAttribute('id', 'speedBtn');
        player.speedButton.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'speed-button';
        player.speedButton.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + speedTitle + '" ' + ('aria-label="' + speedTitle + '" tabindex="0">' + getSpeedNameFromValue(t.options.defaultSpeed) + '</button>') + ('<div class="' + t.options.classPrefix + 'speed-selector ' + t.options.classPrefix + 'offscreen">') + ('<ul class="' + t.options.classPrefix + 'speed-selector-list"></ul>') + '</div>';

        t.addControlElement(player.speedButton, 'speed');

        for (var _i = 0, _total = speeds.length; _i < _total; _i++) {

            var inputId = t.id + '-speed-' + speeds[_i].value;

            player.speedButton.querySelector('ul').innerHTML += '<li class="' + t.options.classPrefix + 'speed-selector-list-item">' + ('<input class="' + t.options.classPrefix + 'speed-selector-input" type="radio" name="' + t.id + '_speed"') + ('disabled="disabled" value="' + speeds[_i].value + '" id="' + inputId + '"  ') + ((speeds[_i].value === t.options.defaultSpeed ? ' checked="checked"' : '') + '/>') + ('<label for="' + inputId + '" class="' + t.options.classPrefix + 'speed-selector-label') + ((speeds[_i].value === t.options.defaultSpeed ? ' ' + t.options.classPrefix + 'speed-selected' : '') + '">') + (speeds[_i].name + '</label>') + '</li>';
        }

        playbackSpeed = t.options.defaultSpeed;

        player.speedSelector = player.speedButton.querySelector('.' + t.options.classPrefix + 'speed-selector');

        var inEvents = ['focusin'],
            outEvents = ['focusout'],
            radios = player.speedButton.querySelectorAll('input[type="radio"]'),
            labels = player.speedButton.querySelectorAll('.' + t.options.classPrefix + 'speed-selector-label');

        for (var _i2 = 0, _total2 = inEvents.length; _i2 < _total2; _i2++) {
            player.speedButton.addEventListener(inEvents[_i2], function () {
                mejs.Utils.removeClass(player.speedSelector, t.options.classPrefix + 'offscreen');
                player.speedSelector.style.height = player.speedSelector.querySelector('ul').offsetHeight;
                player.speedSelector.style.top = -1 * parseFloat(player.speedSelector.offsetHeight) + 'px';
            });
        }

        for (var _i3 = 0, _total3 = outEvents.length; _i3 < _total3; _i3++) {
            player.speedSelector.addEventListener(outEvents[_i3], function () {
                mejs.Utils.addClass(this, t.options.classPrefix + 'offscreen');
            });
        }
        for (var _i4 = 0, _total4 = radios.length; _i4 < _total4; _i4++) {
            var radio = radios[_i4];
            radio.disabled = false;
            radio.addEventListener('click', function () {
                var self = this,
                newSpeed = self.value;

                playbackSpeed = newSpeed;
                media.playbackRate = parseFloat(newSpeed);
                player.speedButton.querySelector('button').innerHTML = getSpeedNameFromValue(newSpeed);
                var selected = player.speedButton.querySelectorAll('.' + t.options.classPrefix + 'speed-selected');
                for (var _i5 = 0, _total5 = selected.length; _i5 < _total5; _i5++) {
                    mejs.Utils.removeClass(selected[_i5], t.options.classPrefix + 'speed-selected');
                }

                self.checked = true;
                var siblings = mejs.Utils.siblings(self, function (el) {
                    return mejs.Utils.hasClass(el, t.options.classPrefix + 'speed-selector-label');
                });
                for (var j = 0, _total6 = siblings.length; j < _total6; j++) {
                    mejs.Utils.addClass(siblings[j], t.options.classPrefix + 'speed-selected');
                    mejs.Utils
                }
            });
        }
        for (var _i6 = 0, _total7 = labels.length; _i6 < _total7; _i6++) {
            labels[_i6].addEventListener('click', function () {
                var radio = mejs.Utils.siblings(this, function (el) {
                    return el.tagName === 'INPUT';
                })[0],
                    event = mejs.Utils.createEvent('click', radio);
                radio.dispatchEvent(event);
            });
        }

        player.speedSelector.addEventListener('keydown', function (e) {
            e.stopPropagation();
        });

        media.addEventListener('loadedmetadata', function () {
            if (playbackSpeed) {
                media.playbackRate = parseFloat(playbackSpeed);
            }
        });
    },
    cleanspeed: function cleanspeed(player) {
        if (player) {
            if (player.speedButton) {
                player.speedButton.parentNode.removeChild(player.speedButton);
            }
            if (player.speedSelector) {
                player.speedSelector.parentNode.removeChild(player.speedSelector);
            }
        }
    }
});
},{}]},{},[1]);

