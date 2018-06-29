// ==UserScript==
// @name     SparkEnhance
// @version  4
// @grant    none
// @match https://teams.webex.com/*
// @require http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// ==/UserScript==

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

SparkEnhance = {
  inAction: false,
  init: function() {
    SparkEnhance.slowSetup();
  },
  
  slowSetup: function() {
    if(window.jQuery == null || window.jQuery("#conversation-list") == null || window.jQuery("#conversation-list").children().length == 0 || window.jQuery(".user-welcome").length > 5) {
      console.log("Spark isn't ready yet");
      setTimeout(SparkEnhance.slowSetup, 3000);
      return;
    }
    console.log("Running setup");
    
    // sometimes it hasn't really settled
    setTimeout(SparkEnhance.separate, 3000);
    window.jQuery("#conversation-list").on("change", SparkEnhance.seperate);
    
    var observer = new MutationObserver(function(mutations, observer) {
      if(SparkEnhance.inAction) {
        return;
      }
      SparkEnhance.separate();
      // putting this in a timeout to let things settle and then make it happen again.
      setTimeout(SparkEnhance.separate, 750);
    });

    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe(window.jQuery("#conversation-list")[0], {
      childList: true,
      attributes: false
    });
    
    
    var observer2 = new MutationObserver(function(mutations, observer) {
      if(mutations[0].type === "attribute") {
        SparkEnhance.setLastPerson();
      }
    });

    
    observer2.observe(window.jQuery("#conversation-list")[0], {
      childList: true,
      attributes: true,
      attributeFilter: ["class"]
    });
    
    SparkEnhance.overrideCss();
  },
  
  overrideCss: function() {
    window.additionalSheet.insertRule(".navigation-bar { background-color: #708090 !important; }");
    window.additionalSheet.insertRule(".space-list-section { background-color: #778899 !important; }");
    window.additionalSheet.insertRule(".activity-title { border-bottom-color: #cfcfcf !important; }");
    window.additionalSheet.insertRule(".last-person { border-bottom: 5px #ffcfaf solid !important; }");
    window.additionalSheet.insertRule(".cui-list-item--unread { background-color: #cc9393 !important; }");
    window.additionalSheet.insertRule(".cui-list-item--space:focus {box-shadow: inset 0 0 1px 1px rgba(112, 144, 128, 0.25), 0 0 5px 3px rgba(255, 255, 255, 0.75) !important;}");
    window.additionalSheet.insertRule("#activities { background-color: #DDD !important; }");
    window.additionalSheet.insertRule(".room-actions-menu-icon { background-color: #DDD !important; }");
    window.additionalSheet.insertRule(".activity-item .meta { color: #666 !important; }");
  },
  
  separate: function() {
    if(SparkEnhance.inAction) {
      return;
    }
    SparkEnhance.inAction = true;
    console.log("Seperating");
    
    
    var listHolder = window.jQuery("#conversation-list");
    var $ = window.jQuery;
    
    $(".last-person", listHolder).removeClass("last-person");
    
    var personList = [];
    var spaceList = [];
    var moreButton;
    
    $(".cui-list-item", listHolder).each(function(index,space) { 
      if($(space).hasClass("convo-list-load-more")) {
        moreButton = space;
      } else if($(space).attr("title")!= null && $(space).attr("title").endsWith("@hilton.com")) {
        personList.push(space);
      } else {
        spaceList.push(space);
      }
    });
    
    // sort alpha
    personList.sort(function(a, b) {
      if($(a).attr("title") > $(b).attr("title")) {
        return 1;
      } else if($(a).attr("title") < $(b).attr("title")) {
        return -1;
      } else {
        return 0;
      }
    });
    spaceList.sort(function(a, b) {
      if($(a).attr("title") > $(b).attr("title")) {
        return 1;
      } else if($(a).attr("title") < $(b).attr("title")) {
        return -1;
      } else {
        return 0;
      }
    });
    
    //now add them all back in order
    personList.forEach(function(space) {
      $(listHolder).append(space);
    });
    spaceList.forEach(function(space) {
      $(listHolder).append(space);
    });
    $(listHolder).append(moreButton);
    $(personList[personList.length - 1]).addClass("last-person");
    
    
    // reset in action flag but with a delay
    setTimeout(function() {
   	  SparkEnhance.inAction = false;
    }, 500);
    
  },
  
  setLastPerson: function() {
    if(SparkEnhance.inAction) {
      return;
    }
    SparkEnhance.inAction = true;
    
    
    var listHolder = window.jQuery("#conversation-list");
    var $ = window.jQuery;
    
    $(".last-person", listHolder).removeClass("last-person");
    
    
    $(".cui-list-item", listHolder).each(function(index,space) {      
      if($(space).attr("title")!= null && $(space).attr("title").endsWith("@hilton.com") && !$(space).hasClass("convo-list-load-more")) {
        $(".last-person", listHolder).removeClass("last-person");
        $(space).addClass("last-person");
      } 
    });
    
    // reset in action flag but with a delay
    setTimeout(function() {
   	  SparkEnhance.inAction = false;
    }, 250);
  }
}

function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    //script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

window.additionalSheet = (function() {
	// Create the <style> tag
	var style = document.createElement("style");

	// Add a media (and/or media query) here if you'd like!
	// style.setAttribute("media", "screen")
	// style.setAttribute("media", "only screen and (max-width : 1024px)")

	// WebKit hack :(
	style.appendChild(document.createTextNode(""));

	// Add the <style> element to the page
	document.head.appendChild(style);

	return style.sheet;
})();


addJQuery();
SparkEnhance.init();
