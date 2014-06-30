/* Author:

 */

$("select:has(option[value=]:first-child)").on('change', function() {
    $(this).toggleClass("empty", $.inArray($(this).val(), ['', null]) >= 0);
}).trigger('change');

var $cnt = 1;
$(document).ready($(function() {
    $('.newThoughtButton').on('click', function() {
        $cnt++;
        $('#sortable').append('<li id="li' + $cnt + '" class="li-default' + ' ' + $('#imp').val() + '"><div id="thought' + $cnt + '" class="thought-default ' + $('#ntype').val() + '">' + $('#thought').val() + '</div></li>');
        $('#ntype').val("");
        $('#imp').val("");
        $('#thought').val("");
        $(".thought-default").more({length: 80,
                                 moreText: '<span style="text-shadow:none;color:gray;">more</span>',
                                 lessText: '<span style="text-shadow:none;color:gray;">less</span>'});
    });
}));


$(function() {
    $("#sortable").sortable({
        placeholder : "ui-state-highlight"
    });
    $("#sortable").disableSelection();

    $("#sortable").on("taphold",function(){
      $("#fireThougBubble").click();
    //  $.mobile.navigate( "#thoughtBubble", { info: "info about the #bar hash" });
    });

});

$(document).ready($(function() {
    $('.cancelMarkupButton').on('click', function() {
        $("#newMarkupContainer").hide();
    });
}));

thoughtDeckStorage = {};
thoughtDeckStorage.indexedDB = {};

thoughtDeckStorage.indexedDB.db = null;

thoughtDeckStorage.indexedDB.open = function() {
    var version = 1;
    var request = indexedDB.open("decks", version);

    // We can only create Object stores in a versionchange transaction.
    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = thoughtDeckStorage.indexedDB.onerror;

        if (db.objectStoreNames.contains("deck")) {
            db.deleteObjectStore("deck");
        }

        var store = db.createObjectStore("deck", {
            keyPath : "name"
        });
    };

    request.onsuccess = function(e) {
        thoughtDeckStorage.indexedDB.db = e.target.result;
        thoughtDeckStorage.indexedDB.getAllDeckItems();
    };

    request.onerror = thoughtDeckStorage.indexedDB.onerror;
};

thoughtDeckStorage.indexedDB.addDeck = function(deckText, tags, desc, thoughts) {
    var db = thoughtDeckStorage.indexedDB.db;
    var trans = db.transaction(["deck"], "readwrite");
    var store = trans.objectStore("deck");
    var request = store.put({
        "name" : deckText,
        "tags" : tags,
        "desc" : desc,
        "thoughts" : thoughts,
        "timeStamp" : new Date().getTime()
    });

    request.onsuccess = function(e) {
        // Re-render all the deck's
        thoughtDeckStorage.indexedDB.getAllDeckItems();
    };

    request.onerror = function(e) {
        console.log(e.value);
    };
};

thoughtDeckStorage.indexedDB.getAllDeckItems = function() {
    var decks = document.getElementById("deckList");
    decks.innerHTML = "";

    var db = thoughtDeckStorage.indexedDB.db;
    var trans = db.transaction(["deck"], "readwrite");
    var store = trans.objectStore("deck");

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if (!!result == false)
            return;

        renderDeck(result.value);
        result.continue();
    };

    cursorRequest.onerror = thoughtDeckStorage.indexedDB.onerror;
};


thoughtDeckStorage.indexedDB.getDeckItemsByName = function(name)  {
    clearDeck();
    var db = thoughtDeckStorage.indexedDB.db;
    var trans = db.transaction(["deck"], "readwrite");
    var store = trans.objectStore("deck");
    var request = store.get(name);
    request.onerror = function(event) {
      // Handle errors!
    };
    request.onsuccess = function(event) {
      // Do something with the request.result!
      var deck = document.getElementById('deckname');
      var tags = document.getElementById('tags');
      var desc = document.getElementById('desc'); 

      var thoughts = [];
      deck.innerHTML = request.result.name;
      tags.value = request.result.tags;
      desc.value = request.result.desc;
      thoughts = JSON.parse(request.result.thoughts);
 
      console.log('retrived thoughts:' + request.result.thoughts);
      
      thoughts.forEach(function(entry) {
        console.log('thought:' + entry.thoughtText);
        $('#sortable').append('<li id="' + entry.thoughtId + '" class="' + entry.liClasses + '"><div id="thought' + $cnt + '" class="' + entry.thoughtClasses + '">' + entry.thoughtText + '</div></li>');
        $(".thought-default").more({length: 80,
                                 moreText: '<span style="text-shadow:none;color:gray;">more</span>',
                                 lessText: '<span style="text-shadow:none;color:gray;">less</span>'});
        
      });
      $.mobile.navigate( "#thought-edit", { transition : "slide", info: "info about the #bar hash" });
    };
};



function renderDeck(row) {
    var decks = document.getElementById("deckList");
    var li = document.createElement("li");
    var a = document.createElement("a");
    var a1 = document.createElement("a");

    var t = document.createTextNode("");
    t.data = row.name;
    console.log(row.thoughts);

    a.addEventListener("click", function(e) {
        thoughtDeckStorage.indexedDB.deleteDeck(row.name);
    });
    
    a1.addEventListener("click", function(e) {
        thoughtDeckStorage.indexedDB.getDeckItemsByName(row.name);
    });
 

    a.textContent = " [Delete]";
    a1.textContent = t.data;
    li.appendChild(a1);
    li.appendChild(a);
    decks.appendChild(li);
}

thoughtDeckStorage.indexedDB.deleteDeck = function(id) {
    var db = thoughtDeckStorage.indexedDB.db;
    var trans = db.transaction(["deck"], "readwrite");
    var store = trans.objectStore("deck");

    var request = store.delete(id);

    request.onsuccess = function(e) {
        thoughtDeckStorage.indexedDB.getAllDeckItems();
    };

    request.onerror = function(e) {
        console.log("Error Adding: ", e);
    };
};

function init() {
    thoughtDeckStorage.indexedDB.open();
    // open displays the data previously saved
}

window.addEventListener("DOMContentLoaded", init, false);

function addDeck() {
    var deck = document.getElementById('deckname');
    var tags = document.getElementById('tags');
    var desc = document.getElementById('desc');        
    
    if (deck === null) {
        alert("Specify Deck Name");
        return;
    }
    var arThoughts = [];
    $( ".thought-default" ).each(function( index ) {
        var obThought = {};  

        obThought.thoughtId = $( this ).attr('id');
        obThought.thoughtText = $( this ).html();
        obThought.thoughtClasses = $( this ).attr('class');
        obThought.liClasses = $( this ).parent().attr('class');

        console.log('Adding:' + JSON.stringify(obThought));

        arThoughts.push(obThought);

    });
    
    thoughtDeckStorage.indexedDB.addDeck(deck.innerHTML, tags.value, desc.value, JSON.stringify(arThoughts));
    
    clearDeck();
}

function clearDeck() {
    var deck = document.getElementById('deckname');
    var tags = document.getElementById('tags');
    var desc = document.getElementById('desc');    
 
    $('.li-default').remove();

    deck.innerHTML = 'Untitled';
    tags.value = '';
    desc.value = '';       
}

function newDeck() {
    clearDeck();
    $.mobile.navigate( "#thought-edit", { transition : "slide", info: "info about the #bar hash" });
}
