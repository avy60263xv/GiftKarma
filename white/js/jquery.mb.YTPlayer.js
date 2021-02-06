/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 jquery.mb.components
 
 file: jquery.mb.YTPlayer.src.js
 last modified: 16/03/18 20.01
 Version:  3.2.1
 Build:  7091
 
 Open Lab s.r.l., Florence - Italy
 email:  matteo@open-lab.com
 blog: 	http://pupunzi.open-lab.com
 site: 	http://pupunzi.com
 	http://open-lab.com
 
 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 
 Copyright (c) 2001-2018. Matteo Bicocchi (Pupunzi)
 :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/



var ytp = ytp || {};

function onYouTubeIframeAPIReady() {
  if (ytp.YTAPIReady) return;
  ytp.YTAPIReady = true;
  jQuery(document).trigger("YTAPIReady");
}

var getYTPVideoID = function (url) {
  var videoID, playlistID;
  if (url.indexOf("youtu.be") > 0) {
    videoID = url.substr(url.lastIndexOf("/") + 1, url.length);
    playlistID = videoID.indexOf("?list=") > 0 ? videoID.substr(videoID.lastIndexOf("="), videoID.length) : null;
    videoID = playlistID ? videoID.substr(0, videoID.lastIndexOf("?")) : videoID;
  } else if (url.indexOf("http") > -1) {
    //videoID = url.match( /([\/&]v\/([^&#]*))|([\\?&]v=([^&#]*))/ )[ 1 ];
    videoID = url.match(/[\\?&]v=([^&#]*)/)[1];
    playlistID = url.indexOf("list=") > 0 ? url.match(/[\\?&]list=([^&#]*)/)[1] : null;
  } else {
    videoID = url.length > 15 ? null : url;
    playlistID = videoID ? null : url;
  }
  return {
    videoID: videoID,
    playlistID: playlistID
  };
};

(function (jQuery, ytp) {
  
  jQuery.mbYTPlayer = {
    name   : "jquery.mb.YTPlayer",
    version: "3.2.1",
    build  : "7091",
    author : "Matteo Bicocchi (pupunzi)",
    apiKey : "",
    
    /**
     * Default options for the player
     */
    defaults: {
      containment    : "body", /* default containment for the player */
      ratio          : "auto", /* "auto", "16/9", "4/3" or number: 4/3, 16/9 */
      videoURL       : null,
      startAt        : 0,
      stopAt         : 0,
      autoPlay       : true,
      vol            : 50, /* 1 to 100 */
      addRaster      : false,
      mask           : false, /* Ex: mask:{ 0:'assets/mask-1.png', 5:'assets/mask-2.png', 30: false, 50:'assets/mask-3.png'}*/
      opacity        : 1,
      quality        : "default", /* or “small”, “medium”, “large”, “hd720”, “hd1080”, “highres” */
      mute           : false,
      loop           : true,
      fadeOnStartTime: 1500, /* fade in timing at video start */
      showControls   : true,
      showAnnotations: false,
      cc_load_policy : false,
      showYTLogo     : true,
      stopMovieOnBlur: true,
      realfullscreen : true,
      abundance      : 0.2,
      coverImage     : false,
  
      useOnMobile        : true,
      mobileFallbackImage: null,
  
      gaTrack           : true,
      optimizeDisplay   : true,
      remember_last_time: false,
      playOnlyIfVisible : false,
      anchor            : "center,center", /* top,bottom,left,right combined in pair */
      addFilters        : null,
  
      onReady: function (player) {},
      onError: function (player, err) {}
    },
    /**
     *  @fontface icons
     *  */
    controls: {
      play    : "P",
      pause   : "p",
      mute    : "M",
      unmute  : "A",
      onlyYT  : "O",
      showSite: "R",
      ytLogo  : "Y"
    },
    controlBar      : null,
    locationProtocol: "https:",
    
    /**
     * Applicable filters
     */
    defaultFilters: {
      grayscale : {value: 0, unit: "%"},
      hue_rotate: {value: 0, unit: "deg"},
      invert    : {value: 0, unit: "%"},
      opacity   : {value: 0, unit: "%"},
      saturate  : {value: 0, unit: "%"},
      sepia     : {value: 0, unit: "%"},
      brightness: {value: 0, unit: "%"},
      contrast  : {value: 0, unit: "%"},
      blur      : {value: 0, unit: "px"}
    },
    
    /**
     * build the player
     * @param options
     * @returns [players]
     */
    buildPlayer: function (options) {
      
      if (!ytp.YTAPIReady && typeof window.YT === 'undefined') {
        jQuery("#YTAPI").remove();
        var tag = jQuery("<script></script>").attr({
          "src": jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/iframe_api?v=" + jQuery.mbYTPlayer.version,
          "id": "YTAPI"
        });
        jQuery("head").prepend(tag);
      } else {
        setTimeout(function () {
          jQuery(document).trigger("YTAPIReady");
          ytp.YTAPIReady = true;
        }, 100);
      }
      
      function isIframe () {
        var isIfr = false;
        try {
          if (self.location.href != top.location.href) isIfr = true;
        } catch (e) {
          isIfr = true;
        }
        return isIfr;
      };
      
      //console.time( "YTPlayerInit" );
      
      return this.each(function () {
        var YTPlayer = this;
        var $YTPlayer = jQuery(YTPlayer);
        $YTPlayer.hide();
        YTPlayer.loop = 0;
        YTPlayer.state = 0;
        YTPlayer.filters = jQuery.extend(true, {}, jQuery.mbYTPlayer.defaultFilters);
        YTPlayer.filtersEnabled = true;
        YTPlayer.id = YTPlayer.id || "YTP_" + new Date().getTime();
        $YTPlayer.addClass("mb_YTPlayer");

        /* Set properties */
        var property = $YTPlayer.data("property") && typeof $YTPlayer.data("property") == "string" ?
            eval('(' + $YTPlayer.data("property") + ')') :
            $YTPlayer.data("property");
        if (typeof property !== "object") {
          property = {};
        }
        YTPlayer.opt = jQuery.mbYTPlayer.defaults;
        jQuery.extend(YTPlayer.opt, options, property);
        YTPlayer.opt.elementId = YTPlayer.id;
        if (YTPlayer.opt.vol === 0) {
          YTPlayer.opt.vol = 1;
          YTPlayer.opt.mute = true;
        }
        if (YTPlayer.opt.loop && typeof YTPlayer.opt.loop === "boolean") {
          YTPlayer.opt.loop = 9999;
        }
        /* Disable fullScreen if is in an iframe */
        YTPlayer.opt.realfullscreen = isIframe() ? false : YTPlayer.opt.realfullscreen;
        /* Manage annotations */
        YTPlayer.opt.showAnnotations = YTPlayer.opt.showAnnotations ? '1' : '3';
        /* Manage show subtitle and caption */
        YTPlayer.opt.cc_load_policy = YTPlayer.opt.cc_load_policy ? '1' : '0';
        /* Manage cover image */
        YTPlayer.opt.coverImage = YTPlayer.opt.coverImage || YTPlayer.opt.backgroundImage;
        /* Manage Opacity */
        if (jQuery.mbBrowser.msie && jQuery.mbBrowser.version < 9) {
          YTPlayer.opt.opacity = 1;
        }
        YTPlayer.opt.containment = YTPlayer.opt.containment === "self" ? $YTPlayer : jQuery(YTPlayer.opt.containment);
        YTPlayer.isRetina = ( window.retina || window.devicePixelRatio > 1 );
        
        if (!$YTPlayer.attr("id"))
          $YTPlayer.attr("id", "ytp_" + new Date().getTime());
        
        YTPlayer.playerID = "iframe_" + YTPlayer.id;
        
        YTPlayer.isAlone = false;
        YTPlayer.hasFocus = true;
        YTPlayer.videoID = YTPlayer.opt.videoURL ?
            getYTPVideoID(YTPlayer.opt.videoURL).videoID : $YTPlayer.attr("href") ?
                getYTPVideoID($YTPlayer.attr("href")).videoID :
                false;
        
        /* Check if it is a video list */
        YTPlayer.playlistID = YTPlayer.opt.videoURL ?
            getYTPVideoID(YTPlayer.opt.videoURL).playlistID : $YTPlayer.attr("href") ?
                getYTPVideoID($YTPlayer.attr("href")).playlistID :
                false;
        
        var start_from_last = 0;
        if (jQuery.mbCookie.get("YTPlayer_start_from" + YTPlayer.videoID))
          start_from_last = parseFloat(jQuery.mbCookie.get("YTPlayer_start_from" + YTPlayer.videoID));
        if (YTPlayer.opt.remember_last_time && start_from_last) {
          YTPlayer.start_from_last = start_from_last;
          jQuery.mbCookie.remove("YTPlayer_start_from" + YTPlayer.videoID);
        }
        
        YTPlayer.isPlayer = $YTPlayer.is(YTPlayer.opt.containment);
        YTPlayer.isBackground = YTPlayer.opt.containment.is("body");
        
        if (YTPlayer.isBackground && ytp.backgroundIsInited)
          return;
        
        /* Hide the placeholder if it's not the target of the player */
        if (YTPlayer.isPlayer)
          $YTPlayer.show();
        
        /* create the overlay */
        YTPlayer.overlay = jQuery("<div/>").css({
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }).addClass("YTPOverlay");
        
        /* If is a inline player toggle play if the overlay is clicked*/
        if (YTPlayer.isPlayer) {
          YTPlayer.overlay.on("click", function () {
            $YTPlayer.YTPTogglePlay();
          })
        }
        
        /* create the wrapper */
        YTPlayer.wrapper = jQuery("<div/>").addClass("mbYTP_wrapper").attr("id", "wrapper_" + YTPlayer.id);
        
        YTPlayer.wrapper.css({
          position: "absolute",
          zIndex: 0,
          minWidth: "100%",
          minHeight: "100%",
          left: 0,
          top: 0,
          overflow: "hidden",
          opacity: 0
        });
        
        /* create the playerBox where the YT iframe will be placed */
        var playerBox = jQuery("<div/>").attr("id", YTPlayer.playerID).addClass("playerBox");
        playerBox.css({
          position: "absolute",
          zIndex: 0,
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          overflow: "hidden",
          opacity: 1
        });
        
        YTPlayer.wrapper.append(playerBox);
        playerBox.after(YTPlayer.overlay);
        
        if (YTPlayer.isPlayer) {
          YTPlayer.inlineWrapper = jQuery("<div/>").addClass("inline-YTPlayer");
          
          YTPlayer.inlineWrapper.css({
            position: "relative",
            maxWidth: YTPlayer.opt.containment.css("width")
          });
          
          YTPlayer.opt.containment.css({
            position: "relative",
            paddingBottom: "56.25%",
            overflow: "hidden",
            height: 0
          });
          YTPlayer.opt.containment.wrap(YTPlayer.inlineWrapper);
        }
        
        /* Loop all the elements inside the container and check if their position is not "static"*/
        YTPlayer.opt.containment.children().not("script, style").each(function () {
          if (jQuery(this).css("position") == "static")
            jQuery(this).css("position", "relative");
        });
        
        if (YTPlayer.isBackground) {
          jQuery("body").css({
            boxSizing: "border-box"
          });
          
          YTPlayer.wrapper.css({
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0
          });
          
        } else if (YTPlayer.opt.containment.css("position") == "static") {
          
          YTPlayer.opt.containment.css({
            position: "relative"
          });
          $YTPlayer.show();
        }
        YTPlayer.opt.containment.prepend(YTPlayer.wrapper);
        
        if (!YTPlayer.isBackground) {
          YTPlayer.overlay.on("mouseenter", function () {
            if (YTPlayer.controlBar && YTPlayer.controlBar.length)
              YTPlayer.controlBar.addClass("visible");
          }).on("mouseleave", function () {
            if (YTPlayer.controlBar && YTPlayer.controlBar.length)
              YTPlayer.controlBar.removeClass("visible");
          });
        }
        
        if (jQuery.mbBrowser.mobile && !YTPlayer.opt.useOnMobile) {
          if (YTPlayer.opt.mobileFallbackImage) {
            YTPlayer.wrapper.css({
              backgroundImage: "url(" + YTPlayer.opt.mobileFallbackImage + ")",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              opacity: 1
            });
            YTPlayer.wrapper.css({opacity: 1})
          }
          return $YTPlayer;
        }
        
        /* If is on device start playing on first touch */
        if (jQuery.mbBrowser.mobile && YTPlayer.opt.autoPlay && YTPlayer.opt.useOnMobile)
          jQuery("body").one("touchstart", function () {
            YTPlayer.player.playVideo();
          });
        
        jQuery(document).one("YTAPIReady", function () {
          $YTPlayer.trigger("YTAPIReady_" + YTPlayer.id);
          ytp.YTAPIReady = true;
        });

        YTPlayer.isOnScreen = jQuery.mbYTPlayer.isOnScreen(YTPlayer);

        $YTPlayer.one("YTAPIReady_"+YTPlayer.id, function(){
          
          var YTPlayer = this;
          var $YTPlayer = jQuery(YTPlayer);
          
          if (( YTPlayer.isBackground && ytp.backgroundIsInited ) || YTPlayer.isInit)
            return;
          
          if (YTPlayer.isBackground)
            ytp.backgroundIsInited = true;
          
          YTPlayer.opt.autoPlay = typeof YTPlayer.opt.autoPlay == "undefined" ? ( YTPlayer.isBackground ? true : false ) : YTPlayer.opt.autoPlay;
          YTPlayer.opt.vol = YTPlayer.opt.vol ? YTPlayer.opt.vol : 100;
          
          jQuery.mbYTPlayer.getDataFromAPI(YTPlayer);
          
          jQuery(YTPlayer).on("YTPChanged", function (e) {
            
            if (YTPlayer.isInit)
              return;
            
            YTPlayer.isInit = true;
            
            /** Initialize the YT player ------------------------------------
             * Youtube player variables
             * @type {{modestbranding: number, autoplay: number, controls: number, showinfo: number, rel: number, enablejsapi: number, version: number, playerapiid: string, origin: string, allowfullscreen: boolean, iv_load_policy: (string|*|jQuery.mbYTPlayer.opt.showAnnotations), playsinline: number}}
             */
            var playerVars = {
              'modestbranding': 1,
              'autoplay': 0,
              'controls': 0,
              'showinfo': 0,
              'rel': 0,
              'enablejsapi': 1,
              'version': 3,
              'playerapiid': YTPlayer.playerID,
              'origin': '*',
              'allowfullscreen': true,
              'wmode': 'transparent',
              'iv_load_policy': YTPlayer.opt.showAnnotations,
              'cc_load_policy': YTPlayer.opt.cc_load_policy,
              'playsinline': jQuery.browser.mobile ? 1 : 0,
              
              /* Check if the browser can play HTML5 videos */
              'html5': document.createElement('video').canPlayType ? 1 : 0
            };
            
            new YT.Player(YTPlayer.playerID, {
              //videoId: YTPlayer.videoID.toString(),
              playerVars: playerVars,
              events: {
                'onReady': function (event) {
                  
                  YTPlayer.player = event.target;
                  //todo: make playlist works
                  /* if (YTPlayer.playlistID && YTPlayer.apiKey) {
                      YTPlayer.isList = true;
                      YTPlayer.videos = [];
                      YTPlayer.player.cuePlaylist({
                        listType: 'playlist',
                        list: YTPlayer.playlistID.toString(),
                        startSeconds: YTPlayer.opt.startAt,
                        endSeconds: YTPlayer.opt.stopAt,
                        suggestedQuality: YTPlayer.opt.quality
                      });
                    }
                     else { */
                  
                  YTPlayer.player.loadVideoById({
                    videoId         : YTPlayer.videoID.toString(),
                    // startSeconds: YTPlayer.start_from_last || YTPlayer.opt.startAt,
                    // endSeconds: YTPlayer.opt.stopAt,
                    suggestedQuality: YTPlayer.opt.quality
                  });
                  
                  /*}*/
                  
                  $YTPlayer.trigger("YTPlayerIsReady_" + YTPlayer.id);
                },
                /**
                 * on State Change
                 * @param event
                 *
                 * -1 (unstarted)
                 * 0 (ended)
                 * 1 (playing)
                 * 2 (paused)
                 * 3 (buffering)
                 * 5 (video cued)
                 */
                'onStateChange': function (event) {
                  
                  if (typeof event.target.getPlayerState != "function")
                    return;
                  
                  var state = event.target.getPlayerState();
                  
                  if (YTPlayer.preventTrigger) {
                    YTPlayer.preventTrigger = false;
                    return
                  }
                  
                  YTPlayer.state = state;
                  
                  var eventType;
                  switch (state) {
                    case -1: //----------------------------------------------- unstarted
                      eventType = "YTPUnstarted";
                      break;
                    case 0: //------------------------------------------------ ended
                      eventType = "YTPRealEnd";
                      break;
                    case 1: //------------------------------------------------ play
                      eventType = "YTPPlay";
                      if (YTPlayer.controlBar.length)
                        YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.pause);
                      break;
                    case 2: //------------------------------------------------ pause
                      eventType = "YTPPause";
                      if (YTPlayer.controlBar.length)
                        YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                      break;
                    case 3: //------------------------------------------------ buffer
                      YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality);
                      eventType = "YTPBuffering";
                      if (YTPlayer.controlBar.length)
                        YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                      break;
                    case 5: //------------------------------------------------ cued
                      eventType = "YTPCued";
                      
                      /* If it is a playlist */
                      /* todo: make the playlist works
                      if(YTPlayer.playlistID){
                        var playListIDs = YTPlayer.player.getPlaylist();

                        if(playListIDs && playListIDs.length) {
                          YTPlayer.isList = true;
                          playListIDs = playListIDs.reverse();

                          for (var i = 0; i < playListIDs.length; i++ ) {
                            var videoObj = jQuery.extend(true, {}, YTPlayer.opt);
                            videoObj.videoURL = playListIDs[i];
                            YTPlayer.videos.push(videoObj);
                          }
                        }
                      }
                    */
                      break;
                    
                    default:
                      break;
                  }
                  
                  /* Trigger state events */
                  var YTPEvent = jQuery.Event(eventType);
                  YTPEvent.time = YTPlayer.currentTime;
                  
                  if (!YTPlayer.preventTrigger)
                    jQuery(YTPlayer).trigger(YTPEvent);
                },
                /**
                 * onPlaybackQualityChange
                 * @param e
                 */
                'onPlaybackQualityChange': function (e) {
                  var quality = e.target.getPlaybackQuality();
                  var YTPQualityChange = jQuery.Event("YTPQualityChange");
                  YTPQualityChange.quality = quality;
                  jQuery(YTPlayer).trigger(YTPQualityChange);
                },
                /**
                 * onError
                 * @param err
                 *
                 2 – The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
                 5 – The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
                 100 – The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
                 101 – The owner of the requested video does not allow it to be played in embedded players.
                 150 – This error is the same as 101. It's just a 101 error in disguise!
                 */
                'onError': function (err) {
                  
                  if (typeof YTPlayer.opt.onError == "function")
                    YTPlayer.opt.onError($YTPlayer, err);
                  
                  switch (err.data) {
                    case 2:
                      console.error("video ID:: " + YTPlayer.videoID + ": The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.");
                      break;
                    case 5:
                      console.error("video ID:: " + YTPlayer.videoID + ": The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.");
                      break;
                    case 100:
                      console.error("video ID:: " + YTPlayer.videoID + ": The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.");
                      break;
                    case 101:
                    case 150:
                      console.error("video ID:: " + YTPlayer.videoID + ": The owner of the requested video does not allow it to be played in embedded players.");
                      break;
                  }
                  
                  if (YTPlayer.isList)
                    jQuery(YTPlayer).YTPPlayNext();
                  
                }
              }
            });
            
            $YTPlayer.on("YTPlayerIsReady_" + YTPlayer.id, function(){
              
              if (YTPlayer.isReady)
                return this;
              
              YTPlayer.playerEl = YTPlayer.player.getIframe();
              jQuery(YTPlayer.playerEl).unselectable();
              $YTPlayer.optimizeDisplay();
              
              /**
               * Optimize display on resize
               */
              jQuery(window).off("resize.YTP_" + YTPlayer.id).on("resize.YTP_" + YTPlayer.id, function () {
                $YTPlayer.optimizeDisplay();
              });
              
              /**
               * Set the time of the last visit progress
               */
              if (YTPlayer.opt.remember_last_time) {
                jQuery(window).on("unload.YTP_" + YTPlayer.id, function () {
                  var current_time = YTPlayer.player.getCurrentTime();
                  jQuery.mbCookie.set("YTPlayer_start_from" + YTPlayer.videoID, current_time, 0);
                });
              }
              
              $YTPlayer.YTPCheckForState();
              
            });
          });
        });
        
        $YTPlayer.off("YTPTime.mask");
        jQuery.mbYTPlayer.applyMask(YTPlayer);
        
        // console.timeEnd( "YTPlayerInit" );
      });
    },
    
    /**
     * isOnScreen
     * Check if the YTPlayer is on screen
     * @param YTPlayer
     * @returns {boolean}
     */
    isOnScreen: function (YTPlayer) {
      
      var playerBox = YTPlayer.wrapper;
      var winTop = jQuery(window).scrollTop();
      var winBottom = winTop + jQuery(window).height();
      var elTop = playerBox.offset().top + (playerBox.height() / 1.2);
      var elBottom = playerBox.offset().top + (playerBox.height() / 2.8);

/*
      console.debug("-----------------------------", YTPlayer.id);
      console.debug("EL:: bottom:: ", elBottom, "top:: ",  elTop);
      console.debug("WIN:: bottom:: ", winBottom, "top:: ", winTop);
*/

      return ( ( elBottom <= winBottom ) && ( elTop >= winTop ) );
      
    },
    
    /**
     * getDataFromAPI
     * @param YTPlayer
     */
    getDataFromAPI: function (YTPlayer) {
      
      //console.debug("getDataFromAPI", YTPlayer.id, YTPlayer.videoID)
      
      YTPlayer.videoData = jQuery.mbStorage.get("YTPlayer_data_" + YTPlayer.videoID);
      jQuery(YTPlayer).off("YTPData.YTPlayer").on("YTPData.YTPlayer", function () {
        if (YTPlayer.hasData) {
          
          if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay) {
            var bgndURL = YTPlayer.opt.coverImage != "false" ? YTPlayer.opt.coverImage : (YTPlayer.videoData.thumb_max || YTPlayer.videoData.thumb_high || YTPlayer.videoData.thumb_medium);
            
            YTPlayer.opt.containment.css({
              background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center",
              backgroundSize: "cover"
            });

          }
        }
      });
      
      if (YTPlayer.videoData) {
        
        setTimeout(function () {
          YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? 16 / 9 : YTPlayer.opt.ratio;
          YTPlayer.dataReceived = true;
          
          var YTPChanged = jQuery.Event("YTPChanged");
          YTPChanged.time = YTPlayer.currentTime;
          YTPChanged.videoId = YTPlayer.videoID;
          YTPChanged.opt = YTPlayer.opt;
          jQuery(YTPlayer).trigger(YTPChanged);
          
          var YTPData = jQuery.Event("YTPData");
          YTPData.prop = {};
          for (var x in YTPlayer.videoData)
            YTPData.prop[x] = YTPlayer.videoData[x];
          jQuery(YTPlayer).trigger(YTPData);
          
        }, YTPlayer.opt.fadeOnStartTime);
        
        YTPlayer.hasData = true;
      } else if (jQuery.mbYTPlayer.apiKey) {
        
        /**
         * Get video info from API3 (needs api key)
         * snippet,player,contentDetails,statistics,status
         */
        jQuery.getJSON(jQuery.mbYTPlayer.locationProtocol + "//www.googleapis.com/youtube/v3/videos?id=" + YTPlayer.videoID + "&key=" + jQuery.mbYTPlayer.apiKey + "&part=snippet", function (data) {
          YTPlayer.dataReceived = true;
          
          var YTPChanged = jQuery.Event("YTPChanged");
          YTPChanged.time = YTPlayer.currentTime;
          YTPChanged.videoId = YTPlayer.videoID;
          jQuery(YTPlayer).trigger(YTPChanged);
          
          function parseYTPlayer_data(data) {
            YTPlayer.videoData = {};
            YTPlayer.videoData.id = YTPlayer.videoID;
            YTPlayer.videoData.channelTitle = data.channelTitle;
            YTPlayer.videoData.title = data.title;
            YTPlayer.videoData.description = data.description.length < 400 ? data.description : data.description.substring(0, 400) + " ...";
            YTPlayer.videoData.aspectratio = YTPlayer.opt.ratio == "auto" ? 16 / 9 : YTPlayer.opt.ratio;
            YTPlayer.opt.ratio = YTPlayer.videoData.aspectratio;
            YTPlayer.videoData.thumb_max = data.thumbnails.maxres ? data.thumbnails.maxres.url : null;
            YTPlayer.videoData.thumb_high = data.thumbnails.high ? data.thumbnails.high.url : null;
            YTPlayer.videoData.thumb_medium = data.thumbnails.medium ? data.thumbnails.medium.url : null;
            jQuery.mbStorage.set("YTPlayer_data_" + YTPlayer.videoID, YTPlayer.videoData);
          }
          
          if (!data.items[0]) {
            YTPlayer.videoData = {};
            YTPlayer.hasData = false;
            
          } else {
            
            parseYTPlayer_data(data.items[0].snippet);
            YTPlayer.hasData = true;
          }
          
          var YTPData = jQuery.Event("YTPData");
          YTPData.prop = {};
          for (var x in YTPlayer.videoData) YTPData.prop[x] = YTPlayer.videoData[x];
          jQuery(YTPlayer).trigger(YTPData);
        });
        
      } else {
        
        setTimeout(function () {
          var YTPChanged = jQuery.Event("YTPChanged");
          YTPChanged.time = YTPlayer.currentTime;
          YTPChanged.videoId = YTPlayer.videoID;
          jQuery(YTPlayer).trigger(YTPChanged);
        }, 50);
        
        if (!YTPlayer.opt.autoPlay) {
          // if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay) {
          var bgndURL = YTPlayer.opt.coverImage != "false" ? YTPlayer.opt.coverImage : jQuery.mbYTPlayer.locationProtocol + "//i.ytimg.com/vi/" + YTPlayer.videoID + "/maxresdefault.jpg";
          
          if (bgndURL)
            YTPlayer.opt.containment.css({
              background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center",
              backgroundSize: "cover"
            });
        }
        
        YTPlayer.videoData = null;
        YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;
        
      }
      
      if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay) { //&& ( !jQuery.mbBrowser.mobile && !jQuery.isTablet )
        YTPlayer.loading = jQuery("<div/>").addClass("loading").html("Loading").hide();
        jQuery(YTPlayer).append(YTPlayer.loading);
        YTPlayer.loading.fadeIn();
      }
    },
    
    /**
     * removeStoredData
     */
    removeStoredData: function () {
      jQuery.mbStorage.remove();
    },
    
    /**
     * getVideoData
     * @returns {*|YTPlayer.videoData}
     */
    getVideoData: function () {
      var YTPlayer = this.get(0);
      return YTPlayer.videoData;
    },
    
    /**
     * getVideoID
     * @returns {*|YTPlayer.videoID|boolean}
     */
    getVideoID: function () {
      var YTPlayer = this.get(0);
      return YTPlayer.videoID || false;
    },
    
    /**
     * getPlaylistID
     * @returns {*|YTPlayer.videoID|boolean}
     */
    getPlaylistID: function () {
      var YTPlayer = this.get(0);
      return YTPlayer.playlistID || false;
    },
    /**
     * setVideoQuality
     * @param quality
     * @returns {jQuery.mbYTPlayer}
     */
    setVideoQuality: function (quality) {
      var YTPlayer = this.get(0);
      YTPlayer.player.setPlaybackQuality(quality);
      return this;
    },
    
    /**
     * playlist
     * @param videos -> Array or String (videoList ID)
     * @param shuffle
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     *
     * To retrieve a Youtube playlist the Youtube API key is required:
     * https://console.developers.google.com/
     * jQuery.mbYTPlayer.apiKey
     */
    playlist: function (videos, shuffle, callback) {
      
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      
      //get the video list from the Youtube playlist passing the ID
      if (typeof videos == "String" && jQuery.mbYTPlayer.apiKey != "") {
        
        /**
         * @param playListID
         * @param page
         */
        function getVideoListFromYoutube(playListID, page) {
          page = page || '';
          var youtubeAPI = "https://www.googleapis.com/youtube/v3/playlistItems";
          jQuery.getJSON(youtubeAPI, {
            part: "snippet,contentDetails",
            playlistId: playListID, //You have to enter the PlaylistID
            maxResults: 50,
            pageToken: page,
            key: jQuery.mbYTPlayer.apiKey //You have to enter your own YoutubeAPIKey
          }).done(function (response) {
            CreateVideosArray(response);
            if (response.nextPageToken) {
              page = response.nextPageToken;
              getVideoListFromYoutube(plID, page, videos);
            } else {
              $YTPlayer.YTPlaylist(YTPlayer.videos, shuffle, callback)
            };
          });
        };
        
        /**
         * @param response
         * @constructor
         */
        function CreateVideosArray(response) {
          var k = response.items.length;
          for (var i = 0; i < k; i++) {
            YTPlayer.videos.push({
              "videoURL": response.items[i].contentDetails.videoId
            });
          };
        };
        
        getVideoListFromYoutube(videos);
        return this;
        
      }
      
      YTPlayer.isList = true;
      
      if (shuffle)
        videos = jQuery.shuffle(videos);
      
      if (!YTPlayer.videoID) {
        YTPlayer.videos = videos;
        YTPlayer.videoCounter = 1;
        YTPlayer.videoLength = videos.length;
        jQuery(YTPlayer).data("property", videos[0]);
        jQuery(YTPlayer).YTPlayer();
      }
      
      if (typeof callback == "function")
        jQuery(YTPlayer).one("YTPChanged", function () {
          callback(YTPlayer);
        });
      
      jQuery(YTPlayer).on("YTPEnd", function () {
        jQuery(YTPlayer).YTPPlayNext();
      });
      return this;
    },
    
    /**
     * playNext
     * @returns {jQuery.mbYTPlayer}
     */
    playNext: function () {
      var YTPlayer = this.get(0);
      YTPlayer.videoCounter++;
      if (YTPlayer.videoCounter > YTPlayer.videoLength)
        YTPlayer.videoCounter = 1;
      jQuery(YTPlayer).YTPPlayIndex(YTPlayer.videoCounter);
      return this;
    },
    
    /**
     * playPrev
     * @returns {jQuery.mbYTPlayer}
     */
    playPrev: function () {
      var YTPlayer = this.get(0);
      YTPlayer.videoCounter--;
      if (YTPlayer.videoCounter <= 0)
        YTPlayer.videoCounter = YTPlayer.videoLength;
      jQuery(YTPlayer).YTPPlayIndex(YTPlayer.videoCounter);
      return this;
    },
    
    /**
     *
     * @param idx
     * @returns {jQuery.mbYTPlayer}
     */
    playIndex: function (idx) {
      var YTPlayer = this.get(0);
      if (YTPlayer.checkForStartAt) {
        clearInterval(YTPlayer.checkForStartAt);
        clearInterval(YTPlayer.getState);
      }
      YTPlayer.videoCounter = idx;
      
      if (YTPlayer.videoCounter >= YTPlayer.videoLength)
        YTPlayer.videoCounter = YTPlayer.videoLength;
      
      var video = YTPlayer.videos[YTPlayer.videoCounter - 1];
      jQuery(YTPlayer).YTPChangeVideo(video);
      return this;
    },
    
    /**
     *
     * @param opt
     * @returns {jQuery.mbYTPlayer}
     */
    changeVideo: function (opt) {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      
      YTPlayer.opt.startAt = 0;
      YTPlayer.opt.stopAt = 0;
      YTPlayer.opt.mask = false;
      YTPlayer.opt.mute = true;
      YTPlayer.opt.autoPlay = true;
      YTPlayer.opt.addFilters = false;
      YTPlayer.opt.coverImage = false;
      
      YTPlayer.hasData = false;
      YTPlayer.hasChanged = true;
      
      YTPlayer.player.loopTime = undefined;
      
      if (opt)
        jQuery.extend(YTPlayer.opt, opt);
      
      YTPlayer.videoID = getYTPVideoID(YTPlayer.opt.videoURL).videoID;
      
      if (YTPlayer.opt.loop && typeof YTPlayer.opt.loop == "boolean")
        YTPlayer.opt.loop = 9999;
      
      YTPlayer.wrapper.css({
        background: "none"
      });
      
      jQuery(YTPlayer.playerEl).CSSAnimate({
        opacity: 0
      }, YTPlayer.opt.fadeOnStartTime, function () {
        
        jQuery.mbYTPlayer.getDataFromAPI(YTPlayer);
        
        $YTPlayer.YTPGetPlayer().loadVideoById({
          videoId: YTPlayer.videoID,
          // startSeconds: YTPlayer.opt.startAt,
          // endSeconds: YTPlayer.opt.stopAt,
          suggestedQuality: YTPlayer.opt.quality
        });
        $YTPlayer.YTPPause();
        $YTPlayer.optimizeDisplay();
        
        $YTPlayer.YTPCheckForState();
      });
      
      var YTPChangeVideo = jQuery.Event("YTPChangeVideo");
      YTPChangeVideo.time = YTPlayer.currentTime;
      jQuery(YTPlayer).trigger(YTPChangeVideo);
      
      jQuery.mbYTPlayer.applyMask(YTPlayer);
      
      return this;
    },
    
    /**
     * getPlayer
     * @returns {player}
     */
    getPlayer: function () {
      return jQuery(this).get(0).player;
    },
    
    /**
     * playerDestroy
     * @returns {jQuery.mbYTPlayer}
     */
    playerDestroy: function () {
      var YTPlayer = this.get(0);
      ytp.YTAPIReady = true;
      ytp.backgroundIsInited = false;
      YTPlayer.isInit = false;
      YTPlayer.videoID = null;
      YTPlayer.isReady = false;
      YTPlayer.wrapper.remove();
      jQuery("#controlBar_" + YTPlayer.id).remove();
      clearInterval(YTPlayer.checkForStartAt);
      clearInterval(YTPlayer.getState);
      return this;
    },
    
    /**
     * fullscreen
     * @param real
     * @returns {jQuery.mbYTPlayer}
     */
    fullscreen: function (real) {
      var YTPlayer = this.get(0);
      if (typeof real == "undefined") real = YTPlayer.opt.realfullscreen;
      real = eval(real);
      var controls = jQuery("#controlBar_" + YTPlayer.id);
      var fullScreenBtn = controls.find(".mb_OnlyYT");
      var videoWrapper = YTPlayer.isPlayer ? YTPlayer.opt.containment : YTPlayer.wrapper;
      
      if (real) {
        var fullscreenchange = jQuery.mbBrowser.mozilla ? "mozfullscreenchange" : jQuery.mbBrowser.webkit ? "webkitfullscreenchange" : "fullscreenchange";
        jQuery(document).off(fullscreenchange).on(fullscreenchange, function () {
          var isFullScreen = RunPrefixMethod(document, "IsFullScreen") || RunPrefixMethod(document, "FullScreen");
          if (!isFullScreen) {
            YTPlayer.isAlone = false;
            fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT);
            jQuery(YTPlayer).YTPSetVideoQuality(YTPlayer.opt.quality);
            videoWrapper.removeClass("YTPFullscreen");
            
            videoWrapper.CSSAnimate({
              opacity: YTPlayer.opt.opacity
            }, YTPlayer.opt.fadeOnStartTime);
            
            videoWrapper.css({
              zIndex: 0
            });
            
            if (YTPlayer.isBackground) {
              jQuery("body").after(controls);
            } else {
              YTPlayer.wrapper.before(controls);
            }
            jQuery(window).resize();
            jQuery(YTPlayer).trigger("YTPFullScreenEnd");
          } else {
            jQuery(YTPlayer).YTPSetVideoQuality("default");
            jQuery(YTPlayer).trigger("YTPFullScreenStart");
          }
        });
      }
      if (!YTPlayer.isAlone) {
        function hideMouse() {
          YTPlayer.overlay.css({
            cursor: "none"
          });
        }
        
        jQuery(document).on("mousemove.YTPlayer", function (e) {
          YTPlayer.overlay.css({
            cursor: "auto"
          });
          clearTimeout(YTPlayer.hideCursor);
          if (!jQuery(e.target).parents().is(".mb_YTPBar")) YTPlayer.hideCursor = setTimeout(hideMouse, 3000);
        });
        
        hideMouse();
        
        if (real) {
          videoWrapper.css({
            opacity: 0
          });
          videoWrapper.addClass("YTPFullscreen");
          launchFullscreen(videoWrapper.get(0));
          
          setTimeout(function () {
            videoWrapper.CSSAnimate({
              opacity: 1
            }, YTPlayer.opt.fadeOnStartTime * 2);
            
            videoWrapper.append(controls);
            jQuery(YTPlayer).optimizeDisplay();
            YTPlayer.player.seekTo(YTPlayer.player.getCurrentTime() + .1, true);
            
          }, YTPlayer.opt.fadeOnStartTime)
        } else
          videoWrapper.css({
            zIndex: 10000
          }).CSSAnimate({
            opacity: 1
          }, YTPlayer.opt.fadeOnStartTime * 2);
        fullScreenBtn.html(jQuery.mbYTPlayer.controls.showSite);
        YTPlayer.isAlone = true;
      } else {
        jQuery(document).off("mousemove.YTPlayer");
        clearTimeout(YTPlayer.hideCursor);
        YTPlayer.overlay.css({
          cursor: "auto"
        });
        if (real) {
          cancelFullscreen();
        } else {
          videoWrapper.CSSAnimate({
            opacity: YTPlayer.opt.opacity
          }, YTPlayer.opt.fadeOnStartTime);
          videoWrapper.css({
            zIndex: 0
          });
        }
        fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT);
        YTPlayer.isAlone = false;
      }
      
      function RunPrefixMethod(obj, method) {
        var pfx = ["webkit", "moz", "ms", "o", ""];
        var p = 0,
            m, t;
        while (p < pfx.length && !obj[m]) {
          m = method;
          if (pfx[p] == "") {
            m = m.substr(0, 1).toLowerCase() + m.substr(1);
          }
          m = pfx[p] + m;
          t = typeof obj[m];
          if (t != "undefined") {
            pfx = [pfx[p]];
            return ( t == "function" ? obj[m]() : obj[m] );
          }
          p++;
        }
      }
      
      function launchFullscreen(element) {
        RunPrefixMethod(element, "RequestFullScreen");
      }
      
      function cancelFullscreen() {
        if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
          RunPrefixMethod(document, "CancelFullScreen");
        }
      }
      
      return this;
    },
    
    /**
     * toggleLoops
     * @returns {jQuery.mbYTPlayer}
     */
    toggleLoops: function () {
      var YTPlayer = this.get(0);
      var data = YTPlayer.opt;
      if (data.loop == 1) {
        data.loop = 0;
      } else {
        if (data.startAt) {
          YTPlayer.player.seekTo(data.startAt);
        } else {
          YTPlayer.player.playVideo();
        }
        data.loop = 1;
      }
      return this;
    },
    
    /**
     * play
     * @returns {jQuery.mbYTPlayer}
     */
    play: function () {
      var YTPlayer = this.get(0);
      
      if (!YTPlayer.isReady)
        return this;
      
      YTPlayer.player.playVideo();
      
      jQuery(YTPlayer.playerEl).css({
        opacity: 1
      });
      
      YTPlayer.wrapper.css({
        backgroundImage: "none"
      });
      
      YTPlayer.wrapper.CSSAnimate({
        opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
      }, YTPlayer.opt.fadeOnStartTime);
      
      var controls = jQuery("#controlBar_" + YTPlayer.id);
      var playBtn = controls.find(".mb_YTPPlaypause");
      playBtn.html(jQuery.mbYTPlayer.controls.pause);
      YTPlayer.state = 1;
      YTPlayer.orig_background = jQuery(YTPlayer).css("background-image");
      
      return this;
    },
    
    /**
     * togglePlay
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     */
    togglePlay: function (callback) {
      var YTPlayer = this.get(0);
      if (YTPlayer.state == 1)
        this.YTPPause();
      else
        this.YTPPlay();
      
      if (typeof callback == "function")
        callback(YTPlayer.state);
      
      return this;
    },
    
    /**
     * stop
     * @returns {jQuery.mbYTPlayer}
     */
    stop: function () {
      var YTPlayer = this.get(0);
      var controls = jQuery("#controlBar_" + YTPlayer.id);
      var playBtn = controls.find(".mb_YTPPlaypause");
      playBtn.html(jQuery.mbYTPlayer.controls.play);
      YTPlayer.player.stopVideo();
      return this;
    },
    
    /**
     * pause
     * @returns {jQuery.mbYTPlayer}
     */
    pause: function () {
      var YTPlayer = this.get(0);
      YTPlayer.player.pauseVideo();
      YTPlayer.state = 2;
      return this;
    },
    
    /**
     * seekTo
     * @param sec
     * @returns {jQuery.mbYTPlayer}
     */
    seekTo: function (sec) {
      var YTPlayer = this.get(0);
      YTPlayer.player.seekTo(sec, true);
      return this;
    },
    
    /**
     * setVolume
     * @param val
     * @returns {jQuery.mbYTPlayer}
     */
    setVolume: function (val) {
      var YTPlayer = this.get(0);
      
      if (!val && !YTPlayer.opt.vol && YTPlayer.player.getVolume() == 0)
        jQuery(YTPlayer).YTPUnmute();
      else if (( !val && YTPlayer.player.getVolume() > 0 ) || ( val && YTPlayer.opt.vol == val )) {
        if (!YTPlayer.isMute)
          jQuery(YTPlayer).YTPMute();
        else
          jQuery(YTPlayer).YTPUnmute();
      } else {
        YTPlayer.opt.vol = val;
        YTPlayer.player.setVolume(YTPlayer.opt.vol);
        if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.updateSliderVal(val)
      }
      return this;
    },
    /**
     * Get volume
     */
    getVolume: function(){
      var YTPlayer = this.get(0);
      return YTPlayer.player.getVolume();
    },
    
    /**
     * toggleVolume
     * @returns {jQuery.mbYTPlayer}
     */
    toggleVolume: function () {
      var YTPlayer = this.get(0);
      if (!YTPlayer) return this;
      if (YTPlayer.player.isMuted()) {
        jQuery(YTPlayer).YTPUnmute();
      } else {
        jQuery(YTPlayer).YTPMute();
      }
      return this;
    },
    
    /**
     * mute
     * @returns {jQuery.mbYTPlayer}
     */
    mute: function () {
      var YTPlayer = this.get(0);
      if (YTPlayer.isMute)
        return this;
      YTPlayer.player.mute();
      YTPlayer.isMute = true;
      YTPlayer.player.setVolume(0);
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length && YTPlayer.volumeBar.width() > 10) {
        YTPlayer.volumeBar.updateSliderVal(0);
      }
      var controls = jQuery("#controlBar_" + YTPlayer.id);
      var muteBtn = controls.find(".mb_YTPMuteUnmute");
      muteBtn.html(jQuery.mbYTPlayer.controls.unmute);
      jQuery(YTPlayer).addClass("isMuted");
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.addClass("muted");
      var YTPEvent = jQuery.Event("YTPMuted");
      YTPEvent.time = YTPlayer.currentTime;
      
      if (!YTPlayer.preventTrigger)
        jQuery(YTPlayer).trigger(YTPEvent);
      
      return this;
    },
    
    /**
     * unmute
     * @returns {jQuery.mbYTPlayer}
     */
    unmute: function () {
      var YTPlayer = this.get(0);
      if (!YTPlayer.isMute)
        return this;
      YTPlayer.player.unMute();
      YTPlayer.isMute = false;
      YTPlayer.player.setVolume(YTPlayer.opt.vol);
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol > 10 ? YTPlayer.opt.vol : 10);
      var controls = jQuery("#controlBar_" + YTPlayer.id);
      var muteBtn = controls.find(".mb_YTPMuteUnmute");
      muteBtn.html(jQuery.mbYTPlayer.controls.mute);
      jQuery(YTPlayer).removeClass("isMuted");
      if (YTPlayer.volumeBar && YTPlayer.volumeBar.length) YTPlayer.volumeBar.removeClass("muted");
      var YTPEvent = jQuery.Event("YTPUnmuted");
      YTPEvent.time = YTPlayer.currentTime;
      
      if (!YTPlayer.preventTrigger)
        jQuery(YTPlayer).trigger(YTPEvent);
      
      return this;
    },
    
    /* FILTERS ---------------------------------------------------------------------------------------------------------*/
    
    /**
     * applyFilter
     * @param filter
     * @param value
     * @returns {jQuery.mbYTPlayer}
     */
    applyFilter: function (filter, value) {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      YTPlayer.filters[filter].value = value;
      if (YTPlayer.filtersEnabled)
        $YTPlayer.YTPEnableFilters();
    },
    
    /**
     * applyFilters
     * @param filters
     * @returns {jQuery.mbYTPlayer}
     */
    applyFilters: function (filters) {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      
      if (!YTPlayer.isReady) {
        jQuery(YTPlayer).on("YTPReady", function () {
          $YTPlayer.YTPApplyFilters(filters);
        });
        return this;
      }
      
      for (var key in filters) {
        $YTPlayer.YTPApplyFilter(key, filters[key]);
      }
      
      $YTPlayer.trigger("YTPFiltersApplied");
    },
    
    /**
     * toggleFilter
     * @param filter
     * @param value
     * @returns {jQuery.mbYTPlayer}
     */
    toggleFilter: function (filter, value) {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      
      if (!YTPlayer.filters[filter].value)
        YTPlayer.filters[filter].value = value;
      else
        YTPlayer.filters[filter].value = 0;
      
      if (YTPlayer.filtersEnabled)
        jQuery(YTPlayer).YTPEnableFilters();
      
      return this;
    },
    
    /**
     * toggleFilters
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     */
    toggleFilters: function (callback) {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      if (YTPlayer.filtersEnabled) {
        jQuery(YTPlayer).trigger("YTPDisableFilters");
        jQuery(YTPlayer).YTPDisableFilters();
      } else {
        jQuery(YTPlayer).YTPEnableFilters();
        jQuery(YTPlayer).trigger("YTPEnableFilters");
      }
      if (typeof callback == "function")
        callback(YTPlayer.filtersEnabled);
      
      return this;
    },
    
    /**
     * disableFilters
     * @returns {jQuery.mbYTPlayer}
     */
    disableFilters: function () {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      var iframe = jQuery(YTPlayer.playerEl);
      iframe.css("-webkit-filter", "");
      iframe.css("filter", "");
      YTPlayer.filtersEnabled = false;
      
      return this;
    },
    
    /**
     * enableFilters
     * @returns {jQuery.mbYTPlayer}
     */
    enableFilters: function () {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      
      var iframe = jQuery(YTPlayer.playerEl);
      var filterStyle = "";
      for (var key in YTPlayer.filters) {
        if (YTPlayer.filters[key].value)
          filterStyle += key.replace("_", "-") + "(" + YTPlayer.filters[key].value + YTPlayer.filters[key].unit + ") ";
      }
      iframe.css("-webkit-filter", filterStyle);
      iframe.css("filter", filterStyle);
      YTPlayer.filtersEnabled = true;
      
      return this;
    },
    
    /**
     * removeFilter
     * @param filter
     * @param callback
     * @returns {jQuery.mbYTPlayer}
     */
    removeFilter: function (filter, callback) {
      var $YTPlayer = this;
      var YTPlayer = $YTPlayer.get(0);
      
      if (typeof filter == "function") {
        callback = filter;
        filter = null;
      }
      
      if (!filter) {
        for (var key in YTPlayer.filters) {
          $YTPlayer.YTPApplyFilter(key, 0);
        }
        
        if (typeof callback == "function")
          callback(key);
        
        YTPlayer.filters = jQuery.extend(true, {}, jQuery.mbYTPlayer.defaultFilters);
        
      } else {
        $YTPlayer.YTPApplyFilter(filter, 0);
        if (typeof callback == "function") callback(filter);
      }
      
      var YTPEvent = jQuery.Event("YTPFiltersApplied");
      $YTPlayer.trigger(YTPEvent);
      
      return this;
    },
    
    /**
     * getFilters
     * @returns {filters}
     */
    getFilters: function () {
      var YTPlayer = this.get(0);
      return YTPlayer.filters;
    },
    
    /* MASK ---------------------------------------------------------------------------------------------------------*/
    
    /**
     * addMask
     * @param mask
     * @returns {jQuery.mbYTPlayer}
     */
    addMask: function (mask) {
      var YTPlayer = this.get(0);
      
      if (!mask)
        mask = YTPlayer.actualMask;
      
      var tempImg = jQuery("<img/>").attr("src", mask).on("load", function () {
        YTPlayer.overlay.CSSAnimate({
          opacity: 0
        }, YTPlayer.opt.fadeOnStartTime, function () {
          YTPlayer.hasMask = true;
          tempImg.remove();
          YTPlayer.overlay.css({
            backgroundImage: "url(" + mask + ")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover"
          });
          YTPlayer.overlay.CSSAnimate({
            opacity: 1
          }, YTPlayer.opt.fadeOnStartTime);
        });
      });
      
      return this;
    },
    
    /**
     * removeMask
     * @returns {jQuery.mbYTPlayer}
     */
    removeMask: function () {
      var YTPlayer = this.get(0);
      YTPlayer.overlay.CSSAnimate({
        opacity: 0
      }, YTPlayer.opt.fadeOnStartTime, function () {
        YTPlayer.hasMask = false;
        YTPlayer.overlay.css({
          backgroundImage: "",
          backgroundRepeat: "",
          backgroundPosition: "",
          backgroundSize: ""
        });
        YTPlayer.overlay.CSSAnimate({
          opacity: 1
        }, YTPlayer.opt.fadeOnStartTime);
      });
      
      return this;
    },
    
    /**
     * Apply mask
     * @param YTPlayer
     */
    applyMask: function (YTPlayer) {
      var $YTPlayer = jQuery(YTPlayer);
      $YTPlayer.off("YTPTime.mask");
      
      if (YTPlayer.opt.mask) {
        if (typeof YTPlayer.opt.mask == "string") {
          $YTPlayer.YTPAddMask(YTPlayer.opt.mask);
          YTPlayer.actualMask = YTPlayer.opt.mask;
        } else if (typeof YTPlayer.opt.mask == "object") {
          for (var time in YTPlayer.opt.mask) {
            if (YTPlayer.opt.mask[time])
              var img = jQuery("<img/>").attr("src", YTPlayer.opt.mask[time]);
          }
          if (YTPlayer.opt.mask[0])
            $YTPlayer.YTPAddMask(YTPlayer.opt.mask[0]);
          $YTPlayer.on("YTPTime.mask", function (e) {
            for (var time in YTPlayer.opt.mask) {
              if (e.time == time)
                if (!YTPlayer.opt.mask[time]) {
                  $YTPlayer.YTPRemoveMask();
                } else {
                  $YTPlayer.YTPAddMask(YTPlayer.opt.mask[time]);
                  YTPlayer.actualMask = YTPlayer.opt.mask[time];
                }
            }
          });
        }
      }
    },
    
    /**
     * toggleMask
     * @returns {jQuery.mbYTPlayer}
     */
    toggleMask: function () {
      var YTPlayer = this.get(0);
      var $YTPlayer = jQuery(YTPlayer);
      if (YTPlayer.hasMask)
        $YTPlayer.YTPRemoveMask();
      else
        $YTPlayer.YTPAddMask();
      return this;
    },
    
    /** CONTROLS --------------------------------------------------------------------------------------------------------*/
    
    /**
     * manageProgress
     * @returns {{totalTime: number, currentTime: number}}
     */
    manageProgress: function () {
      var YTPlayer = this.get(0);
      var controls = jQuery("#controlBar_" + YTPlayer.id);
      var progressBar = controls.find(".mb_YTPProgress");
      var loadedBar = controls.find(".mb_YTPLoaded");
      var timeBar = controls.find(".mb_YTPseekbar");
      var totW = progressBar.outerWidth();
      var currentTime = Math.floor(YTPlayer.player.getCurrentTime());
      var totalTime = Math.floor(YTPlayer.player.getDuration());
      var timeW = ( currentTime * totW ) / totalTime;
      var startLeft = 0;
      var loadedW = YTPlayer.player.getVideoLoadedFraction() * 100;
      loadedBar.css({
        left: startLeft,
        width: loadedW + "%"
      });
      timeBar.css({
        left: 0,
        width: timeW
      });
      return {
        totalTime: totalTime,
        currentTime: currentTime
      };
    },
    
    /**
     * buildControls
     * @param YTPlayer
     */
    buildControls: function (YTPlayer) {
      
      jQuery("#controlBar_" + YTPlayer.id).remove();
      if (!YTPlayer.opt.showControls) {
        YTPlayer.controlBar = false;
        return;
      }
      
      // @YTPlayer.opt.printUrl: is deprecated; use YTPlayer.opt.showYTLogo
      YTPlayer.opt.showYTLogo = YTPlayer.opt.showYTLogo || YTPlayer.opt.printUrl;
      if (jQuery("#controlBar_" + YTPlayer.id).length)
        return;
      YTPlayer.controlBar = jQuery("<span/>").attr("id", "controlBar_" + YTPlayer.id).addClass("mb_YTPBar").css({
        whiteSpace: "noWrap",
        position: YTPlayer.isBackground ? "fixed" : "absolute",
        zIndex: YTPlayer.isBackground ? 10000 : 1000
      }).hide();
      var buttonBar = jQuery("<div/>").addClass("buttonBar");
      /* play/pause button*/
      var playpause = jQuery("<span>" + jQuery.mbYTPlayer.controls.play + "</span>").addClass("mb_YTPPlaypause ytpicon").click(function () {
        if (YTPlayer.player.getPlayerState() == 1) jQuery(YTPlayer).YTPPause();
        else jQuery(YTPlayer).YTPPlay();
      });
      /* mute/unmute button*/
      var MuteUnmute = jQuery("<span>" + jQuery.mbYTPlayer.controls.mute + "</span>").addClass("mb_YTPMuteUnmute ytpicon").click(function () {
        if (YTPlayer.player.getVolume() == 0) {
          jQuery(YTPlayer).YTPUnmute();
        } else {
          jQuery(YTPlayer).YTPMute();
        }
      });
      /* volume bar*/
      var volumeBar = jQuery("<div/>").addClass("mb_YTPVolumeBar").css({
        display: "inline-block"
      });
      YTPlayer.volumeBar = volumeBar;
      /* time elapsed */
      var idx = jQuery("<span/>").addClass("mb_YTPTime");
      var vURL = YTPlayer.opt.videoURL ? YTPlayer.opt.videoURL : "";
      if (vURL.indexOf("http") < 0) vURL = jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/watch?v=" + YTPlayer.opt.videoURL;
      var movieUrl = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.ytLogo).addClass("mb_YTPUrl ytpicon").attr("title", "view on YouTube").on("click", function () {
        window.open(vURL, "viewOnYT")
      });
      var onlyVideo = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.onlyYT).addClass("mb_OnlyYT ytpicon").on("click", function () {
        jQuery(YTPlayer).YTPFullscreen(YTPlayer.opt.realfullscreen);
      });
      var progressBar = jQuery("<div/>").addClass("mb_YTPProgress").css("position", "absolute").click(function (e) {
        timeBar.css({
          width: ( e.clientX - timeBar.offset().left )
        });
        YTPlayer.timeW = e.clientX - timeBar.offset().left;
        YTPlayer.controlBar.find(".mb_YTPLoaded").css({
          width: 0
        });
        var totalTime = Math.floor(YTPlayer.player.getDuration());
        YTPlayer.goto = ( timeBar.outerWidth() * totalTime ) / progressBar.outerWidth();
        YTPlayer.player.seekTo(parseFloat(YTPlayer.goto), true);
        YTPlayer.controlBar.find(".mb_YTPLoaded").css({
          width: 0
        });
      });
      var loadedBar = jQuery("<div/>").addClass("mb_YTPLoaded").css("position", "absolute");
      var timeBar = jQuery("<div/>").addClass("mb_YTPseekbar").css("position", "absolute");
      progressBar.append(loadedBar).append(timeBar);
      buttonBar.append(playpause).append(MuteUnmute).append(volumeBar).append(idx);
      if (YTPlayer.opt.showYTLogo) {
        buttonBar.append(movieUrl);
      }
      if (YTPlayer.isBackground || ( eval(YTPlayer.opt.realfullscreen) && !YTPlayer.isBackground )) buttonBar.append(onlyVideo);
      YTPlayer.controlBar.append(buttonBar).append(progressBar);
      if (!YTPlayer.isBackground) {
        YTPlayer.controlBar.addClass("inlinePlayer");
        YTPlayer.wrapper.before(YTPlayer.controlBar);
      } else {
        jQuery("body").after(YTPlayer.controlBar);
      }
      volumeBar.simpleSlider({
        initialval: YTPlayer.opt.vol,
        scale: 100,
        orientation: "h",
        callback: function (el) {
          if (el.value == 0) {
            jQuery(YTPlayer).YTPMute();
          } else {
            jQuery(YTPlayer).YTPUnmute();
          }
          YTPlayer.player.setVolume(el.value);
          if (!YTPlayer.isMute) YTPlayer.opt.vol = el.value;
        }
      });
    },
    
    /* MANAGE PLAYER STATE ------------------------------------------------------------------------------------------*/
    
    /**
     * checkForState
     */
    checkForState: function () {
      var YTPlayer = this.get(0);
      var $YTPlayer = jQuery(YTPlayer);
      
      clearInterval(YTPlayer.getState);
      var interval = 100;
      //Checking if player has been removed from scene
      if (!jQuery.contains(document, YTPlayer)) {
        $YTPlayer.YTPPlayerDestroy();
        clearInterval(YTPlayer.getState);
        clearInterval(YTPlayer.checkForStartAt);
        return;
      }
      
      jQuery.mbYTPlayer.checkForStart(YTPlayer);
      
      YTPlayer.getState = setInterval(function () {
        var $YTPlayer = jQuery(YTPlayer);
        
        if (!YTPlayer.isReady)
          return;
        
        var prog = jQuery(YTPlayer).YTPManageProgress();
        
        var stopAt = YTPlayer.opt.stopAt > YTPlayer.opt.startAt ? YTPlayer.opt.stopAt : 0;
        stopAt = stopAt < YTPlayer.player.getDuration() ? stopAt : 0;
        if (YTPlayer.currentTime != prog.currentTime) {
          var YTPEvent = jQuery.Event("YTPTime");
          YTPEvent.time = YTPlayer.currentTime;
          jQuery(YTPlayer).trigger(YTPEvent);
        }
        YTPlayer.currentTime = prog.currentTime;
        YTPlayer.totalTime = YTPlayer.player.getDuration();
        if (YTPlayer.player.getVolume() == 0) $YTPlayer.addClass("isMuted");
        else $YTPlayer.removeClass("isMuted");
        
        if (YTPlayer.opt.showControls)
          if (prog.totalTime) {
            YTPlayer.controlBar.find(".mb_YTPTime").html(jQuery.mbYTPlayer.formatTime(prog.currentTime) + " / " + jQuery.mbYTPlayer.formatTime(prog.totalTime));
          } else {
            YTPlayer.controlBar.find(".mb_YTPTime").html("-- : -- / -- : --");
          }
        
        if (eval(YTPlayer.opt.stopMovieOnBlur)) {
          if (!document.hasFocus()) {
            if (YTPlayer.state == 1) {
              YTPlayer.hasFocus = false;
              $YTPlayer.YTPPause();
            }
          } else if (document.hasFocus() && !YTPlayer.hasFocus && !( YTPlayer.state == -1 || YTPlayer.state == 0 )) {
            YTPlayer.hasFocus = true;
            YTPlayer.player.playVideo();
          }
        }
        
        if (YTPlayer.opt.playOnlyIfVisible) {
          var isOnScreen = jQuery.mbYTPlayer.isOnScreen(YTPlayer);
          if (!isOnScreen  && YTPlayer.state == 1) {
            YTPlayer.isOnScreen = false;
            $YTPlayer.YTPPause();
          } else if (isOnScreen && !YTPlayer.isOnScreen) {
            YTPlayer.isOnScreen = true;
            YTPlayer.player.playVideo();
          }
        }
        
        if (YTPlayer.controlBar.length && YTPlayer.controlBar.outerWidth() <= 400 && !YTPlayer.isCompact) {
          YTPlayer.controlBar.addClass("compact");
          YTPlayer.isCompact = true;
          if (!YTPlayer.isMute && YTPlayer.volumeBar) YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol);
        } else if (YTPlayer.controlBar.length && YTPlayer.controlBar.outerWidth() > 400 && YTPlayer.isCompact) {
          YTPlayer.controlBar.removeClass("compact");
          YTPlayer.isCompact = false;
          
          if (!YTPlayer.isMute && YTPlayer.volumeBar)
            YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol);
        }
        // the video is ended
        if ( YTPlayer.player.getPlayerState() > 0 && ( (parseFloat(YTPlayer.player.getDuration() - .5) < YTPlayer.player.getCurrentTime()) || ( stopAt > 0 && parseFloat(YTPlayer.player.getCurrentTime()) > stopAt ) )) {
          
          if (YTPlayer.isEnded)
            return;
          
          YTPlayer.isEnded = true;
          setTimeout(function () {
            YTPlayer.isEnded = false
          }, 1000);
          
          if (YTPlayer.isList) {
            if (!YTPlayer.opt.loop || ( YTPlayer.opt.loop > 0 && YTPlayer.player.loopTime === YTPlayer.opt.loop - 1 )) {
              YTPlayer.player.loopTime = undefined;
              clearInterval(YTPlayer.getState);
              var YTPEnd = jQuery.Event("YTPEnd");
              YTPEnd.time = YTPlayer.currentTime;
              jQuery(YTPlayer).trigger(YTPEnd);
              //YTPlayer.state = 0;
              return;
            }
          } else if (!YTPlayer.opt.loop || ( YTPlayer.opt.loop > 0 && YTPlayer.player.loopTime === YTPlayer.opt.loop - 1 )) {
            YTPlayer.player.loopTime = undefined;
            YTPlayer.preventTrigger = true;
            YTPlayer.state = 2;
            jQuery(YTPlayer).YTPPause();
            YTPlayer.wrapper.CSSAnimate({
              opacity: 0
            }, YTPlayer.opt.fadeOnStartTime, function () {
              if (YTPlayer.controlBar.length)
                YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
              var YTPEnd = jQuery.Event("YTPEnd");
              YTPEnd.time = YTPlayer.currentTime;
              jQuery(YTPlayer).trigger(YTPEnd);
              YTPlayer.player.seekTo(YTPlayer.opt.startAt, true);
              
              if (!YTPlayer.isBackground) {
                if (YTPlayer.opt.coverImage && YTPlayer.isPlayer) {
                  YTPlayer.opt.coverImage = YTPlayer.opt.coverImage || YTPlayer.orig_background;
                  YTPlayer.opt.containment.css({
                    background: "url(" + YTPlayer.opt.coverImage + ") center center",
                    backgroundSize: "cover"
                  });
                }
              } else if (YTPlayer.orig_background) {
                jQuery(YTPlayer).css("background-image", YTPlayer.orig_background);
              }
            });
            return;
          }
          
          YTPlayer.player.loopTime = YTPlayer.player.loopTime ? ++YTPlayer.player.loopTime : 1;
          
          //console.debug("loop", YTPlayer.opt.loop, YTPlayer.player.loopTime);
          
          YTPlayer.opt.startAt = YTPlayer.opt.startAt || 1;
          
          YTPlayer.preventTrigger = true;
          YTPlayer.state = 2;
          //jQuery( YTPlayer ).YTPPause();
          YTPlayer.player.pauseVideo()
          YTPlayer.player.seekTo(YTPlayer.opt.startAt, true);
          
          YTPlayer.player.playVideo();
        }
      }, interval);
    },
    
    /**
     * checkForStart
     * @param YTPlayer
     */
    checkForStart: function (YTPlayer) {
      var $YTPlayer = jQuery(YTPlayer);
      
      /* If the player has been removed from scene destroy it */
      if (!jQuery.contains(document, YTPlayer)) {
        $YTPlayer.YTPPlayerDestroy();
        return;
      }
      
      /* CREATE CONTROL BAR */
      jQuery.mbYTPlayer.buildControls(YTPlayer);
      
      if (YTPlayer.overlay)
        if (YTPlayer.opt.addRaster) {
          var classN = YTPlayer.opt.addRaster == "dot" ? "raster-dot" : "raster";
          YTPlayer.overlay.addClass(YTPlayer.isRetina ? classN + " retina" : classN);
        } else {
          YTPlayer.overlay.removeClass(function (index, classNames) {
            // change the list into an array
            var current_classes = classNames.split(" "),
                // array of classes which are to be removed
                classes_to_remove = [];
            jQuery.each(current_classes, function (index, class_name) {
              // if the classname begins with bg add it to the classes_to_remove array
              if (/raster.*/.test(class_name)) {
                classes_to_remove.push(class_name);
              }
            });
            classes_to_remove.push("retina");
            // turn the array back into a string
            return classes_to_remove.join(" ");
          })
        }
      
      YTPlayer.preventTrigger = true;
      YTPlayer.state = 2;
      $YTPlayer.YTPPause();
      $YTPlayer.YTPMute();
      
      var startAt = YTPlayer.start_from_last ? YTPlayer.start_from_last : YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;
      YTPlayer.player.playVideo();
      $YTPlayer.YTPMute();
      
      //if (YTPlayer.start_from_last)
      YTPlayer.player.seekTo(startAt, true);
      
      YTPlayer.checkForStartAt = setInterval(function () {
        var canPlayVideo = YTPlayer.player.getVideoLoadedFraction() >= startAt / YTPlayer.player.getDuration();
        
        if (YTPlayer.player.getDuration() > 0 && YTPlayer.player.getCurrentTime() >= startAt && canPlayVideo) {
          YTPlayer.start_from_last = null;
          
          clearInterval(YTPlayer.checkForStartAt);
          if (typeof YTPlayer.opt.onReady == "function")
            YTPlayer.opt.onReady(YTPlayer);
          
          YTPlayer.isReady = true;
          
          $YTPlayer.YTPRemoveFilter();
          
          if (YTPlayer.opt.addFilters) {
            $YTPlayer.YTPApplyFilters(YTPlayer.opt.addFilters);
          } else {
            $YTPlayer.YTPApplyFilters({});
          }
          $YTPlayer.YTPEnableFilters();
          
          var YTPready = jQuery.Event("YTPReady");
          YTPready.time = YTPlayer.currentTime;
          jQuery(YTPlayer).trigger(YTPready);
          
          YTPlayer.preventTrigger = true;
          YTPlayer.state = 2;
          
          jQuery(YTPlayer).YTPPause();
          
          if (!YTPlayer.opt.mute)
            jQuery(YTPlayer).YTPUnmute();
          
          YTPlayer.preventTrigger = false;
          
          if (typeof _gaq != "undefined" && eval(YTPlayer.opt.gaTrack))
            _gaq.push(['_trackEvent', 'YTPlayer', 'Play', ( YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString() )]);
          else if (typeof ga != "undefined" && eval(YTPlayer.opt.gaTrack))
            ga('send', 'event', 'YTPlayer', 'play', ( YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString() ));
          
          if (YTPlayer.opt.autoPlay) {
            var YTPStart = jQuery.Event("YTPStart");
            YTPStart.time = YTPlayer.currentTime;
            jQuery(YTPlayer).trigger(YTPStart);
            
            $YTPlayer.YTPPlay();
            
            /* Fix for Safari freeze */
            if (jQuery.mbBrowser.os.name == "mac" && jQuery.mbBrowser.safari && jQuery.mbBrowser.versionCompare(jQuery.mbBrowser.fullVersion, "10.1") < 0) { //jQuery.mbBrowser.os.minor_version < 11
              YTPlayer.safariPlay = setInterval(function () {
                if (YTPlayer.state != 1)
                  $YTPlayer.YTPPlay();
                else
                  clearInterval(YTPlayer.safariPlay)
              }, 10)
            }
            
          } else {
            setTimeout(function () {
              YTPlayer.player.pauseVideo();
              
              if (YTPlayer.start_from_last)
                YTPlayer.player.seekTo(startAt, true);
              
              if (!YTPlayer.isPlayer) {
                if(!YTPlayer.opt.coverImage){
                  jQuery(YTPlayer.playerEl).CSSAnimate({
                    opacity: 1
                  }, YTPlayer.opt.fadeOnStartTime);
                  YTPlayer.wrapper.CSSAnimate({
                    opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
                  }, YTPlayer.opt.fadeOnStartTime);
                  
                } else {
                  YTPlayer.wrapper.css({opacity: 0});
                  setTimeout(function(){
                    
                    YTPlayer.wrapper.css({
                      background: "rgba(0,0,0,0.5) url(" + YTPlayer.opt.coverImage + ") center center",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat"
                    }).CSSAnimate({
                      opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
                    }, YTPlayer.opt.fadeOnStartTime);
                  },YTPlayer.opt.fadeOnStartTime)
                }
              }
            }, 150);
            if (YTPlayer.controlBar.length)
              YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
          }
          
          if (YTPlayer.isPlayer && !YTPlayer.opt.autoPlay && ( YTPlayer.loading && YTPlayer.loading.length )) {
            YTPlayer.loading.html("Ready");
            setTimeout(function () {
              YTPlayer.loading.fadeOut();
            }, 100)
          }
          
          if (YTPlayer.controlBar && YTPlayer.controlBar.length)
            YTPlayer.controlBar.slideDown(1000);
        }
        
        else if (jQuery.mbBrowser.os.name == "mac" && jQuery.mbBrowser.safari && jQuery.mbBrowser.fullVersion && jQuery.mbBrowser.versionCompare(jQuery.mbBrowser.fullVersion, "10.1") < 0) { //jQuery.mbBrowser.os.minor_version < 11
          YTPlayer.player.playVideo();
          if (startAt >= 0)
            YTPlayer.player.seekTo(startAt, true);
        }
        
      }, 500);
      
      return $YTPlayer;
    },
    
    /* TIME METHODS -------------------------------------------------------------------------------------------*/
    
    /**
     * getTime
     * @returns {string} time
     */
    getTime: function () {
      var YTPlayer = this.get(0);
      return jQuery.mbYTPlayer.formatTime(YTPlayer.currentTime);
    },
    
    /**
     * getTotalTime
     * @returns {string} total time
     */
    getTotalTime: function (format) {
      var YTPlayer = this.get(0);
      return jQuery.mbYTPlayer.formatTime(YTPlayer.totalTime);
    },
    
    /**
     * formatTime
     * @param s
     * @returns {string}
     */
    formatTime: function (s) {
      var min = Math.floor(s / 60);
      var sec = Math.floor(s - ( 60 * min ));
      return ( min <= 9 ? "0" + min : min ) + " : " + ( sec <= 9 ? "0" + sec : sec );
    },
    
    /* PLAYER POSITION AND SIZE OPTIMIZATION-------------------------------------------------------------------------------------------*/
    
    /**
     * setAnchor
     * @param anchor
     */
    setAnchor: function (anchor) {
      var $YTplayer = this;
      $YTplayer.optimizeDisplay(anchor);
    },
    
    /**
     * getAnchor
     * @param anchor
     */
    getAnchor: function () {
      var YTPlayer = this.get(0);
      return YTPlayer.opt.anchor;
    }
  };
  
  /**
   * optimizeDisplay
   * @param anchor
   * can be center, top, bottom, right, left; (default is center,center)
   */
  jQuery.fn.optimizeDisplay = function (anchor) {
    var YTPlayer = this.get(0);
    var vid = {};
    
    YTPlayer.opt.anchor = anchor || YTPlayer.opt.anchor;
    YTPlayer.opt.anchor = typeof YTPlayer.opt.anchor != "undefined " ? YTPlayer.opt.anchor : "center,center";
    var YTPAlign = YTPlayer.opt.anchor.split(",");
    var el = YTPlayer.wrapper;
    var iframe = jQuery(YTPlayer.playerEl);
    
    if (YTPlayer.opt.optimizeDisplay) {
      var abundance = iframe.height() * YTPlayer.opt.abundance;
      var win = {};
      win.width = el.outerWidth();
      win.height = el.outerHeight() + abundance;
      // TODO why do we need to check for ratio == auto in every method, shouldn't this be handled in buildPlayer()?
      YTPlayer.opt.ratio = YTPlayer.opt.ratio === "auto" ? 16 / 9 : YTPlayer.opt.ratio;
      YTPlayer.opt.ratio = eval(YTPlayer.opt.ratio);
      vid.width = win.width;
      vid.height = Math.ceil(vid.width / YTPlayer.opt.ratio);
      vid.marginTop = Math.ceil(-( ( vid.height - win.height ) / 2 ));
      vid.marginLeft = 0;
      var lowest = vid.height < win.height;
      
      if (lowest) {
        vid.height = win.height;
        vid.width = Math.ceil(vid.height * YTPlayer.opt.ratio);
        vid.marginTop = 0;
        vid.marginLeft = Math.ceil(-( ( vid.width - win.width ) / 2 ));
      }
      
      for (var a in YTPAlign) {
        if (YTPAlign.hasOwnProperty(a)) {
          var al = YTPAlign[a].replace(/ /g, "");
          switch (al) {
            case "top":
              vid.marginTop = lowest ? -( ( vid.height - win.height ) / 2 ) : 0;
              break;
            case "bottom":
              vid.marginTop = lowest ? 0 : -( vid.height - ( win.height ) );
              break;
            case "left":
              vid.marginLeft = 0;
              break;
            case "right":
              vid.marginLeft = lowest ? -( vid.width - win.width ) : 0;
              break;
            default:
              if (vid.width > win.width)
                vid.marginLeft = -( ( vid.width - win.width ) / 2 );
              break;
          }
        }
      }
      
    } else {
      vid.width = "100%";
      vid.height = "100%";
      vid.marginTop = 0;
      vid.marginLeft = 0;
    }
    
    iframe.css({
      width: vid.width,
      height: vid.height,
      marginTop: vid.marginTop,
      marginLeft: vid.marginLeft,
      maxWidth: "initial"
    });
  };
  
  /* UTILITIES -----------------------------------------------------------------------------------------------------------------------*/
  
  /**
   * shuffle
   * @param arr
   * @returns {Array|string|Blob|*}
   *
   */
  jQuery.shuffle = function (arr) {
    var newArray = arr.slice();
    var len = newArray.length;
    var i = len;
    while (i--) {
      var p = parseInt(Math.random() * len);
      var t = newArray[i];
      newArray[i] = newArray[p];
      newArray[p] = t;
    }
    return newArray;
  };
  
  /**
   * Unselectable
   * @returns {*}
   */
  jQuery.fn.unselectable = function () {
    return this.each(function () {
      jQuery(this).css({
        "-moz-user-select": "none",
        "-webkit-user-select": "none",
        "user-select": "none"
      }).attr("unselectable", "on");
    });
  };
  
  /* EXTERNAL METHODS -----------------------------------------------------------------------------------------------------------------------*/
  
  jQuery.fn.YTPlayer = jQuery.mbYTPlayer.buildPlayer;
  jQuery.fn.mb_YTPlayer = jQuery.mbYTPlayer.buildPlayer;
  
  jQuery.fn.YTPCheckForState = jQuery.mbYTPlayer.checkForState;
  
  jQuery.fn.YTPGetPlayer = jQuery.mbYTPlayer.getPlayer;
  jQuery.fn.YTPGetVideoID = jQuery.mbYTPlayer.getVideoID;
  jQuery.fn.YTPGetPlaylistID = jQuery.mbYTPlayer.getPlaylistID;
  jQuery.fn.YTPChangeVideo = jQuery.fn.YTPChangeMovie = jQuery.mbYTPlayer.changeVideo;
  jQuery.fn.YTPPlayerDestroy = jQuery.mbYTPlayer.playerDestroy;
  
  jQuery.fn.YTPPlay = jQuery.mbYTPlayer.play;
  jQuery.fn.YTPTogglePlay = jQuery.mbYTPlayer.togglePlay;
  jQuery.fn.YTPStop = jQuery.mbYTPlayer.stop;
  jQuery.fn.YTPPause = jQuery.mbYTPlayer.pause;
  jQuery.fn.YTPSeekTo = jQuery.mbYTPlayer.seekTo;
  
  jQuery.fn.YTPlaylist = jQuery.mbYTPlayer.playlist;
  jQuery.fn.YTPPlayNext = jQuery.mbYTPlayer.playNext;
  jQuery.fn.YTPPlayPrev = jQuery.mbYTPlayer.playPrev;
  jQuery.fn.YTPPlayIndex = jQuery.mbYTPlayer.playIndex;
  
  jQuery.fn.YTPMute = jQuery.mbYTPlayer.mute;
  jQuery.fn.YTPUnmute = jQuery.mbYTPlayer.unmute;
  jQuery.fn.YTPToggleVolume = jQuery.mbYTPlayer.toggleVolume;
  jQuery.fn.YTPSetVolume = jQuery.mbYTPlayer.setVolume;
  jQuery.fn.YTPGetVolume = jQuery.mbYTPlayer.getVolume;
  
  jQuery.fn.YTPGetVideoData = jQuery.mbYTPlayer.getVideoData;
  jQuery.fn.YTPFullscreen = jQuery.mbYTPlayer.fullscreen;
  jQuery.fn.YTPToggleLoops = jQuery.mbYTPlayer.toggleLoops;
  jQuery.fn.YTPSetVideoQuality = jQuery.mbYTPlayer.setVideoQuality;
  jQuery.fn.YTPManageProgress = jQuery.mbYTPlayer.manageProgress;
  
  jQuery.fn.YTPApplyFilter = jQuery.mbYTPlayer.applyFilter;
  jQuery.fn.YTPApplyFilters = jQuery.mbYTPlayer.applyFilters;
  jQuery.fn.YTPToggleFilter = jQuery.mbYTPlayer.toggleFilter;
  jQuery.fn.YTPToggleFilters = jQuery.mbYTPlayer.toggleFilters;
  jQuery.fn.YTPRemoveFilter = jQuery.mbYTPlayer.removeFilter;
  jQuery.fn.YTPDisableFilters = jQuery.mbYTPlayer.disableFilters;
  jQuery.fn.YTPEnableFilters = jQuery.mbYTPlayer.enableFilters;
  jQuery.fn.YTPGetFilters = jQuery.mbYTPlayer.getFilters;
  
  jQuery.fn.YTPGetTime = jQuery.mbYTPlayer.getTime;
  jQuery.fn.YTPGetTotalTime = jQuery.mbYTPlayer.getTotalTime;
  
  jQuery.fn.YTPAddMask = jQuery.mbYTPlayer.addMask;
  jQuery.fn.YTPRemoveMask = jQuery.mbYTPlayer.removeMask;
  jQuery.fn.YTPToggleMask = jQuery.mbYTPlayer.toggleMask;
  
  jQuery.fn.YTPSetAnchor = jQuery.mbYTPlayer.setAnchor;
  jQuery.fn.YTPGetAnchor = jQuery.mbYTPlayer.getAnchor;
  
})(jQuery, ytp);
;
/*
 * ******************************************************************************
 *  jquery.mb.components
 *  file: jquery.mb.CSSAnimate.min.js
 *
 *  Copyright (c) 2001-2014. Matteo Bicocchi (Pupunzi);
 *  Open lab srl, Firenze - Italy
 *  email: matteo@open-lab.com
 *  site: 	http://pupunzi.com
 *  blog:	http://pupunzi.open-lab.com
 * 	http://open-lab.com
 *
 *  Licences: MIT, GPL
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 *  last modified: 26/03/14 21.40
 *  *****************************************************************************
 */

jQuery.support.CSStransition=function(){var d=(document.body||document.documentElement).style;return void 0!==d.transition||void 0!==d.WebkitTransition||void 0!==d.MozTransition||void 0!==d.MsTransition||void 0!==d.OTransition}();function uncamel(d){return d.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()})}function setUnit(d,a){return"string"!==typeof d||d.match(/^[\-0-9\.]+jQuery/)?""+d+a:d}
function setFilter(d,a,b){var c=uncamel(a),g=jQuery.browser.mozilla?"":jQuery.CSS.sfx;d[g+"filter"]=d[g+"filter"]||"";b=setUnit(b>jQuery.CSS.filters[a].max?jQuery.CSS.filters[a].max:b,jQuery.CSS.filters[a].unit);d[g+"filter"]+=c+"("+b+") ";delete d[a]}
jQuery.CSS={name:"mb.CSSAnimate",author:"Matteo Bicocchi",version:"2.0.0",transitionEnd:"transitionEnd",sfx:"",filters:{blur:{min:0,max:100,unit:"px"},brightness:{min:0,max:400,unit:"%"},contrast:{min:0,max:400,unit:"%"},grayscale:{min:0,max:100,unit:"%"},hueRotate:{min:0,max:360,unit:"deg"},invert:{min:0,max:100,unit:"%"},saturate:{min:0,max:400,unit:"%"},sepia:{min:0,max:100,unit:"%"}},normalizeCss:function(d){var a=jQuery.extend(!0,{},d);jQuery.browser.webkit||jQuery.browser.opera?jQuery.CSS.sfx=
		"-webkit-":jQuery.browser.mozilla?jQuery.CSS.sfx="-moz-":jQuery.browser.msie&&(jQuery.CSS.sfx="-ms-");jQuery.CSS.sfx="";for(var b in a){"transform"===b&&(a[jQuery.CSS.sfx+"transform"]=a[b],delete a[b]);"transform-origin"===b&&(a[jQuery.CSS.sfx+"transform-origin"]=d[b],delete a[b]);"filter"!==b||jQuery.browser.mozilla||(a[jQuery.CSS.sfx+"filter"]=d[b],delete a[b]);"blur"===b&&setFilter(a,"blur",d[b]);"brightness"===b&&setFilter(a,"brightness",d[b]);"contrast"===b&&setFilter(a,"contrast",d[b]);"grayscale"===
b&&setFilter(a,"grayscale",d[b]);"hueRotate"===b&&setFilter(a,"hueRotate",d[b]);"invert"===b&&setFilter(a,"invert",d[b]);"saturate"===b&&setFilter(a,"saturate",d[b]);"sepia"===b&&setFilter(a,"sepia",d[b]);if("x"===b){var c=jQuery.CSS.sfx+"transform";a[c]=a[c]||"";a[c]+=" translateX("+setUnit(d[b],"px")+")";delete a[b]}"y"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" translateY("+setUnit(d[b],"px")+")",delete a[b]);"z"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" translateZ("+
		setUnit(d[b],"px")+")",delete a[b]);"rotate"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" rotate("+setUnit(d[b],"deg")+")",delete a[b]);"rotateX"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" rotateX("+setUnit(d[b],"deg")+")",delete a[b]);"rotateY"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" rotateY("+setUnit(d[b],"deg")+")",delete a[b]);"rotateZ"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" rotateZ("+setUnit(d[b],"deg")+")",delete a[b]);"scale"===b&&
(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" scale("+setUnit(d[b],"")+")",delete a[b]);"scaleX"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" scaleX("+setUnit(d[b],"")+")",delete a[b]);"scaleY"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" scaleY("+setUnit(d[b],"")+")",delete a[b]);"scaleZ"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" scaleZ("+setUnit(d[b],"")+")",delete a[b]);"skew"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" skew("+setUnit(d[b],
		"deg")+")",delete a[b]);"skewX"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" skewX("+setUnit(d[b],"deg")+")",delete a[b]);"skewY"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" skewY("+setUnit(d[b],"deg")+")",delete a[b]);"perspective"===b&&(c=jQuery.CSS.sfx+"transform",a[c]=a[c]||"",a[c]+=" perspective("+setUnit(d[b],"px")+")",delete a[b])}return a},getProp:function(d){var a=[],b;for(b in d)0>a.indexOf(b)&&a.push(uncamel(b));return a.join(",")},animate:function(d,a,b,c,g){return this.each(function(){function n(){e.called=
		!0;e.CSSAIsRunning=!1;h.off(jQuery.CSS.transitionEnd+"."+e.id);clearTimeout(e.timeout);h.css(jQuery.CSS.sfx+"transition","");"function"==typeof g&&g.apply(e);"function"==typeof e.CSSqueue&&(e.CSSqueue(),e.CSSqueue=null)}var e=this,h=jQuery(this);e.id=e.id||"CSSA_"+(new Date).getTime();var k=k||{type:"noEvent"};if(e.CSSAIsRunning&&e.eventType==k.type&&!jQuery.browser.msie&&9>=jQuery.browser.version)e.CSSqueue=function(){h.CSSAnimate(d,a,b,c,g)};else if(e.CSSqueue=null,e.eventType=k.type,0!==h.length&&
		d){d=jQuery.normalizeCss(d);e.CSSAIsRunning=!0;"function"==typeof a&&(g=a,a=jQuery.fx.speeds._default);"function"==typeof b&&(c=b,b=0);"string"==typeof b&&(g=b,b=0);"function"==typeof c&&(g=c,c="cubic-bezier(0.65,0.03,0.36,0.72)");if("string"==typeof a)for(var l in jQuery.fx.speeds)if(a==l){a=jQuery.fx.speeds[l];break}else a=jQuery.fx.speeds._default;a||(a=jQuery.fx.speeds._default);"string"===typeof g&&(c=g,g=null);if(jQuery.support.CSStransition){var f={"default":"ease","in":"ease-in",out:"ease-out",
	"in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",
	easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};
	f[c]&&(c=f[c]);h.off(jQuery.CSS.transitionEnd+"."+e.id);f=jQuery.CSS.getProp(d);var m={};jQuery.extend(m,d);m[jQuery.CSS.sfx+"transition-property"]=f;m[jQuery.CSS.sfx+"transition-duration"]=a+"ms";m[jQuery.CSS.sfx+"transition-delay"]=b+"ms";m[jQuery.CSS.sfx+"transition-timing-function"]=c;setTimeout(function(){h.one(jQuery.CSS.transitionEnd+"."+e.id,n);h.css(m)},1);e.timeout=setTimeout(function(){e.called||!g?(e.called=!1,e.CSSAIsRunning=!1):(h.css(jQuery.CSS.sfx+"transition",""),g.apply(e),e.CSSAIsRunning=
			!1,"function"==typeof e.CSSqueue&&(e.CSSqueue(),e.CSSqueue=null))},a+b+10)}else{for(f in d)"transform"===f&&delete d[f],"filter"===f&&delete d[f],"transform-origin"===f&&delete d[f],"auto"===d[f]&&delete d[f],"x"===f&&(k=d[f],l="left",d[l]=k,delete d[f]),"y"===f&&(k=d[f],l="top",d[l]=k,delete d[f]),"-ms-transform"!==f&&"-ms-filter"!==f||delete d[f];h.delay(b).animate(d,a,g)}}})}};jQuery.fn.CSSAnimate=jQuery.CSS.animate;jQuery.normalizeCss=jQuery.CSS.normalizeCss;
jQuery.fn.css3=function(d){return this.each(function(){var a=jQuery(this),b=jQuery.normalizeCss(d);a.css(b)})};
;/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.browser.min.js                                                                                                                   _
 _ last modified: 24/05/17 19.56                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2017. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/

var nAgt=navigator.userAgent;jQuery.browser=jQuery.browser||{};jQuery.browser.mozilla=!1;jQuery.browser.webkit=!1;jQuery.browser.opera=!1;jQuery.browser.safari=!1;jQuery.browser.chrome=!1;jQuery.browser.androidStock=!1;jQuery.browser.msie=!1;jQuery.browser.edge=!1;jQuery.browser.ua=nAgt;function isTouchSupported(){var a=nAgt.msMaxTouchPoints,e="ontouchstart"in document.createElement("div");return a||e?!0:!1}
var getOS=function(){var a={version:"Unknown version",name:"Unknown OS"};-1!=navigator.appVersion.indexOf("Win")&&(a.name="Windows");-1!=navigator.appVersion.indexOf("Mac")&&0>navigator.appVersion.indexOf("Mobile")&&(a.name="Mac");-1!=navigator.appVersion.indexOf("Linux")&&(a.name="Linux");/Mac OS X/.test(nAgt)&&!/Mobile/.test(nAgt)&&(a.version=/Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1],a.version=a.version.replace(/_/g,".").substring(0,5));/Windows/.test(nAgt)&&(a.version="Unknown.Unknown");/Windows NT 5.1/.test(nAgt)&&
(a.version="5.1");/Windows NT 6.0/.test(nAgt)&&(a.version="6.0");/Windows NT 6.1/.test(nAgt)&&(a.version="6.1");/Windows NT 6.2/.test(nAgt)&&(a.version="6.2");/Windows NT 10.0/.test(nAgt)&&(a.version="10.0");/Linux/.test(nAgt)&&/Linux/.test(nAgt)&&(a.version="Unknown.Unknown");a.name=a.name.toLowerCase();a.major_version="Unknown";a.minor_version="Unknown";"Unknown.Unknown"!=a.version&&(a.major_version=parseFloat(a.version.split(".")[0]),a.minor_version=parseFloat(a.version.split(".")[1]));return a};
jQuery.browser.os=getOS();jQuery.browser.hasTouch=isTouchSupported();jQuery.browser.name=navigator.appName;jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion);jQuery.browser.majorVersion=parseInt(navigator.appVersion,10);var nameOffset,verOffset,ix;
if(-1!=(verOffset=nAgt.indexOf("Opera")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+6),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8));else if(-1!=(verOffset=nAgt.indexOf("OPR")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+4);else if(-1!=(verOffset=nAgt.indexOf("MSIE")))jQuery.browser.msie=!0,jQuery.browser.name="Microsoft Internet Explorer",
		jQuery.browser.fullVersion=nAgt.substring(verOffset+5);else if(-1!=nAgt.indexOf("Trident")){jQuery.browser.msie=!0;jQuery.browser.name="Microsoft Internet Explorer";var start=nAgt.indexOf("rv:")+3,end=start+4;jQuery.browser.fullVersion=nAgt.substring(start,end)}else-1!=(verOffset=nAgt.indexOf("Edge"))?(jQuery.browser.edge=!0,jQuery.browser.name="Microsoft Edge",jQuery.browser.fullVersion=nAgt.substring(verOffset+5)):-1!=(verOffset=nAgt.indexOf("Chrome"))?(jQuery.browser.webkit=!0,jQuery.browser.chrome=
		!0,jQuery.browser.name="Chrome",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1<nAgt.indexOf("mozilla/5.0")&&-1<nAgt.indexOf("android ")&&-1<nAgt.indexOf("applewebkit")&&!(-1<nAgt.indexOf("chrome"))?(verOffset=nAgt.indexOf("Chrome"),jQuery.browser.webkit=!0,jQuery.browser.androidStock=!0,jQuery.browser.name="androidStock",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1!=(verOffset=nAgt.indexOf("Safari"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name=
		"Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("AppleWebkit"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name="Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("Firefox"))?(jQuery.browser.mozilla=
		!0,jQuery.browser.name="Firefox",jQuery.browser.fullVersion=nAgt.substring(verOffset+8)):(nameOffset=nAgt.lastIndexOf(" ")+1)<(verOffset=nAgt.lastIndexOf("/"))&&(jQuery.browser.name=nAgt.substring(nameOffset,verOffset),jQuery.browser.fullVersion=nAgt.substring(verOffset+1),jQuery.browser.name.toLowerCase()==jQuery.browser.name.toUpperCase()&&(jQuery.browser.name=navigator.appName));
-1!=(ix=jQuery.browser.fullVersion.indexOf(";"))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix));-1!=(ix=jQuery.browser.fullVersion.indexOf(" "))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix));jQuery.browser.majorVersion=parseInt(""+jQuery.browser.fullVersion,10);isNaN(jQuery.browser.majorVersion)&&(jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion),jQuery.browser.majorVersion=parseInt(navigator.appVersion,10));
jQuery.browser.version=jQuery.browser.majorVersion;jQuery.browser.android=/Android/i.test(nAgt);jQuery.browser.blackberry=/BlackBerry|BB|PlayBook/i.test(nAgt);jQuery.browser.ios=/iPhone|iPad|iPod|webOS/i.test(nAgt);jQuery.browser.operaMobile=/Opera Mini/i.test(nAgt);jQuery.browser.windowsMobile=/IEMobile|Windows Phone/i.test(nAgt);jQuery.browser.kindle=/Kindle|Silk/i.test(nAgt);
jQuery.browser.mobile=jQuery.browser.android||jQuery.browser.blackberry||jQuery.browser.ios||jQuery.browser.windowsMobile||jQuery.browser.operaMobile||jQuery.browser.kindle;jQuery.isMobile=jQuery.browser.mobile;jQuery.isTablet=jQuery.browser.mobile&&765<jQuery(window).width();jQuery.isAndroidDefault=jQuery.browser.android&&!/chrome/i.test(nAgt);jQuery.mbBrowser=jQuery.browser;
jQuery.browser.versionCompare=function(a,e){if("stringstring"!=typeof a+typeof e)return!1;for(var c=a.split("."),d=e.split("."),b=0,f=Math.max(c.length,d.length);b<f;b++){if(c[b]&&!d[b]&&0<parseInt(c[b])||parseInt(c[b])>parseInt(d[b]))return 1;if(d[b]&&!c[b]&&0<parseInt(d[b])||parseInt(c[b])<parseInt(d[b]))return-1}return 0};
;/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.simpleSlider.min.js                                                                                                              _
 _ last modified: 09/05/17 19.31                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2017. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/


var nAgt=navigator.userAgent;jQuery.browser=jQuery.browser||{};jQuery.browser.mozilla=!1;jQuery.browser.webkit=!1;jQuery.browser.opera=!1;jQuery.browser.safari=!1;jQuery.browser.chrome=!1;jQuery.browser.androidStock=!1;jQuery.browser.msie=!1;jQuery.browser.edge=!1;jQuery.browser.ua=nAgt;function isTouchSupported(){var a=nAgt.msMaxTouchPoints,e="ontouchstart"in document.createElement("div");return a||e?!0:!1}
var getOS=function(){var a={version:"Unknown version",name:"Unknown OS"};-1!=navigator.appVersion.indexOf("Win")&&(a.name="Windows");-1!=navigator.appVersion.indexOf("Mac")&&0>navigator.appVersion.indexOf("Mobile")&&(a.name="Mac");-1!=navigator.appVersion.indexOf("Linux")&&(a.name="Linux");/Mac OS X/.test(nAgt)&&!/Mobile/.test(nAgt)&&(a.version=/Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1],a.version=a.version.replace(/_/g,".").substring(0,5));/Windows/.test(nAgt)&&(a.version="Unknown.Unknown");/Windows NT 5.1/.test(nAgt)&&
(a.version="5.1");/Windows NT 6.0/.test(nAgt)&&(a.version="6.0");/Windows NT 6.1/.test(nAgt)&&(a.version="6.1");/Windows NT 6.2/.test(nAgt)&&(a.version="6.2");/Windows NT 10.0/.test(nAgt)&&(a.version="10.0");/Linux/.test(nAgt)&&/Linux/.test(nAgt)&&(a.version="Unknown.Unknown");a.name=a.name.toLowerCase();a.major_version="Unknown";a.minor_version="Unknown";"Unknown.Unknown"!=a.version&&(a.major_version=parseFloat(a.version.split(".")[0]),a.minor_version=parseFloat(a.version.split(".")[1]));return a};
jQuery.browser.os=getOS();jQuery.browser.hasTouch=isTouchSupported();jQuery.browser.name=navigator.appName;jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion);jQuery.browser.majorVersion=parseInt(navigator.appVersion,10);var nameOffset,verOffset,ix;
if(-1!=(verOffset=nAgt.indexOf("Opera")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+6),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8));else if(-1!=(verOffset=nAgt.indexOf("OPR")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+4);else if(-1!=(verOffset=nAgt.indexOf("MSIE")))jQuery.browser.msie=!0,jQuery.browser.name="Microsoft Internet Explorer",
		jQuery.browser.fullVersion=nAgt.substring(verOffset+5);else if(-1!=nAgt.indexOf("Trident")){jQuery.browser.msie=!0;jQuery.browser.name="Microsoft Internet Explorer";var start=nAgt.indexOf("rv:")+3,end=start+4;jQuery.browser.fullVersion=nAgt.substring(start,end)}else-1!=(verOffset=nAgt.indexOf("Edge"))?(jQuery.browser.edge=!0,jQuery.browser.name="Microsoft Edge",jQuery.browser.fullVersion=nAgt.substring(verOffset+5)):-1!=(verOffset=nAgt.indexOf("Chrome"))?(jQuery.browser.webkit=!0,jQuery.browser.chrome=
		!0,jQuery.browser.name="Chrome",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1<nAgt.indexOf("mozilla/5.0")&&-1<nAgt.indexOf("android ")&&-1<nAgt.indexOf("applewebkit")&&!(-1<nAgt.indexOf("chrome"))?(verOffset=nAgt.indexOf("Chrome"),jQuery.browser.webkit=!0,jQuery.browser.androidStock=!0,jQuery.browser.name="androidStock",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1!=(verOffset=nAgt.indexOf("Safari"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name=
		"Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("AppleWebkit"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name="Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("Firefox"))?(jQuery.browser.mozilla=
		!0,jQuery.browser.name="Firefox",jQuery.browser.fullVersion=nAgt.substring(verOffset+8)):(nameOffset=nAgt.lastIndexOf(" ")+1)<(verOffset=nAgt.lastIndexOf("/"))&&(jQuery.browser.name=nAgt.substring(nameOffset,verOffset),jQuery.browser.fullVersion=nAgt.substring(verOffset+1),jQuery.browser.name.toLowerCase()==jQuery.browser.name.toUpperCase()&&(jQuery.browser.name=navigator.appName));
-1!=(ix=jQuery.browser.fullVersion.indexOf(";"))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix));-1!=(ix=jQuery.browser.fullVersion.indexOf(" "))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix));jQuery.browser.majorVersion=parseInt(""+jQuery.browser.fullVersion,10);isNaN(jQuery.browser.majorVersion)&&(jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion),jQuery.browser.majorVersion=parseInt(navigator.appVersion,10));
jQuery.browser.version=jQuery.browser.majorVersion;jQuery.browser.android=/Android/i.test(nAgt);jQuery.browser.blackberry=/BlackBerry|BB|PlayBook/i.test(nAgt);jQuery.browser.ios=/iPhone|iPad|iPod|webOS/i.test(nAgt);jQuery.browser.operaMobile=/Opera Mini/i.test(nAgt);jQuery.browser.windowsMobile=/IEMobile|Windows Phone/i.test(nAgt);jQuery.browser.kindle=/Kindle|Silk/i.test(nAgt);
jQuery.browser.mobile=jQuery.browser.android||jQuery.browser.blackberry||jQuery.browser.ios||jQuery.browser.windowsMobile||jQuery.browser.operaMobile||jQuery.browser.kindle;jQuery.isMobile=jQuery.browser.mobile;jQuery.isTablet=jQuery.browser.mobile&&765<jQuery(window).width();jQuery.isAndroidDefault=jQuery.browser.android&&!/chrome/i.test(nAgt);jQuery.mbBrowser=jQuery.browser;
jQuery.browser.versionCompare=function(a,e){if("stringstring"!=typeof a+typeof e)return!1;for(var c=a.split("."),d=e.split("."),b=0,f=Math.max(c.length,d.length);b<f;b++){if(c[b]&&!d[b]&&0<parseInt(c[b])||parseInt(c[b])>parseInt(d[b]))return 1;if(d[b]&&!c[b]&&0<parseInt(d[b])||parseInt(c[b])<parseInt(d[b]))return-1}return 0};

(function(b){b.simpleSlider={defaults:{initialval:0,scale:100,orientation:"h",readonly:!1,callback:!1},events:{start:b.browser.mobile?"touchstart":"mousedown",end:b.browser.mobile?"touchend":"mouseup",move:b.browser.mobile?"touchmove":"mousemove"},init:function(c){return this.each(function(){var a=this,d=b(a);d.addClass("simpleSlider");a.opt={};b.extend(a.opt,b.simpleSlider.defaults,c);b.extend(a.opt,d.data());var e="h"==a.opt.orientation?"horizontal":"vertical";e=b("<div/>").addClass("level").addClass(e);
	d.prepend(e);a.level=e;d.css({cursor:"default"});"auto"==a.opt.scale&&(a.opt.scale=b(a).outerWidth());d.updateSliderVal();a.opt.readonly||(d.on(b.simpleSlider.events.start,function(c){b.browser.mobile&&(c=c.changedTouches[0]);a.canSlide=!0;d.updateSliderVal(c);"h"==a.opt.orientation?d.css({cursor:"col-resize"}):d.css({cursor:"row-resize"});b.browser.mobile||(c.preventDefault(),c.stopPropagation())}),b(document).on(b.simpleSlider.events.move,function(c){b.browser.mobile&&(c=c.changedTouches[0]);a.canSlide&&
	(b(document).css({cursor:"default"}),d.updateSliderVal(c),b.browser.mobile||(c.preventDefault(),c.stopPropagation()))}).on(b.simpleSlider.events.end,function(){b(document).css({cursor:"auto"});a.canSlide=!1;d.css({cursor:"auto"})}))})},updateSliderVal:function(c){var a=this.get(0);if(a.opt){a.opt.initialval="number"==typeof a.opt.initialval?a.opt.initialval:a.opt.initialval(a);var d=b(a).outerWidth(),e=b(a).outerHeight();a.x="object"==typeof c?c.clientX+document.body.scrollLeft-this.offset().left:
				"number"==typeof c?c*d/a.opt.scale:a.opt.initialval*d/a.opt.scale;a.y="object"==typeof c?c.clientY+document.body.scrollTop-this.offset().top:"number"==typeof c?(a.opt.scale-a.opt.initialval-c)*e/a.opt.scale:a.opt.initialval*e/a.opt.scale;a.y=this.outerHeight()-a.y;a.scaleX=a.x*a.opt.scale/d;a.scaleY=a.y*a.opt.scale/e;a.outOfRangeX=a.scaleX>a.opt.scale?a.scaleX-a.opt.scale:0>a.scaleX?a.scaleX:0;a.outOfRangeY=a.scaleY>a.opt.scale?a.scaleY-a.opt.scale:0>a.scaleY?a.scaleY:0;a.outOfRange="h"==a.opt.orientation?
		a.outOfRangeX:a.outOfRangeY;a.value="undefined"!=typeof c?"h"==a.opt.orientation?a.x>=this.outerWidth()?a.opt.scale:0>=a.x?0:a.scaleX:a.y>=this.outerHeight()?a.opt.scale:0>=a.y?0:a.scaleY:"h"==a.opt.orientation?a.scaleX:a.scaleY;"h"==a.opt.orientation?a.level.width(Math.floor(100*a.x/d)+"%"):a.level.height(Math.floor(100*a.y/e));"function"==typeof a.opt.callback&&a.opt.callback(a)}}};b.fn.simpleSlider=b.simpleSlider.init;b.fn.updateSliderVal=b.simpleSlider.updateSliderVal})(jQuery);
;/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.storage.min.js                                                                                                                   _
 _ last modified: 24/05/15 16.08                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2015. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/

(function(d){d.mbCookie={set:function(a,c,f,b){"object"==typeof c&&(c=JSON.stringify(c));b=b?"; domain="+b:"";var e=new Date,d="";0<f&&(e.setTime(e.getTime()+864E5*f),d="; expires="+e.toGMTString());document.cookie=a+"="+c+d+"; path=/"+b},get:function(a){a+="=";for(var c=document.cookie.split(";"),d=0;d<c.length;d++){for(var b=c[d];" "==b.charAt(0);)b=b.substring(1,b.length);if(0==b.indexOf(a))try{return JSON.parse(b.substring(a.length,b.length))}catch(e){return b.substring(a.length,b.length)}}return null},
	remove:function(a){d.mbCookie.set(a,"",-1)}};d.mbStorage={set:function(a,c){"object"==typeof c&&(c=JSON.stringify(c));localStorage.setItem(a,c)},get:function(a){if(localStorage[a])try{return JSON.parse(localStorage[a])}catch(c){return localStorage[a]}else return null},remove:function(a){a?localStorage.removeItem(a):localStorage.clear()}}})(jQuery);
/*jquery.mb.YTPlayer 13-04-2018
 _ jquery.mb.components 
 _ email: matteo@open-lab.com 
 _ Copyright (c) 2001-2018. Matteo Bicocchi (Pupunzi); 
 _ blog: http://pupunzi.open-lab.com 
 _ Open Lab s.r.l., Florence - Italy 
 */
function onYouTubeIframeAPIReady(){ytp.YTAPIReady||(ytp.YTAPIReady=!0,jQuery(document).trigger("YTAPIReady"))}function uncamel(a){return a.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()})}function setUnit(a,b){return"string"!=typeof a||a.match(/^[\-0-9\.]+jQuery/)?""+a+b:a}function setFilter(a,b,c){var d=uncamel(b),e=jQuery.browser.mozilla?"":jQuery.CSS.sfx;a[e+"filter"]=a[e+"filter"]||"",c=setUnit(c>jQuery.CSS.filters[b].max?jQuery.CSS.filters[b].max:c,jQuery.CSS.filters[b].unit),a[e+"filter"]+=d+"("+c+") ",delete a[b]}function isTouchSupported(){var a=nAgt.msMaxTouchPoints,b="ontouchstart"in document.createElement("div");return!(!a&&!b)}function isTouchSupported(){var a=nAgt.msMaxTouchPoints,b="ontouchstart"in document.createElement("div");return!(!a&&!b)}var ytp=ytp||{},getYTPVideoID=function(a){var b,c;return a.indexOf("youtu.be")>0?(b=a.substr(a.lastIndexOf("/")+1,a.length),c=b.indexOf("?list=")>0?b.substr(b.lastIndexOf("="),b.length):null,b=c?b.substr(0,b.lastIndexOf("?")):b):a.indexOf("http")>-1?(b=a.match(/[\\?&]v=([^&#]*)/)[1],c=a.indexOf("list=")>0?a.match(/[\\?&]list=([^&#]*)/)[1]:null):(b=a.length>15?null:a,c=b?null:a),{videoID:b,playlistID:c}};!function(jQuery,ytp){jQuery.mbYTPlayer={name:"jquery.mb.YTPlayer",version:"3.2.1",build:"7091",author:"Matteo Bicocchi (pupunzi)",apiKey:"",defaults:{containment:"body",ratio:"auto",videoURL:null,startAt:0,stopAt:0,autoPlay:!0,vol:50,addRaster:!1,mask:!1,opacity:1,quality:"default",mute:!1,loop:!0,fadeOnStartTime:1500,showControls:!0,showAnnotations:!1,cc_load_policy:!1,showYTLogo:!0,stopMovieOnBlur:!0,realfullscreen:!0,abundance:.2,coverImage:!1,useOnMobile:!0,mobileFallbackImage:null,gaTrack:!0,optimizeDisplay:!0,remember_last_time:!1,playOnlyIfVisible:!1,anchor:"center,center",addFilters:null,onReady:function(a){},onError:function(a,b){}},controls:{play:"P",pause:"p",mute:"M",unmute:"A",onlyYT:"O",showSite:"R",ytLogo:"Y"},controlBar:null,locationProtocol:"https:",defaultFilters:{grayscale:{value:0,unit:"%"},hue_rotate:{value:0,unit:"deg"},invert:{value:0,unit:"%"},opacity:{value:0,unit:"%"},saturate:{value:0,unit:"%"},sepia:{value:0,unit:"%"},brightness:{value:0,unit:"%"},contrast:{value:0,unit:"%"},blur:{value:0,unit:"px"}},buildPlayer:function(options){function isIframe(){var a=!1;try{self.location.href!=top.location.href&&(a=!0)}catch(b){a=!0}return a}if(ytp.YTAPIReady||"undefined"!=typeof window.YT)setTimeout(function(){jQuery(document).trigger("YTAPIReady"),ytp.YTAPIReady=!0},100);else{jQuery("#YTAPI").remove();var tag=jQuery("<script></script>").attr({src:jQuery.mbYTPlayer.locationProtocol+"//www.youtube.com/iframe_api?v="+jQuery.mbYTPlayer.version,id:"YTAPI"});jQuery("head").prepend(tag)}return this.each(function(){var YTPlayer=this,$YTPlayer=jQuery(YTPlayer);$YTPlayer.hide(),YTPlayer.loop=0,YTPlayer.state=0,YTPlayer.filters=jQuery.extend(!0,{},jQuery.mbYTPlayer.defaultFilters),YTPlayer.filtersEnabled=!0,YTPlayer.id=YTPlayer.id||"YTP_"+(new Date).getTime(),$YTPlayer.addClass("mb_YTPlayer");var property=$YTPlayer.data("property")&&"string"==typeof $YTPlayer.data("property")?eval("("+$YTPlayer.data("property")+")"):$YTPlayer.data("property");"object"!=typeof property&&(property={}),YTPlayer.opt=jQuery.mbYTPlayer.defaults,jQuery.extend(YTPlayer.opt,options,property),YTPlayer.opt.elementId=YTPlayer.id,0===YTPlayer.opt.vol&&(YTPlayer.opt.vol=1,YTPlayer.opt.mute=!0),YTPlayer.opt.loop&&"boolean"==typeof YTPlayer.opt.loop&&(YTPlayer.opt.loop=9999),YTPlayer.opt.realfullscreen=isIframe()?!1:YTPlayer.opt.realfullscreen,YTPlayer.opt.showAnnotations=YTPlayer.opt.showAnnotations?"1":"3",YTPlayer.opt.cc_load_policy=YTPlayer.opt.cc_load_policy?"1":"0",YTPlayer.opt.coverImage=YTPlayer.opt.coverImage||YTPlayer.opt.backgroundImage,jQuery.mbBrowser.msie&&jQuery.mbBrowser.version<9&&(YTPlayer.opt.opacity=1),YTPlayer.opt.containment="self"===YTPlayer.opt.containment?$YTPlayer:jQuery(YTPlayer.opt.containment),YTPlayer.isRetina=window.retina||window.devicePixelRatio>1,$YTPlayer.attr("id")||$YTPlayer.attr("id","ytp_"+(new Date).getTime()),YTPlayer.playerID="iframe_"+YTPlayer.id,YTPlayer.isAlone=!1,YTPlayer.hasFocus=!0,YTPlayer.videoID=YTPlayer.opt.videoURL?getYTPVideoID(YTPlayer.opt.videoURL).videoID:$YTPlayer.attr("href")?getYTPVideoID($YTPlayer.attr("href")).videoID:!1,YTPlayer.playlistID=YTPlayer.opt.videoURL?getYTPVideoID(YTPlayer.opt.videoURL).playlistID:$YTPlayer.attr("href")?getYTPVideoID($YTPlayer.attr("href")).playlistID:!1;var start_from_last=0;if(jQuery.mbCookie.get("YTPlayer_start_from"+YTPlayer.videoID)&&(start_from_last=parseFloat(jQuery.mbCookie.get("YTPlayer_start_from"+YTPlayer.videoID))),YTPlayer.opt.remember_last_time&&start_from_last&&(YTPlayer.start_from_last=start_from_last,jQuery.mbCookie.remove("YTPlayer_start_from"+YTPlayer.videoID)),YTPlayer.isPlayer=$YTPlayer.is(YTPlayer.opt.containment),YTPlayer.isBackground=YTPlayer.opt.containment.is("body"),!YTPlayer.isBackground||!ytp.backgroundIsInited){YTPlayer.isPlayer&&$YTPlayer.show(),YTPlayer.overlay=jQuery("<div/>").css({position:"absolute",top:0,left:0,width:"100%",height:"100%"}).addClass("YTPOverlay"),YTPlayer.isPlayer&&YTPlayer.overlay.on("click",function(){$YTPlayer.YTPTogglePlay()}),YTPlayer.wrapper=jQuery("<div/>").addClass("mbYTP_wrapper").attr("id","wrapper_"+YTPlayer.id),YTPlayer.wrapper.css({position:"absolute",zIndex:0,minWidth:"100%",minHeight:"100%",left:0,top:0,overflow:"hidden",opacity:0});var playerBox=jQuery("<div/>").attr("id",YTPlayer.playerID).addClass("playerBox");if(playerBox.css({position:"absolute",zIndex:0,width:"100%",height:"100%",top:0,left:0,overflow:"hidden",opacity:1}),YTPlayer.wrapper.append(playerBox),playerBox.after(YTPlayer.overlay),YTPlayer.isPlayer&&(YTPlayer.inlineWrapper=jQuery("<div/>").addClass("inline-YTPlayer"),YTPlayer.inlineWrapper.css({position:"relative",maxWidth:YTPlayer.opt.containment.css("width")}),YTPlayer.opt.containment.css({position:"relative",paddingBottom:"56.25%",overflow:"hidden",height:0}),YTPlayer.opt.containment.wrap(YTPlayer.inlineWrapper)),YTPlayer.opt.containment.children().not("script, style").each(function(){"static"==jQuery(this).css("position")&&jQuery(this).css("position","relative")}),YTPlayer.isBackground?(jQuery("body").css({boxSizing:"border-box"}),YTPlayer.wrapper.css({position:"fixed",top:0,left:0,zIndex:0})):"static"==YTPlayer.opt.containment.css("position")&&(YTPlayer.opt.containment.css({position:"relative"}),$YTPlayer.show()),YTPlayer.opt.containment.prepend(YTPlayer.wrapper),YTPlayer.isBackground||YTPlayer.overlay.on("mouseenter",function(){YTPlayer.controlBar&&YTPlayer.controlBar.length&&YTPlayer.controlBar.addClass("visible")}).on("mouseleave",function(){YTPlayer.controlBar&&YTPlayer.controlBar.length&&YTPlayer.controlBar.removeClass("visible")}),jQuery.mbBrowser.mobile&&!YTPlayer.opt.useOnMobile)return YTPlayer.opt.mobileFallbackImage&&(YTPlayer.wrapper.css({backgroundImage:"url("+YTPlayer.opt.mobileFallbackImage+")",backgroundPosition:"center center",backgroundSize:"cover",backgroundRepeat:"no-repeat",opacity:1}),YTPlayer.wrapper.css({opacity:1})),$YTPlayer;jQuery.mbBrowser.mobile&&YTPlayer.opt.autoPlay&&YTPlayer.opt.useOnMobile&&jQuery("body").one("touchstart",function(){YTPlayer.player.playVideo()}),jQuery(document).one("YTAPIReady",function(){$YTPlayer.trigger("YTAPIReady_"+YTPlayer.id),ytp.YTAPIReady=!0}),YTPlayer.isOnScreen=jQuery.mbYTPlayer.isOnScreen(YTPlayer),$YTPlayer.one("YTAPIReady_"+YTPlayer.id,function(){var a=this,b=jQuery(a);a.isBackground&&ytp.backgroundIsInited||a.isInit||(a.isBackground&&(ytp.backgroundIsInited=!0),a.opt.autoPlay="undefined"==typeof a.opt.autoPlay?!!a.isBackground:a.opt.autoPlay,a.opt.vol=a.opt.vol?a.opt.vol:100,jQuery.mbYTPlayer.getDataFromAPI(a),jQuery(a).on("YTPChanged",function(c){if(!a.isInit){a.isInit=!0;var d={modestbranding:1,autoplay:0,controls:0,showinfo:0,rel:0,enablejsapi:1,version:3,playerapiid:a.playerID,origin:"*",allowfullscreen:!0,wmode:"transparent",iv_load_policy:a.opt.showAnnotations,cc_load_policy:a.opt.cc_load_policy,playsinline:jQuery.browser.mobile?1:0,html5:document.createElement("video").canPlayType?1:0};new YT.Player(a.playerID,{playerVars:d,events:{onReady:function(c){a.player=c.target,a.player.loadVideoById({videoId:a.videoID.toString(),suggestedQuality:a.opt.quality}),b.trigger("YTPlayerIsReady_"+a.id)},onStateChange:function(b){if("function"==typeof b.target.getPlayerState){var c=b.target.getPlayerState();if(a.preventTrigger)return void(a.preventTrigger=!1);a.state=c;var d;switch(c){case-1:d="YTPUnstarted";break;case 0:d="YTPRealEnd";break;case 1:d="YTPPlay",a.controlBar.length&&a.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.pause);break;case 2:d="YTPPause",a.controlBar.length&&a.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);break;case 3:a.player.setPlaybackQuality(a.opt.quality),d="YTPBuffering",a.controlBar.length&&a.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);break;case 5:d="YTPCued"}var e=jQuery.Event(d);e.time=a.currentTime,a.preventTrigger||jQuery(a).trigger(e)}},onPlaybackQualityChange:function(b){var c=b.target.getPlaybackQuality(),d=jQuery.Event("YTPQualityChange");d.quality=c,jQuery(a).trigger(d)},onError:function(c){switch("function"==typeof a.opt.onError&&a.opt.onError(b,c),c.data){case 2:console.error("video ID:: "+a.videoID+": The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.");break;case 5:console.error("video ID:: "+a.videoID+": The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.");break;case 100:console.error("video ID:: "+a.videoID+": The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.");break;case 101:case 150:console.error("video ID:: "+a.videoID+": The owner of the requested video does not allow it to be played in embedded players.")}a.isList&&jQuery(a).YTPPlayNext()}}}),b.on("YTPlayerIsReady_"+a.id,function(){return a.isReady?this:(a.playerEl=a.player.getIframe(),jQuery(a.playerEl).unselectable(),b.optimizeDisplay(),jQuery(window).off("resize.YTP_"+a.id).on("resize.YTP_"+a.id,function(){b.optimizeDisplay()}),a.opt.remember_last_time&&jQuery(window).on("unload.YTP_"+a.id,function(){var b=a.player.getCurrentTime();jQuery.mbCookie.set("YTPlayer_start_from"+a.videoID,b,0)}),void b.YTPCheckForState())})}}))}),$YTPlayer.off("YTPTime.mask"),jQuery.mbYTPlayer.applyMask(YTPlayer)}})},isOnScreen:function(a){var b=a.wrapper,c=jQuery(window).scrollTop(),d=c+jQuery(window).height(),e=b.offset().top+b.height()/1.2,f=b.offset().top+b.height()/2.8;return d>=f&&e>=c},getDataFromAPI:function(a){if(a.videoData=jQuery.mbStorage.get("YTPlayer_data_"+a.videoID),jQuery(a).off("YTPData.YTPlayer").on("YTPData.YTPlayer",function(){if(a.hasData&&a.isPlayer&&!a.opt.autoPlay){var b="false"!=a.opt.coverImage?a.opt.coverImage:a.videoData.thumb_max||a.videoData.thumb_high||a.videoData.thumb_medium;a.opt.containment.css({background:"rgba(0,0,0,0.5) url("+b+") center center",backgroundSize:"cover"})}}),a.videoData)setTimeout(function(){a.opt.ratio="auto"==a.opt.ratio?16/9:a.opt.ratio,a.dataReceived=!0;var b=jQuery.Event("YTPChanged");b.time=a.currentTime,b.videoId=a.videoID,b.opt=a.opt,jQuery(a).trigger(b);var c=jQuery.Event("YTPData");c.prop={};for(var d in a.videoData)c.prop[d]=a.videoData[d];jQuery(a).trigger(c)},a.opt.fadeOnStartTime),a.hasData=!0;else if(jQuery.mbYTPlayer.apiKey)jQuery.getJSON(jQuery.mbYTPlayer.locationProtocol+"//www.googleapis.com/youtube/v3/videos?id="+a.videoID+"&key="+jQuery.mbYTPlayer.apiKey+"&part=snippet",function(b){function c(b){a.videoData={},a.videoData.id=a.videoID,a.videoData.channelTitle=b.channelTitle,a.videoData.title=b.title,a.videoData.description=b.description.length<400?b.description:b.description.substring(0,400)+" ...",a.videoData.aspectratio="auto"==a.opt.ratio?16/9:a.opt.ratio,a.opt.ratio=a.videoData.aspectratio,a.videoData.thumb_max=b.thumbnails.maxres?b.thumbnails.maxres.url:null,a.videoData.thumb_high=b.thumbnails.high?b.thumbnails.high.url:null,a.videoData.thumb_medium=b.thumbnails.medium?b.thumbnails.medium.url:null,jQuery.mbStorage.set("YTPlayer_data_"+a.videoID,a.videoData)}a.dataReceived=!0;var d=jQuery.Event("YTPChanged");d.time=a.currentTime,d.videoId=a.videoID,jQuery(a).trigger(d),b.items[0]?(c(b.items[0].snippet),a.hasData=!0):(a.videoData={},a.hasData=!1);var e=jQuery.Event("YTPData");e.prop={};for(var f in a.videoData)e.prop[f]=a.videoData[f];jQuery(a).trigger(e)});else{if(setTimeout(function(){var b=jQuery.Event("YTPChanged");b.time=a.currentTime,b.videoId=a.videoID,jQuery(a).trigger(b)},50),!a.opt.autoPlay){var b="false"!=a.opt.coverImage?a.opt.coverImage:jQuery.mbYTPlayer.locationProtocol+"//i.ytimg.com/vi/"+a.videoID+"/maxresdefault.jpg";b&&a.opt.containment.css({background:"rgba(0,0,0,0.5) url("+b+") center center",backgroundSize:"cover"})}a.videoData=null,a.opt.ratio="auto"==a.opt.ratio?"16/9":a.opt.ratio}a.isPlayer&&!a.opt.autoPlay&&(a.loading=jQuery("<div/>").addClass("loading").html("Loading").hide(),jQuery(a).append(a.loading),a.loading.fadeIn())},removeStoredData:function(){jQuery.mbStorage.remove()},getVideoData:function(){var a=this.get(0);return a.videoData},getVideoID:function(){var a=this.get(0);return a.videoID||!1},getPlaylistID:function(){var a=this.get(0);return a.playlistID||!1},setVideoQuality:function(a){var b=this.get(0);return b.player.setPlaybackQuality(a),this},playlist:function(a,b,c){function d(h,i){i=i||"";var j="https://www.googleapis.com/youtube/v3/playlistItems";jQuery.getJSON(j,{part:"snippet,contentDetails",playlistId:h,maxResults:50,pageToken:i,key:jQuery.mbYTPlayer.apiKey}).done(function(h){e(h),h.nextPageToken?(i=h.nextPageToken,d(plID,i,a)):f.YTPlaylist(g.videos,b,c)})}function e(a){for(var b=a.items.length,c=0;b>c;c++)g.videos.push({videoURL:a.items[c].contentDetails.videoId})}var f=this,g=f.get(0);return"String"==typeof a&&""!=jQuery.mbYTPlayer.apiKey?(d(a),this):(g.isList=!0,b&&(a=jQuery.shuffle(a)),g.videoID||(g.videos=a,g.videoCounter=1,g.videoLength=a.length,jQuery(g).data("property",a[0]),jQuery(g).YTPlayer()),"function"==typeof c&&jQuery(g).one("YTPChanged",function(){c(g)}),jQuery(g).on("YTPEnd",function(){jQuery(g).YTPPlayNext()}),this)},playNext:function(){var a=this.get(0);return a.videoCounter++,a.videoCounter>a.videoLength&&(a.videoCounter=1),jQuery(a).YTPPlayIndex(a.videoCounter),this},playPrev:function(){var a=this.get(0);return a.videoCounter--,a.videoCounter<=0&&(a.videoCounter=a.videoLength),jQuery(a).YTPPlayIndex(a.videoCounter),this},playIndex:function(a){var b=this.get(0);b.checkForStartAt&&(clearInterval(b.checkForStartAt),clearInterval(b.getState)),b.videoCounter=a,b.videoCounter>=b.videoLength&&(b.videoCounter=b.videoLength);var c=b.videos[b.videoCounter-1];return jQuery(b).YTPChangeVideo(c),this},changeVideo:function(a){var b=this,c=b.get(0);c.opt.startAt=0,c.opt.stopAt=0,c.opt.mask=!1,c.opt.mute=!0,c.opt.autoPlay=!0,c.opt.addFilters=!1,c.opt.coverImage=!1,c.hasData=!1,c.hasChanged=!0,c.player.loopTime=void 0,a&&jQuery.extend(c.opt,a),c.videoID=getYTPVideoID(c.opt.videoURL).videoID,c.opt.loop&&"boolean"==typeof c.opt.loop&&(c.opt.loop=9999),c.wrapper.css({background:"none"}),jQuery(c.playerEl).CSSAnimate({opacity:0},c.opt.fadeOnStartTime,function(){jQuery.mbYTPlayer.getDataFromAPI(c),b.YTPGetPlayer().loadVideoById({videoId:c.videoID,suggestedQuality:c.opt.quality}),b.YTPPause(),b.optimizeDisplay(),b.YTPCheckForState()});var d=jQuery.Event("YTPChangeVideo");return d.time=c.currentTime,jQuery(c).trigger(d),jQuery.mbYTPlayer.applyMask(c),this},getPlayer:function(){return jQuery(this).get(0).player},playerDestroy:function(){var a=this.get(0);return ytp.YTAPIReady=!0,ytp.backgroundIsInited=!1,a.isInit=!1,a.videoID=null,a.isReady=!1,a.wrapper.remove(),jQuery("#controlBar_"+a.id).remove(),clearInterval(a.checkForStartAt),clearInterval(a.getState),this},fullscreen:function(real){function hideMouse(){YTPlayer.overlay.css({cursor:"none"})}function RunPrefixMethod(a,b){for(var c,d,e=["webkit","moz","ms","o",""],f=0;f<e.length&&!a[c];){if(c=b,""==e[f]&&(c=c.substr(0,1).toLowerCase()+c.substr(1)),c=e[f]+c,d=typeof a[c],"undefined"!=d)return e=[e[f]],"function"==d?a[c]():a[c];f++}}function launchFullscreen(a){RunPrefixMethod(a,"RequestFullScreen")}function cancelFullscreen(){(RunPrefixMethod(document,"FullScreen")||RunPrefixMethod(document,"IsFullScreen"))&&RunPrefixMethod(document,"CancelFullScreen")}var YTPlayer=this.get(0);"undefined"==typeof real&&(real=YTPlayer.opt.realfullscreen),real=eval(real);var controls=jQuery("#controlBar_"+YTPlayer.id),fullScreenBtn=controls.find(".mb_OnlyYT"),videoWrapper=YTPlayer.isPlayer?YTPlayer.opt.containment:YTPlayer.wrapper;if(real){var fullscreenchange=jQuery.mbBrowser.mozilla?"mozfullscreenchange":jQuery.mbBrowser.webkit?"webkitfullscreenchange":"fullscreenchange";jQuery(document).off(fullscreenchange).on(fullscreenchange,function(){var a=RunPrefixMethod(document,"IsFullScreen")||RunPrefixMethod(document,"FullScreen");a?(jQuery(YTPlayer).YTPSetVideoQuality("default"),jQuery(YTPlayer).trigger("YTPFullScreenStart")):(YTPlayer.isAlone=!1,fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT),jQuery(YTPlayer).YTPSetVideoQuality(YTPlayer.opt.quality),videoWrapper.removeClass("YTPFullscreen"),videoWrapper.CSSAnimate({opacity:YTPlayer.opt.opacity},YTPlayer.opt.fadeOnStartTime),videoWrapper.css({zIndex:0}),YTPlayer.isBackground?jQuery("body").after(controls):YTPlayer.wrapper.before(controls),jQuery(window).resize(),jQuery(YTPlayer).trigger("YTPFullScreenEnd"))})}return YTPlayer.isAlone?(jQuery(document).off("mousemove.YTPlayer"),clearTimeout(YTPlayer.hideCursor),YTPlayer.overlay.css({cursor:"auto"}),real?cancelFullscreen():(videoWrapper.CSSAnimate({opacity:YTPlayer.opt.opacity},YTPlayer.opt.fadeOnStartTime),videoWrapper.css({zIndex:0})),fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT),YTPlayer.isAlone=!1):(jQuery(document).on("mousemove.YTPlayer",function(a){YTPlayer.overlay.css({cursor:"auto"}),clearTimeout(YTPlayer.hideCursor),jQuery(a.target).parents().is(".mb_YTPBar")||(YTPlayer.hideCursor=setTimeout(hideMouse,3e3))}),hideMouse(),real?(videoWrapper.css({opacity:0}),videoWrapper.addClass("YTPFullscreen"),launchFullscreen(videoWrapper.get(0)),setTimeout(function(){videoWrapper.CSSAnimate({opacity:1},2*YTPlayer.opt.fadeOnStartTime),videoWrapper.append(controls),jQuery(YTPlayer).optimizeDisplay(),YTPlayer.player.seekTo(YTPlayer.player.getCurrentTime()+.1,!0)},YTPlayer.opt.fadeOnStartTime)):videoWrapper.css({zIndex:1e4}).CSSAnimate({opacity:1},2*YTPlayer.opt.fadeOnStartTime),fullScreenBtn.html(jQuery.mbYTPlayer.controls.showSite),YTPlayer.isAlone=!0),this},toggleLoops:function(){var a=this.get(0),b=a.opt;return 1==b.loop?b.loop=0:(b.startAt?a.player.seekTo(b.startAt):a.player.playVideo(),b.loop=1),this},play:function(){var a=this.get(0);if(!a.isReady)return this;a.player.playVideo(),jQuery(a.playerEl).css({opacity:1}),a.wrapper.css({backgroundImage:"none"}),a.wrapper.CSSAnimate({opacity:a.isAlone?1:a.opt.opacity},a.opt.fadeOnStartTime);var b=jQuery("#controlBar_"+a.id),c=b.find(".mb_YTPPlaypause");return c.html(jQuery.mbYTPlayer.controls.pause),a.state=1,a.orig_background=jQuery(a).css("background-image"),this},togglePlay:function(a){var b=this.get(0);return 1==b.state?this.YTPPause():this.YTPPlay(),"function"==typeof a&&a(b.state),this},stop:function(){var a=this.get(0),b=jQuery("#controlBar_"+a.id),c=b.find(".mb_YTPPlaypause");return c.html(jQuery.mbYTPlayer.controls.play),a.player.stopVideo(),this},pause:function(){var a=this.get(0);return a.player.pauseVideo(),a.state=2,this},seekTo:function(a){var b=this.get(0);return b.player.seekTo(a,!0),this},setVolume:function(a){var b=this.get(0);return a||b.opt.vol||0!=b.player.getVolume()?!a&&b.player.getVolume()>0||a&&b.opt.vol==a?b.isMute?jQuery(b).YTPUnmute():jQuery(b).YTPMute():(b.opt.vol=a,b.player.setVolume(b.opt.vol),b.volumeBar&&b.volumeBar.length&&b.volumeBar.updateSliderVal(a)):jQuery(b).YTPUnmute(),this},getVolume:function(){var a=this.get(0);return a.player.getVolume()},toggleVolume:function(){var a=this.get(0);return a?(a.player.isMuted()?jQuery(a).YTPUnmute():jQuery(a).YTPMute(),this):this},mute:function(){var a=this.get(0);if(a.isMute)return this;a.player.mute(),a.isMute=!0,a.player.setVolume(0),a.volumeBar&&a.volumeBar.length&&a.volumeBar.width()>10&&a.volumeBar.updateSliderVal(0);var b=jQuery("#controlBar_"+a.id),c=b.find(".mb_YTPMuteUnmute");c.html(jQuery.mbYTPlayer.controls.unmute),jQuery(a).addClass("isMuted"),a.volumeBar&&a.volumeBar.length&&a.volumeBar.addClass("muted");var d=jQuery.Event("YTPMuted");return d.time=a.currentTime,a.preventTrigger||jQuery(a).trigger(d),this},unmute:function(){var a=this.get(0);if(!a.isMute)return this;a.player.unMute(),a.isMute=!1,a.player.setVolume(a.opt.vol),a.volumeBar&&a.volumeBar.length&&a.volumeBar.updateSliderVal(a.opt.vol>10?a.opt.vol:10);var b=jQuery("#controlBar_"+a.id),c=b.find(".mb_YTPMuteUnmute");c.html(jQuery.mbYTPlayer.controls.mute),jQuery(a).removeClass("isMuted"),a.volumeBar&&a.volumeBar.length&&a.volumeBar.removeClass("muted");var d=jQuery.Event("YTPUnmuted");return d.time=a.currentTime,a.preventTrigger||jQuery(a).trigger(d),this},applyFilter:function(a,b){var c=this,d=c.get(0);d.filters[a].value=b,d.filtersEnabled&&c.YTPEnableFilters()},applyFilters:function(a){var b=this,c=b.get(0);if(!c.isReady)return jQuery(c).on("YTPReady",function(){b.YTPApplyFilters(a)}),this;for(var d in a)b.YTPApplyFilter(d,a[d]);b.trigger("YTPFiltersApplied")},toggleFilter:function(a,b){var c=this,d=c.get(0);return d.filters[a].value?d.filters[a].value=0:d.filters[a].value=b,d.filtersEnabled&&jQuery(d).YTPEnableFilters(),this},toggleFilters:function(a){var b=this,c=b.get(0);return c.filtersEnabled?(jQuery(c).trigger("YTPDisableFilters"),jQuery(c).YTPDisableFilters()):(jQuery(c).YTPEnableFilters(),jQuery(c).trigger("YTPEnableFilters")),"function"==typeof a&&a(c.filtersEnabled),this},disableFilters:function(){var a=this,b=a.get(0),c=jQuery(b.playerEl);return c.css("-webkit-filter",""),c.css("filter",""),b.filtersEnabled=!1,this},enableFilters:function(){var a=this,b=a.get(0),c=jQuery(b.playerEl),d="";for(var e in b.filters)b.filters[e].value&&(d+=e.replace("_","-")+"("+b.filters[e].value+b.filters[e].unit+") ");return c.css("-webkit-filter",d),c.css("filter",d),b.filtersEnabled=!0,this},removeFilter:function(a,b){var c=this,d=c.get(0);if("function"==typeof a&&(b=a,a=null),a)c.YTPApplyFilter(a,0),"function"==typeof b&&b(a);else{for(var e in d.filters)c.YTPApplyFilter(e,0);"function"==typeof b&&b(e),d.filters=jQuery.extend(!0,{},jQuery.mbYTPlayer.defaultFilters)}var f=jQuery.Event("YTPFiltersApplied");return c.trigger(f),this},getFilters:function(){var a=this.get(0);return a.filters},addMask:function(a){var b=this.get(0);a||(a=b.actualMask);var c=jQuery("<img/>").attr("src",a).on("load",function(){b.overlay.CSSAnimate({opacity:0},b.opt.fadeOnStartTime,function(){b.hasMask=!0,c.remove(),b.overlay.css({backgroundImage:"url("+a+")",backgroundRepeat:"no-repeat",backgroundPosition:"center center",backgroundSize:"cover"}),b.overlay.CSSAnimate({opacity:1},b.opt.fadeOnStartTime)})});return this},removeMask:function(){var a=this.get(0);return a.overlay.CSSAnimate({opacity:0},a.opt.fadeOnStartTime,function(){a.hasMask=!1,a.overlay.css({backgroundImage:"",backgroundRepeat:"",backgroundPosition:"",backgroundSize:""}),a.overlay.CSSAnimate({opacity:1},a.opt.fadeOnStartTime)}),this},applyMask:function(a){var b=jQuery(a);if(b.off("YTPTime.mask"),a.opt.mask)if("string"==typeof a.opt.mask)b.YTPAddMask(a.opt.mask),a.actualMask=a.opt.mask;else if("object"==typeof a.opt.mask){for(var c in a.opt.mask)if(a.opt.mask[c]){jQuery("<img/>").attr("src",a.opt.mask[c])}a.opt.mask[0]&&b.YTPAddMask(a.opt.mask[0]),b.on("YTPTime.mask",function(c){for(var d in a.opt.mask)c.time==d&&(a.opt.mask[d]?(b.YTPAddMask(a.opt.mask[d]),a.actualMask=a.opt.mask[d]):b.YTPRemoveMask())})}},toggleMask:function(){var a=this.get(0),b=jQuery(a);return a.hasMask?b.YTPRemoveMask():b.YTPAddMask(),this},manageProgress:function(){var a=this.get(0),b=jQuery("#controlBar_"+a.id),c=b.find(".mb_YTPProgress"),d=b.find(".mb_YTPLoaded"),e=b.find(".mb_YTPseekbar"),f=c.outerWidth(),g=Math.floor(a.player.getCurrentTime()),h=Math.floor(a.player.getDuration()),i=g*f/h,j=0,k=100*a.player.getVideoLoadedFraction();return d.css({left:j,width:k+"%"}),e.css({left:0,width:i}),{totalTime:h,currentTime:g}},buildControls:function(YTPlayer){if(jQuery("#controlBar_"+YTPlayer.id).remove(),!YTPlayer.opt.showControls)return void(YTPlayer.controlBar=!1);if(YTPlayer.opt.showYTLogo=YTPlayer.opt.showYTLogo||YTPlayer.opt.printUrl,!jQuery("#controlBar_"+YTPlayer.id).length){YTPlayer.controlBar=jQuery("<span/>").attr("id","controlBar_"+YTPlayer.id).addClass("mb_YTPBar").css({whiteSpace:"noWrap",position:YTPlayer.isBackground?"fixed":"absolute",zIndex:YTPlayer.isBackground?1e4:1e3}).hide();var buttonBar=jQuery("<div/>").addClass("buttonBar"),playpause=jQuery("<span>"+jQuery.mbYTPlayer.controls.play+"</span>").addClass("mb_YTPPlaypause ytpicon").click(function(){1==YTPlayer.player.getPlayerState()?jQuery(YTPlayer).YTPPause():jQuery(YTPlayer).YTPPlay()}),MuteUnmute=jQuery("<span>"+jQuery.mbYTPlayer.controls.mute+"</span>").addClass("mb_YTPMuteUnmute ytpicon").click(function(){0==YTPlayer.player.getVolume()?jQuery(YTPlayer).YTPUnmute():jQuery(YTPlayer).YTPMute()}),volumeBar=jQuery("<div/>").addClass("mb_YTPVolumeBar").css({display:"inline-block"});YTPlayer.volumeBar=volumeBar;var idx=jQuery("<span/>").addClass("mb_YTPTime"),vURL=YTPlayer.opt.videoURL?YTPlayer.opt.videoURL:"";vURL.indexOf("http")<0&&(vURL=jQuery.mbYTPlayer.locationProtocol+"//www.youtube.com/watch?v="+YTPlayer.opt.videoURL);var movieUrl=jQuery("<span/>").html(jQuery.mbYTPlayer.controls.ytLogo).addClass("mb_YTPUrl ytpicon").attr("title","view on YouTube").on("click",function(){window.open(vURL,"viewOnYT")}),onlyVideo=jQuery("<span/>").html(jQuery.mbYTPlayer.controls.onlyYT).addClass("mb_OnlyYT ytpicon").on("click",function(){jQuery(YTPlayer).YTPFullscreen(YTPlayer.opt.realfullscreen)}),progressBar=jQuery("<div/>").addClass("mb_YTPProgress").css("position","absolute").click(function(a){timeBar.css({width:a.clientX-timeBar.offset().left}),YTPlayer.timeW=a.clientX-timeBar.offset().left,YTPlayer.controlBar.find(".mb_YTPLoaded").css({width:0});var b=Math.floor(YTPlayer.player.getDuration());YTPlayer["goto"]=timeBar.outerWidth()*b/progressBar.outerWidth(),YTPlayer.player.seekTo(parseFloat(YTPlayer["goto"]),!0),YTPlayer.controlBar.find(".mb_YTPLoaded").css({width:0})}),loadedBar=jQuery("<div/>").addClass("mb_YTPLoaded").css("position","absolute"),timeBar=jQuery("<div/>").addClass("mb_YTPseekbar").css("position","absolute");progressBar.append(loadedBar).append(timeBar),buttonBar.append(playpause).append(MuteUnmute).append(volumeBar).append(idx),YTPlayer.opt.showYTLogo&&buttonBar.append(movieUrl),(YTPlayer.isBackground||eval(YTPlayer.opt.realfullscreen)&&!YTPlayer.isBackground)&&buttonBar.append(onlyVideo),YTPlayer.controlBar.append(buttonBar).append(progressBar),YTPlayer.isBackground?jQuery("body").after(YTPlayer.controlBar):(YTPlayer.controlBar.addClass("inlinePlayer"),YTPlayer.wrapper.before(YTPlayer.controlBar)),volumeBar.simpleSlider({initialval:YTPlayer.opt.vol,scale:100,orientation:"h",callback:function(a){0==a.value?jQuery(YTPlayer).YTPMute():jQuery(YTPlayer).YTPUnmute(),YTPlayer.player.setVolume(a.value),YTPlayer.isMute||(YTPlayer.opt.vol=a.value)}})}},checkForState:function(){var YTPlayer=this.get(0),$YTPlayer=jQuery(YTPlayer);clearInterval(YTPlayer.getState);var interval=100;return jQuery.contains(document,YTPlayer)?(jQuery.mbYTPlayer.checkForStart(YTPlayer),void(YTPlayer.getState=setInterval(function(){var $YTPlayer=jQuery(YTPlayer);if(YTPlayer.isReady){var prog=jQuery(YTPlayer).YTPManageProgress(),stopAt=YTPlayer.opt.stopAt>YTPlayer.opt.startAt?YTPlayer.opt.stopAt:0;if(stopAt=stopAt<YTPlayer.player.getDuration()?stopAt:0,YTPlayer.currentTime!=prog.currentTime){var YTPEvent=jQuery.Event("YTPTime");YTPEvent.time=YTPlayer.currentTime,jQuery(YTPlayer).trigger(YTPEvent)}if(YTPlayer.currentTime=prog.currentTime,YTPlayer.totalTime=YTPlayer.player.getDuration(),0==YTPlayer.player.getVolume()?$YTPlayer.addClass("isMuted"):$YTPlayer.removeClass("isMuted"),YTPlayer.opt.showControls&&(prog.totalTime?YTPlayer.controlBar.find(".mb_YTPTime").html(jQuery.mbYTPlayer.formatTime(prog.currentTime)+" / "+jQuery.mbYTPlayer.formatTime(prog.totalTime)):YTPlayer.controlBar.find(".mb_YTPTime").html("-- : -- / -- : --")),eval(YTPlayer.opt.stopMovieOnBlur)&&(document.hasFocus()?document.hasFocus()&&!YTPlayer.hasFocus&&-1!=YTPlayer.state&&0!=YTPlayer.state&&(YTPlayer.hasFocus=!0,YTPlayer.player.playVideo()):1==YTPlayer.state&&(YTPlayer.hasFocus=!1,$YTPlayer.YTPPause())),YTPlayer.opt.playOnlyIfVisible){var isOnScreen=jQuery.mbYTPlayer.isOnScreen(YTPlayer);isOnScreen||1!=YTPlayer.state?isOnScreen&&!YTPlayer.isOnScreen&&(YTPlayer.isOnScreen=!0,YTPlayer.player.playVideo()):(YTPlayer.isOnScreen=!1,$YTPlayer.YTPPause())}if(YTPlayer.controlBar.length&&YTPlayer.controlBar.outerWidth()<=400&&!YTPlayer.isCompact?(YTPlayer.controlBar.addClass("compact"),YTPlayer.isCompact=!0,!YTPlayer.isMute&&YTPlayer.volumeBar&&YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol)):YTPlayer.controlBar.length&&YTPlayer.controlBar.outerWidth()>400&&YTPlayer.isCompact&&(YTPlayer.controlBar.removeClass("compact"),YTPlayer.isCompact=!1,!YTPlayer.isMute&&YTPlayer.volumeBar&&YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol)),YTPlayer.player.getPlayerState()>0&&(parseFloat(YTPlayer.player.getDuration()-.5)<YTPlayer.player.getCurrentTime()||stopAt>0&&parseFloat(YTPlayer.player.getCurrentTime())>stopAt)){if(YTPlayer.isEnded)return;if(YTPlayer.isEnded=!0,setTimeout(function(){YTPlayer.isEnded=!1},1e3),YTPlayer.isList){if(!YTPlayer.opt.loop||YTPlayer.opt.loop>0&&YTPlayer.player.loopTime===YTPlayer.opt.loop-1){YTPlayer.player.loopTime=void 0,clearInterval(YTPlayer.getState);var YTPEnd=jQuery.Event("YTPEnd");return YTPEnd.time=YTPlayer.currentTime,void jQuery(YTPlayer).trigger(YTPEnd)}}else if(!YTPlayer.opt.loop||YTPlayer.opt.loop>0&&YTPlayer.player.loopTime===YTPlayer.opt.loop-1)return YTPlayer.player.loopTime=void 0,YTPlayer.preventTrigger=!0,YTPlayer.state=2,jQuery(YTPlayer).YTPPause(),void YTPlayer.wrapper.CSSAnimate({opacity:0},YTPlayer.opt.fadeOnStartTime,function(){YTPlayer.controlBar.length&&YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);var a=jQuery.Event("YTPEnd");a.time=YTPlayer.currentTime,jQuery(YTPlayer).trigger(a),YTPlayer.player.seekTo(YTPlayer.opt.startAt,!0),YTPlayer.isBackground?YTPlayer.orig_background&&jQuery(YTPlayer).css("background-image",YTPlayer.orig_background):YTPlayer.opt.coverImage&&YTPlayer.isPlayer&&(YTPlayer.opt.coverImage=YTPlayer.opt.coverImage||YTPlayer.orig_background,YTPlayer.opt.containment.css({background:"url("+YTPlayer.opt.coverImage+") center center",backgroundSize:"cover"}))});YTPlayer.player.loopTime=YTPlayer.player.loopTime?++YTPlayer.player.loopTime:1,YTPlayer.opt.startAt=YTPlayer.opt.startAt||1,YTPlayer.preventTrigger=!0,YTPlayer.state=2,YTPlayer.player.pauseVideo(),YTPlayer.player.seekTo(YTPlayer.opt.startAt,!0),YTPlayer.player.playVideo()}}},interval))):($YTPlayer.YTPPlayerDestroy(),clearInterval(YTPlayer.getState),void clearInterval(YTPlayer.checkForStartAt))},checkForStart:function(YTPlayer){var $YTPlayer=jQuery(YTPlayer);if(!jQuery.contains(document,YTPlayer))return void $YTPlayer.YTPPlayerDestroy();if(jQuery.mbYTPlayer.buildControls(YTPlayer),YTPlayer.overlay)if(YTPlayer.opt.addRaster){var classN="dot"==YTPlayer.opt.addRaster?"raster-dot":"raster";YTPlayer.overlay.addClass(YTPlayer.isRetina?classN+" retina":classN);
}else YTPlayer.overlay.removeClass(function(a,b){var c=b.split(" "),d=[];return jQuery.each(c,function(a,b){/raster.*/.test(b)&&d.push(b)}),d.push("retina"),d.join(" ")});YTPlayer.preventTrigger=!0,YTPlayer.state=2,$YTPlayer.YTPPause(),$YTPlayer.YTPMute();var startAt=YTPlayer.start_from_last?YTPlayer.start_from_last:YTPlayer.opt.startAt?YTPlayer.opt.startAt:1;return YTPlayer.player.playVideo(),$YTPlayer.YTPMute(),YTPlayer.player.seekTo(startAt,!0),YTPlayer.checkForStartAt=setInterval(function(){var canPlayVideo=YTPlayer.player.getVideoLoadedFraction()>=startAt/YTPlayer.player.getDuration();if(YTPlayer.player.getDuration()>0&&YTPlayer.player.getCurrentTime()>=startAt&&canPlayVideo){YTPlayer.start_from_last=null,clearInterval(YTPlayer.checkForStartAt),"function"==typeof YTPlayer.opt.onReady&&YTPlayer.opt.onReady(YTPlayer),YTPlayer.isReady=!0,$YTPlayer.YTPRemoveFilter(),YTPlayer.opt.addFilters?$YTPlayer.YTPApplyFilters(YTPlayer.opt.addFilters):$YTPlayer.YTPApplyFilters({}),$YTPlayer.YTPEnableFilters();var YTPready=jQuery.Event("YTPReady");if(YTPready.time=YTPlayer.currentTime,jQuery(YTPlayer).trigger(YTPready),YTPlayer.preventTrigger=!0,YTPlayer.state=2,jQuery(YTPlayer).YTPPause(),YTPlayer.opt.mute||jQuery(YTPlayer).YTPUnmute(),YTPlayer.preventTrigger=!1,"undefined"!=typeof _gaq&&eval(YTPlayer.opt.gaTrack)?_gaq.push(["_trackEvent","YTPlayer","Play",YTPlayer.hasData?YTPlayer.videoData.title:YTPlayer.videoID.toString()]):"undefined"!=typeof ga&&eval(YTPlayer.opt.gaTrack)&&ga("send","event","YTPlayer","play",YTPlayer.hasData?YTPlayer.videoData.title:YTPlayer.videoID.toString()),YTPlayer.opt.autoPlay){var YTPStart=jQuery.Event("YTPStart");YTPStart.time=YTPlayer.currentTime,jQuery(YTPlayer).trigger(YTPStart),$YTPlayer.YTPPlay(),"mac"==jQuery.mbBrowser.os.name&&jQuery.mbBrowser.safari&&jQuery.mbBrowser.versionCompare(jQuery.mbBrowser.fullVersion,"10.1")<0&&(YTPlayer.safariPlay=setInterval(function(){1!=YTPlayer.state?$YTPlayer.YTPPlay():clearInterval(YTPlayer.safariPlay)},10))}else setTimeout(function(){YTPlayer.player.pauseVideo(),YTPlayer.start_from_last&&YTPlayer.player.seekTo(startAt,!0),YTPlayer.isPlayer||(YTPlayer.opt.coverImage?(YTPlayer.wrapper.css({opacity:0}),setTimeout(function(){YTPlayer.wrapper.css({background:"rgba(0,0,0,0.5) url("+YTPlayer.opt.coverImage+") center center",backgroundSize:"cover",backgroundRepeat:"no-repeat"}).CSSAnimate({opacity:YTPlayer.isAlone?1:YTPlayer.opt.opacity},YTPlayer.opt.fadeOnStartTime)},YTPlayer.opt.fadeOnStartTime)):(jQuery(YTPlayer.playerEl).CSSAnimate({opacity:1},YTPlayer.opt.fadeOnStartTime),YTPlayer.wrapper.CSSAnimate({opacity:YTPlayer.isAlone?1:YTPlayer.opt.opacity},YTPlayer.opt.fadeOnStartTime)))},150),YTPlayer.controlBar.length&&YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);YTPlayer.isPlayer&&!YTPlayer.opt.autoPlay&&YTPlayer.loading&&YTPlayer.loading.length&&(YTPlayer.loading.html("Ready"),setTimeout(function(){YTPlayer.loading.fadeOut()},100)),YTPlayer.controlBar&&YTPlayer.controlBar.length&&YTPlayer.controlBar.slideDown(1e3)}else"mac"==jQuery.mbBrowser.os.name&&jQuery.mbBrowser.safari&&jQuery.mbBrowser.fullVersion&&jQuery.mbBrowser.versionCompare(jQuery.mbBrowser.fullVersion,"10.1")<0&&(YTPlayer.player.playVideo(),startAt>=0&&YTPlayer.player.seekTo(startAt,!0))},500),$YTPlayer},getTime:function(){var a=this.get(0);return jQuery.mbYTPlayer.formatTime(a.currentTime)},getTotalTime:function(a){var b=this.get(0);return jQuery.mbYTPlayer.formatTime(b.totalTime)},formatTime:function(a){var b=Math.floor(a/60),c=Math.floor(a-60*b);return(9>=b?"0"+b:b)+" : "+(9>=c?"0"+c:c)},setAnchor:function(a){var b=this;b.optimizeDisplay(a)},getAnchor:function(){var a=this.get(0);return a.opt.anchor}},jQuery.fn.optimizeDisplay=function(anchor){var YTPlayer=this.get(0),vid={};YTPlayer.opt.anchor=anchor||YTPlayer.opt.anchor,YTPlayer.opt.anchor="undefined "!=typeof YTPlayer.opt.anchor?YTPlayer.opt.anchor:"center,center";var YTPAlign=YTPlayer.opt.anchor.split(","),el=YTPlayer.wrapper,iframe=jQuery(YTPlayer.playerEl);if(YTPlayer.opt.optimizeDisplay){var abundance=iframe.height()*YTPlayer.opt.abundance,win={};win.width=el.outerWidth(),win.height=el.outerHeight()+abundance,YTPlayer.opt.ratio="auto"===YTPlayer.opt.ratio?16/9:YTPlayer.opt.ratio,YTPlayer.opt.ratio=eval(YTPlayer.opt.ratio),vid.width=win.width,vid.height=Math.ceil(vid.width/YTPlayer.opt.ratio),vid.marginTop=Math.ceil(-((vid.height-win.height)/2)),vid.marginLeft=0;var lowest=vid.height<win.height;lowest&&(vid.height=win.height,vid.width=Math.ceil(vid.height*YTPlayer.opt.ratio),vid.marginTop=0,vid.marginLeft=Math.ceil(-((vid.width-win.width)/2)));for(var a in YTPAlign)if(YTPAlign.hasOwnProperty(a)){var al=YTPAlign[a].replace(/ /g,"");switch(al){case"top":vid.marginTop=lowest?-((vid.height-win.height)/2):0;break;case"bottom":vid.marginTop=lowest?0:-(vid.height-win.height);break;case"left":vid.marginLeft=0;break;case"right":vid.marginLeft=lowest?-(vid.width-win.width):0;break;default:vid.width>win.width&&(vid.marginLeft=-((vid.width-win.width)/2))}}}else vid.width="100%",vid.height="100%",vid.marginTop=0,vid.marginLeft=0;iframe.css({width:vid.width,height:vid.height,marginTop:vid.marginTop,marginLeft:vid.marginLeft,maxWidth:"initial"})},jQuery.shuffle=function(a){for(var b=a.slice(),c=b.length,d=c;d--;){var e=parseInt(Math.random()*c),f=b[d];b[d]=b[e],b[e]=f}return b},jQuery.fn.unselectable=function(){return this.each(function(){jQuery(this).css({"-moz-user-select":"none","-webkit-user-select":"none","user-select":"none"}).attr("unselectable","on")})},jQuery.fn.YTPlayer=jQuery.mbYTPlayer.buildPlayer,jQuery.fn.mb_YTPlayer=jQuery.mbYTPlayer.buildPlayer,jQuery.fn.YTPCheckForState=jQuery.mbYTPlayer.checkForState,jQuery.fn.YTPGetPlayer=jQuery.mbYTPlayer.getPlayer,jQuery.fn.YTPGetVideoID=jQuery.mbYTPlayer.getVideoID,jQuery.fn.YTPGetPlaylistID=jQuery.mbYTPlayer.getPlaylistID,jQuery.fn.YTPChangeVideo=jQuery.fn.YTPChangeMovie=jQuery.mbYTPlayer.changeVideo,jQuery.fn.YTPPlayerDestroy=jQuery.mbYTPlayer.playerDestroy,jQuery.fn.YTPPlay=jQuery.mbYTPlayer.play,jQuery.fn.YTPTogglePlay=jQuery.mbYTPlayer.togglePlay,jQuery.fn.YTPStop=jQuery.mbYTPlayer.stop,jQuery.fn.YTPPause=jQuery.mbYTPlayer.pause,jQuery.fn.YTPSeekTo=jQuery.mbYTPlayer.seekTo,jQuery.fn.YTPlaylist=jQuery.mbYTPlayer.playlist,jQuery.fn.YTPPlayNext=jQuery.mbYTPlayer.playNext,jQuery.fn.YTPPlayPrev=jQuery.mbYTPlayer.playPrev,jQuery.fn.YTPPlayIndex=jQuery.mbYTPlayer.playIndex,jQuery.fn.YTPMute=jQuery.mbYTPlayer.mute,jQuery.fn.YTPUnmute=jQuery.mbYTPlayer.unmute,jQuery.fn.YTPToggleVolume=jQuery.mbYTPlayer.toggleVolume,jQuery.fn.YTPSetVolume=jQuery.mbYTPlayer.setVolume,jQuery.fn.YTPGetVolume=jQuery.mbYTPlayer.getVolume,jQuery.fn.YTPGetVideoData=jQuery.mbYTPlayer.getVideoData,jQuery.fn.YTPFullscreen=jQuery.mbYTPlayer.fullscreen,jQuery.fn.YTPToggleLoops=jQuery.mbYTPlayer.toggleLoops,jQuery.fn.YTPSetVideoQuality=jQuery.mbYTPlayer.setVideoQuality,jQuery.fn.YTPManageProgress=jQuery.mbYTPlayer.manageProgress,jQuery.fn.YTPApplyFilter=jQuery.mbYTPlayer.applyFilter,jQuery.fn.YTPApplyFilters=jQuery.mbYTPlayer.applyFilters,jQuery.fn.YTPToggleFilter=jQuery.mbYTPlayer.toggleFilter,jQuery.fn.YTPToggleFilters=jQuery.mbYTPlayer.toggleFilters,jQuery.fn.YTPRemoveFilter=jQuery.mbYTPlayer.removeFilter,jQuery.fn.YTPDisableFilters=jQuery.mbYTPlayer.disableFilters,jQuery.fn.YTPEnableFilters=jQuery.mbYTPlayer.enableFilters,jQuery.fn.YTPGetFilters=jQuery.mbYTPlayer.getFilters,jQuery.fn.YTPGetTime=jQuery.mbYTPlayer.getTime,jQuery.fn.YTPGetTotalTime=jQuery.mbYTPlayer.getTotalTime,jQuery.fn.YTPAddMask=jQuery.mbYTPlayer.addMask,jQuery.fn.YTPRemoveMask=jQuery.mbYTPlayer.removeMask,jQuery.fn.YTPToggleMask=jQuery.mbYTPlayer.toggleMask,jQuery.fn.YTPSetAnchor=jQuery.mbYTPlayer.setAnchor,jQuery.fn.YTPGetAnchor=jQuery.mbYTPlayer.getAnchor}(jQuery,ytp),jQuery.support.CSStransition=function(){var a=(document.body||document.documentElement).style;return void 0!==a.transition||void 0!==a.WebkitTransition||void 0!==a.MozTransition||void 0!==a.MsTransition||void 0!==a.OTransition}(),jQuery.CSS={name:"mb.CSSAnimate",author:"Matteo Bicocchi",version:"2.0.0",transitionEnd:"transitionEnd",sfx:"",filters:{blur:{min:0,max:100,unit:"px"},brightness:{min:0,max:400,unit:"%"},contrast:{min:0,max:400,unit:"%"},grayscale:{min:0,max:100,unit:"%"},hueRotate:{min:0,max:360,unit:"deg"},invert:{min:0,max:100,unit:"%"},saturate:{min:0,max:400,unit:"%"},sepia:{min:0,max:100,unit:"%"}},normalizeCss:function(a){var b=jQuery.extend(!0,{},a);jQuery.browser.webkit||jQuery.browser.opera?jQuery.CSS.sfx="-webkit-":jQuery.browser.mozilla?jQuery.CSS.sfx="-moz-":jQuery.browser.msie&&(jQuery.CSS.sfx="-ms-"),jQuery.CSS.sfx="";for(var c in b){if("transform"===c&&(b[jQuery.CSS.sfx+"transform"]=b[c],delete b[c]),"transform-origin"===c&&(b[jQuery.CSS.sfx+"transform-origin"]=a[c],delete b[c]),"filter"!==c||jQuery.browser.mozilla||(b[jQuery.CSS.sfx+"filter"]=a[c],delete b[c]),"blur"===c&&setFilter(b,"blur",a[c]),"brightness"===c&&setFilter(b,"brightness",a[c]),"contrast"===c&&setFilter(b,"contrast",a[c]),"grayscale"===c&&setFilter(b,"grayscale",a[c]),"hueRotate"===c&&setFilter(b,"hueRotate",a[c]),"invert"===c&&setFilter(b,"invert",a[c]),"saturate"===c&&setFilter(b,"saturate",a[c]),"sepia"===c&&setFilter(b,"sepia",a[c]),"x"===c){var d=jQuery.CSS.sfx+"transform";b[d]=b[d]||"",b[d]+=" translateX("+setUnit(a[c],"px")+")",delete b[c]}"y"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" translateY("+setUnit(a[c],"px")+")",delete b[c]),"z"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" translateZ("+setUnit(a[c],"px")+")",delete b[c]),"rotate"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" rotate("+setUnit(a[c],"deg")+")",delete b[c]),"rotateX"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" rotateX("+setUnit(a[c],"deg")+")",delete b[c]),"rotateY"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" rotateY("+setUnit(a[c],"deg")+")",delete b[c]),"rotateZ"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" rotateZ("+setUnit(a[c],"deg")+")",delete b[c]),"scale"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" scale("+setUnit(a[c],"")+")",delete b[c]),"scaleX"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" scaleX("+setUnit(a[c],"")+")",delete b[c]),"scaleY"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" scaleY("+setUnit(a[c],"")+")",delete b[c]),"scaleZ"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" scaleZ("+setUnit(a[c],"")+")",delete b[c]),"skew"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" skew("+setUnit(a[c],"deg")+")",delete b[c]),"skewX"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" skewX("+setUnit(a[c],"deg")+")",delete b[c]),"skewY"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" skewY("+setUnit(a[c],"deg")+")",delete b[c]),"perspective"===c&&(d=jQuery.CSS.sfx+"transform",b[d]=b[d]||"",b[d]+=" perspective("+setUnit(a[c],"px")+")",delete b[c])}return b},getProp:function(a){var b,c=[];for(b in a)0>c.indexOf(b)&&c.push(uncamel(b));return c.join(",")},animate:function(a,b,c,d,e){return this.each(function(){function f(){g.called=!0,g.CSSAIsRunning=!1,h.off(jQuery.CSS.transitionEnd+"."+g.id),clearTimeout(g.timeout),h.css(jQuery.CSS.sfx+"transition",""),"function"==typeof e&&e.apply(g),"function"==typeof g.CSSqueue&&(g.CSSqueue(),g.CSSqueue=null)}var g=this,h=jQuery(this);g.id=g.id||"CSSA_"+(new Date).getTime();var i=i||{type:"noEvent"};if(g.CSSAIsRunning&&g.eventType==i.type&&!jQuery.browser.msie&&9>=jQuery.browser.version)g.CSSqueue=function(){h.CSSAnimate(a,b,c,d,e)};else if(g.CSSqueue=null,g.eventType=i.type,0!==h.length&&a){if(a=jQuery.normalizeCss(a),g.CSSAIsRunning=!0,"function"==typeof b&&(e=b,b=jQuery.fx.speeds._default),"function"==typeof c&&(d=c,c=0),"string"==typeof c&&(e=c,c=0),"function"==typeof d&&(e=d,d="cubic-bezier(0.65,0.03,0.36,0.72)"),"string"==typeof b)for(var j in jQuery.fx.speeds){if(b==j){b=jQuery.fx.speeds[j];break}b=jQuery.fx.speeds._default}if(b||(b=jQuery.fx.speeds._default),"string"==typeof e&&(d=e,e=null),jQuery.support.CSStransition){var k={"default":"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k[d]&&(d=k[d]),h.off(jQuery.CSS.transitionEnd+"."+g.id),k=jQuery.CSS.getProp(a);var l={};jQuery.extend(l,a),l[jQuery.CSS.sfx+"transition-property"]=k,l[jQuery.CSS.sfx+"transition-duration"]=b+"ms",l[jQuery.CSS.sfx+"transition-delay"]=c+"ms",l[jQuery.CSS.sfx+"transition-timing-function"]=d,setTimeout(function(){h.one(jQuery.CSS.transitionEnd+"."+g.id,f),h.css(l)},1),g.timeout=setTimeout(function(){g.called||!e?(g.called=!1,g.CSSAIsRunning=!1):(h.css(jQuery.CSS.sfx+"transition",""),e.apply(g),g.CSSAIsRunning=!1,"function"==typeof g.CSSqueue&&(g.CSSqueue(),g.CSSqueue=null))},b+c+10)}else{for(k in a)"transform"===k&&delete a[k],"filter"===k&&delete a[k],"transform-origin"===k&&delete a[k],"auto"===a[k]&&delete a[k],"x"===k&&(i=a[k],j="left",a[j]=i,delete a[k]),"y"===k&&(i=a[k],j="top",a[j]=i,delete a[k]),"-ms-transform"!==k&&"-ms-filter"!==k||delete a[k];h.delay(c).animate(a,b,e)}}})}},jQuery.fn.CSSAnimate=jQuery.CSS.animate,jQuery.normalizeCss=jQuery.CSS.normalizeCss,jQuery.fn.css3=function(a){return this.each(function(){var b=jQuery(this),c=jQuery.normalizeCss(a);b.css(c)})};var nAgt=navigator.userAgent;jQuery.browser=jQuery.browser||{},jQuery.browser.mozilla=!1,jQuery.browser.webkit=!1,jQuery.browser.opera=!1,jQuery.browser.safari=!1,jQuery.browser.chrome=!1,jQuery.browser.androidStock=!1,jQuery.browser.msie=!1,jQuery.browser.edge=!1,jQuery.browser.ua=nAgt;var getOS=function(){var a={version:"Unknown version",name:"Unknown OS"};return-1!=navigator.appVersion.indexOf("Win")&&(a.name="Windows"),-1!=navigator.appVersion.indexOf("Mac")&&0>navigator.appVersion.indexOf("Mobile")&&(a.name="Mac"),-1!=navigator.appVersion.indexOf("Linux")&&(a.name="Linux"),/Mac OS X/.test(nAgt)&&!/Mobile/.test(nAgt)&&(a.version=/Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1],a.version=a.version.replace(/_/g,".").substring(0,5)),/Windows/.test(nAgt)&&(a.version="Unknown.Unknown"),/Windows NT 5.1/.test(nAgt)&&(a.version="5.1"),/Windows NT 6.0/.test(nAgt)&&(a.version="6.0"),/Windows NT 6.1/.test(nAgt)&&(a.version="6.1"),/Windows NT 6.2/.test(nAgt)&&(a.version="6.2"),/Windows NT 10.0/.test(nAgt)&&(a.version="10.0"),/Linux/.test(nAgt)&&/Linux/.test(nAgt)&&(a.version="Unknown.Unknown"),a.name=a.name.toLowerCase(),a.major_version="Unknown",a.minor_version="Unknown","Unknown.Unknown"!=a.version&&(a.major_version=parseFloat(a.version.split(".")[0]),a.minor_version=parseFloat(a.version.split(".")[1])),a};jQuery.browser.os=getOS(),jQuery.browser.hasTouch=isTouchSupported(),jQuery.browser.name=navigator.appName,jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion),jQuery.browser.majorVersion=parseInt(navigator.appVersion,10);var nameOffset,verOffset,ix;if(-1!=(verOffset=nAgt.indexOf("Opera")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+6),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8));else if(-1!=(verOffset=nAgt.indexOf("OPR")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+4);else if(-1!=(verOffset=nAgt.indexOf("MSIE")))jQuery.browser.msie=!0,jQuery.browser.name="Microsoft Internet Explorer",jQuery.browser.fullVersion=nAgt.substring(verOffset+5);else if(-1!=nAgt.indexOf("Trident")){jQuery.browser.msie=!0,jQuery.browser.name="Microsoft Internet Explorer";var start=nAgt.indexOf("rv:")+3,end=start+4;jQuery.browser.fullVersion=nAgt.substring(start,end)}else-1!=(verOffset=nAgt.indexOf("Edge"))?(jQuery.browser.edge=!0,jQuery.browser.name="Microsoft Edge",jQuery.browser.fullVersion=nAgt.substring(verOffset+5)):-1!=(verOffset=nAgt.indexOf("Chrome"))?(jQuery.browser.webkit=!0,jQuery.browser.chrome=!0,jQuery.browser.name="Chrome",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1<nAgt.indexOf("mozilla/5.0")&&-1<nAgt.indexOf("android ")&&-1<nAgt.indexOf("applewebkit")&&!(-1<nAgt.indexOf("chrome"))?(verOffset=nAgt.indexOf("Chrome"),jQuery.browser.webkit=!0,jQuery.browser.androidStock=!0,jQuery.browser.name="androidStock",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1!=(verOffset=nAgt.indexOf("Safari"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name="Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("AppleWebkit"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name="Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("Firefox"))?(jQuery.browser.mozilla=!0,jQuery.browser.name="Firefox",jQuery.browser.fullVersion=nAgt.substring(verOffset+8)):(nameOffset=nAgt.lastIndexOf(" ")+1)<(verOffset=nAgt.lastIndexOf("/"))&&(jQuery.browser.name=nAgt.substring(nameOffset,verOffset),jQuery.browser.fullVersion=nAgt.substring(verOffset+1),jQuery.browser.name.toLowerCase()==jQuery.browser.name.toUpperCase()&&(jQuery.browser.name=navigator.appName));-1!=(ix=jQuery.browser.fullVersion.indexOf(";"))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix)),-1!=(ix=jQuery.browser.fullVersion.indexOf(" "))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix)),jQuery.browser.majorVersion=parseInt(""+jQuery.browser.fullVersion,10),isNaN(jQuery.browser.majorVersion)&&(jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion),jQuery.browser.majorVersion=parseInt(navigator.appVersion,10)),jQuery.browser.version=jQuery.browser.majorVersion,jQuery.browser.android=/Android/i.test(nAgt),jQuery.browser.blackberry=/BlackBerry|BB|PlayBook/i.test(nAgt),jQuery.browser.ios=/iPhone|iPad|iPod|webOS/i.test(nAgt),jQuery.browser.operaMobile=/Opera Mini/i.test(nAgt),jQuery.browser.windowsMobile=/IEMobile|Windows Phone/i.test(nAgt),jQuery.browser.kindle=/Kindle|Silk/i.test(nAgt),jQuery.browser.mobile=jQuery.browser.android||jQuery.browser.blackberry||jQuery.browser.ios||jQuery.browser.windowsMobile||jQuery.browser.operaMobile||jQuery.browser.kindle,jQuery.isMobile=jQuery.browser.mobile,jQuery.isTablet=jQuery.browser.mobile&&765<jQuery(window).width(),jQuery.isAndroidDefault=jQuery.browser.android&&!/chrome/i.test(nAgt),jQuery.mbBrowser=jQuery.browser,jQuery.browser.versionCompare=function(a,b){if("stringstring"!=typeof a+typeof b)return!1;for(var c=a.split("."),d=b.split("."),e=0,f=Math.max(c.length,d.length);f>e;e++){if(c[e]&&!d[e]&&0<parseInt(c[e])||parseInt(c[e])>parseInt(d[e]))return 1;if(d[e]&&!c[e]&&0<parseInt(d[e])||parseInt(c[e])<parseInt(d[e]))return-1}return 0};var nAgt=navigator.userAgent;jQuery.browser=jQuery.browser||{},jQuery.browser.mozilla=!1,jQuery.browser.webkit=!1,jQuery.browser.opera=!1,jQuery.browser.safari=!1,jQuery.browser.chrome=!1,jQuery.browser.androidStock=!1,jQuery.browser.msie=!1,jQuery.browser.edge=!1,jQuery.browser.ua=nAgt;var getOS=function(){var a={version:"Unknown version",name:"Unknown OS"};return-1!=navigator.appVersion.indexOf("Win")&&(a.name="Windows"),-1!=navigator.appVersion.indexOf("Mac")&&0>navigator.appVersion.indexOf("Mobile")&&(a.name="Mac"),-1!=navigator.appVersion.indexOf("Linux")&&(a.name="Linux"),/Mac OS X/.test(nAgt)&&!/Mobile/.test(nAgt)&&(a.version=/Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1],a.version=a.version.replace(/_/g,".").substring(0,5)),/Windows/.test(nAgt)&&(a.version="Unknown.Unknown"),/Windows NT 5.1/.test(nAgt)&&(a.version="5.1"),/Windows NT 6.0/.test(nAgt)&&(a.version="6.0"),/Windows NT 6.1/.test(nAgt)&&(a.version="6.1"),/Windows NT 6.2/.test(nAgt)&&(a.version="6.2"),/Windows NT 10.0/.test(nAgt)&&(a.version="10.0"),/Linux/.test(nAgt)&&/Linux/.test(nAgt)&&(a.version="Unknown.Unknown"),a.name=a.name.toLowerCase(),a.major_version="Unknown",a.minor_version="Unknown","Unknown.Unknown"!=a.version&&(a.major_version=parseFloat(a.version.split(".")[0]),a.minor_version=parseFloat(a.version.split(".")[1])),a};jQuery.browser.os=getOS(),jQuery.browser.hasTouch=isTouchSupported(),jQuery.browser.name=navigator.appName,jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion),jQuery.browser.majorVersion=parseInt(navigator.appVersion,10);var nameOffset,verOffset,ix;if(-1!=(verOffset=nAgt.indexOf("Opera")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+6),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8));else if(-1!=(verOffset=nAgt.indexOf("OPR")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+4);else if(-1!=(verOffset=nAgt.indexOf("MSIE")))jQuery.browser.msie=!0,jQuery.browser.name="Microsoft Internet Explorer",jQuery.browser.fullVersion=nAgt.substring(verOffset+5);else if(-1!=nAgt.indexOf("Trident")){jQuery.browser.msie=!0,jQuery.browser.name="Microsoft Internet Explorer";var start=nAgt.indexOf("rv:")+3,end=start+4;jQuery.browser.fullVersion=nAgt.substring(start,end)}else-1!=(verOffset=nAgt.indexOf("Edge"))?(jQuery.browser.edge=!0,jQuery.browser.name="Microsoft Edge",jQuery.browser.fullVersion=nAgt.substring(verOffset+5)):-1!=(verOffset=nAgt.indexOf("Chrome"))?(jQuery.browser.webkit=!0,jQuery.browser.chrome=!0,jQuery.browser.name="Chrome",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1<nAgt.indexOf("mozilla/5.0")&&-1<nAgt.indexOf("android ")&&-1<nAgt.indexOf("applewebkit")&&!(-1<nAgt.indexOf("chrome"))?(verOffset=nAgt.indexOf("Chrome"),jQuery.browser.webkit=!0,jQuery.browser.androidStock=!0,jQuery.browser.name="androidStock",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1!=(verOffset=nAgt.indexOf("Safari"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name="Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("AppleWebkit"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name="Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("Firefox"))?(jQuery.browser.mozilla=!0,jQuery.browser.name="Firefox",jQuery.browser.fullVersion=nAgt.substring(verOffset+8)):(nameOffset=nAgt.lastIndexOf(" ")+1)<(verOffset=nAgt.lastIndexOf("/"))&&(jQuery.browser.name=nAgt.substring(nameOffset,verOffset),jQuery.browser.fullVersion=nAgt.substring(verOffset+1),jQuery.browser.name.toLowerCase()==jQuery.browser.name.toUpperCase()&&(jQuery.browser.name=navigator.appName));-1!=(ix=jQuery.browser.fullVersion.indexOf(";"))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix)),-1!=(ix=jQuery.browser.fullVersion.indexOf(" "))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix)),jQuery.browser.majorVersion=parseInt(""+jQuery.browser.fullVersion,10),isNaN(jQuery.browser.majorVersion)&&(jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion),jQuery.browser.majorVersion=parseInt(navigator.appVersion,10)),jQuery.browser.version=jQuery.browser.majorVersion,jQuery.browser.android=/Android/i.test(nAgt),jQuery.browser.blackberry=/BlackBerry|BB|PlayBook/i.test(nAgt),jQuery.browser.ios=/iPhone|iPad|iPod|webOS/i.test(nAgt),jQuery.browser.operaMobile=/Opera Mini/i.test(nAgt),jQuery.browser.windowsMobile=/IEMobile|Windows Phone/i.test(nAgt),jQuery.browser.kindle=/Kindle|Silk/i.test(nAgt),jQuery.browser.mobile=jQuery.browser.android||jQuery.browser.blackberry||jQuery.browser.ios||jQuery.browser.windowsMobile||jQuery.browser.operaMobile||jQuery.browser.kindle,jQuery.isMobile=jQuery.browser.mobile,jQuery.isTablet=jQuery.browser.mobile&&765<jQuery(window).width(),jQuery.isAndroidDefault=jQuery.browser.android&&!/chrome/i.test(nAgt),jQuery.mbBrowser=jQuery.browser,jQuery.browser.versionCompare=function(a,b){if("stringstring"!=typeof a+typeof b)return!1;for(var c=a.split("."),d=b.split("."),e=0,f=Math.max(c.length,d.length);f>e;e++){if(c[e]&&!d[e]&&0<parseInt(c[e])||parseInt(c[e])>parseInt(d[e]))return 1;if(d[e]&&!c[e]&&0<parseInt(d[e])||parseInt(c[e])<parseInt(d[e]))return-1}return 0},function(a){a.simpleSlider={defaults:{initialval:0,scale:100,orientation:"h",readonly:!1,callback:!1},events:{start:a.browser.mobile?"touchstart":"mousedown",end:a.browser.mobile?"touchend":"mouseup",move:a.browser.mobile?"touchmove":"mousemove"},init:function(b){return this.each(function(){var c=this,d=a(c);d.addClass("simpleSlider"),c.opt={},a.extend(c.opt,a.simpleSlider.defaults,b),a.extend(c.opt,d.data());var e="h"==c.opt.orientation?"horizontal":"vertical";e=a("<div/>").addClass("level").addClass(e),d.prepend(e),c.level=e,d.css({cursor:"default"}),"auto"==c.opt.scale&&(c.opt.scale=a(c).outerWidth()),d.updateSliderVal(),c.opt.readonly||(d.on(a.simpleSlider.events.start,function(b){a.browser.mobile&&(b=b.changedTouches[0]),c.canSlide=!0,d.updateSliderVal(b),"h"==c.opt.orientation?d.css({cursor:"col-resize"}):d.css({cursor:"row-resize"}),a.browser.mobile||(b.preventDefault(),b.stopPropagation())}),a(document).on(a.simpleSlider.events.move,function(b){a.browser.mobile&&(b=b.changedTouches[0]),c.canSlide&&(a(document).css({cursor:"default"}),d.updateSliderVal(b),a.browser.mobile||(b.preventDefault(),b.stopPropagation()))}).on(a.simpleSlider.events.end,function(){a(document).css({cursor:"auto"}),c.canSlide=!1,d.css({cursor:"auto"})}))})},updateSliderVal:function(b){var c=this.get(0);if(c.opt){c.opt.initialval="number"==typeof c.opt.initialval?c.opt.initialval:c.opt.initialval(c);var d=a(c).outerWidth(),e=a(c).outerHeight();c.x="object"==typeof b?b.clientX+document.body.scrollLeft-this.offset().left:"number"==typeof b?b*d/c.opt.scale:c.opt.initialval*d/c.opt.scale,c.y="object"==typeof b?b.clientY+document.body.scrollTop-this.offset().top:"number"==typeof b?(c.opt.scale-c.opt.initialval-b)*e/c.opt.scale:c.opt.initialval*e/c.opt.scale,c.y=this.outerHeight()-c.y,c.scaleX=c.x*c.opt.scale/d,c.scaleY=c.y*c.opt.scale/e,c.outOfRangeX=c.scaleX>c.opt.scale?c.scaleX-c.opt.scale:0>c.scaleX?c.scaleX:0,c.outOfRangeY=c.scaleY>c.opt.scale?c.scaleY-c.opt.scale:0>c.scaleY?c.scaleY:0,c.outOfRange="h"==c.opt.orientation?c.outOfRangeX:c.outOfRangeY,c.value="undefined"!=typeof b?"h"==c.opt.orientation?c.x>=this.outerWidth()?c.opt.scale:0>=c.x?0:c.scaleX:c.y>=this.outerHeight()?c.opt.scale:0>=c.y?0:c.scaleY:"h"==c.opt.orientation?c.scaleX:c.scaleY,"h"==c.opt.orientation?c.level.width(Math.floor(100*c.x/d)+"%"):c.level.height(Math.floor(100*c.y/e)),"function"==typeof c.opt.callback&&c.opt.callback(c)}}},a.fn.simpleSlider=a.simpleSlider.init,a.fn.updateSliderVal=a.simpleSlider.updateSliderVal}(jQuery),function(a){a.mbCookie={set:function(a,b,c,d){"object"==typeof b&&(b=JSON.stringify(b)),d=d?"; domain="+d:"";var e=new Date,f="";c>0&&(e.setTime(e.getTime()+864e5*c),f="; expires="+e.toGMTString()),document.cookie=a+"="+b+f+"; path=/"+d},get:function(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;c++){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1,d.length);if(0==d.indexOf(a))try{return JSON.parse(d.substring(a.length,d.length))}catch(e){return d.substring(a.length,d.length)}}return null},remove:function(b){a.mbCookie.set(b,"",-1)}},a.mbStorage={set:function(a,b){"object"==typeof b&&(b=JSON.stringify(b)),localStorage.setItem(a,b)},get:function(a){if(!localStorage[a])return null;try{return JSON.parse(localStorage[a])}catch(b){return localStorage[a]}},remove:function(a){a?localStorage.removeItem(a):localStorage.clear()}}}(jQuery);

//你這裡有問題 
jQuery(window).on('load',function(){
	var onMobile = false;
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) { onMobile = true; }
	if( ( onMobile === false ) ) {
		$(".player").mb_YTPlayer();
	} else {
		$('.slide1, .slide2, .slide3').addClass('bg');
			
		$(".player").hide();

	}
});
