thoughtDeckStorage = {};
thoughtDeckStorage.indexedDB = {};

thoughtDeckStorage.indexedDB.db = null;

thoughtDeckStorage.indexedDB.open = function() {
    var version = 1;
    var request = window.indexedDB.open("decks", version);

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
        
        store.createIndex("lcname", "lcname", { unique: true });
        store.createIndex("lcname", "lcname", { unique: true });
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
        "lcname" : deckText.toLowerCase(),
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
    $("#decklist").empty();

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

thoughtDeckStorage.indexedDB.getDeckItemsByName = function(name) {
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
            $('#sortable').append('<li class="' + entry.liClasses + '"><div id="' + entry.thoughtId + '" fulltext="' + entry.thoughtText + '" class="' + entry.thoughtClasses + '">' + shorten(entry.thoughtText, 80) + '</div></li>');
        });
        $.mobile.navigate("#deck-edit", {
            transition : "slide"
        });
    };
};

function renderDeck(row) {
    var decks = document.getElementById("decklist");
    var dv = document.createElement("div");
    var a = document.createElement("a");
    var a1 = document.createElement("a");

    var t = document.createTextNode("");
    t.data = row.name;
    console.log(row.thoughts);

    //    a.addEventListener("click", function(e) {
    //        thoughtDeckStorage.indexedDB.deleteDeck(row.name);
    //    });

    a1.addEventListener("click", function(e) {
        thoughtDeckStorage.indexedDB.getDeckItemsByName(row.name);
    });

    a1.textContent = t.data;
    dv.appendChild(a1);
    dv.classList.add("deckimage");

    $("#decklist").owlCarousel({
        itemsCustom : [[0, 2], [450, 4], [600, 7], [700, 9], [1000, 10], [1200, 12], [1400, 13], [1600, 15]],
        navigation : false
    });
    $("#decklist").data('owlCarousel').addItem(dv);

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
    $(".thought-default").each(function(index) {
        var obThought = {};

        obThought.thoughtId = $(this).attr('id');
        obThought.thoughtText = $(this).attr('fulltext');
        obThought.thoughtClasses = $(this).attr('class');
        obThought.liClasses = $(this).parent().attr('class');

        console.log('Adding:' + JSON.stringify(obThought));

        arThoughts.push(obThought);

    });

    thoughtDeckStorage.indexedDB.addDeck(deck.innerHTML, tags.value.split(" "), desc.value, JSON.stringify(arThoughts));

    clearDeck();
}




//Create the autocomplete
$(function() {
    $("#searchDecks").autocomplete({
        source: function( request, response ) {
            
            console.log("Going to look for " + request.term);
    
            var db = thoughtDeckStorage.indexedDB.db;
            var trans = db.transaction(["deck"], "readonly");
            var store = trans.objectStore("deck");
            var result = [];
            trans.oncomplete = function(event) {
                response(result);
            };
        
            // Get everything in the store;
            var keyRange = IDBKeyRange.bound(request.term.toLowerCase(), request.term.toLowerCase() + "z");
            var index = store.index("lcname");
            var cursorRequest = index.openCursor(keyRange);
    
            cursorRequest.onsuccess = function(e) {
                var r = e.target.result;
                if (!!r == false)
                    return;
        
                result.push(r.value.name);
                r.continue();
            };
    
            cursorRequest.onerror = thoughtDeckStorage.indexedDB.onerror;     
        },
        minLength:2,
        select:function(event,ui) {
            alert('test');
        }
    });
});
