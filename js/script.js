/* Author:

 */

$("select:has(option[value=]:first-child)").on('change', function() {
    $(this).toggleClass("empty", $.inArray($(this).val(), ['', null]) >= 0);
}).trigger('change');

var $cnt = 1;
$(document).ready($(function() {
    $('.newNoteButton').on('click', function() {
        $cnt++;
        $('#sortable').append('<li id="li' + $cnt + '" class="li-default' + ' ' + $('#imp').val() + '"><div id="note' + $cnt + '" class="note-default ' + $('#ntype').val() + '">' + $('#note').val() + '</div></li>');
        $('#ntype').val("");
        $('#imp').val("");
        $('#note').val("");
        $(".note-default").more({length: 100,
                                 moreText: 'show', lessText: 'hide'});
    });
}));


$(function() {
    $("#sortable").sortable({
        placeholder : "ui-state-highlight"
    });
    $("#sortable").disableSelection();
});

$(document).ready($(function() {
    $('.cancelMarkupButton').on('click', function() {
        $("#newMarkupContainer").hide();
    });
}));

toolboxStorage = {};
toolboxStorage.indexedDB = {};

toolboxStorage.indexedDB.db = null;

toolboxStorage.indexedDB.open = function() {
    var version = 1;
    var request = indexedDB.open("lessons", version);

    // We can only create Object stores in a versionchange transaction.
    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = toolboxStorage.indexedDB.onerror;

        if (db.objectStoreNames.contains("lesson")) {
            db.deleteObjectStore("lesson");
        }

        var store = db.createObjectStore("lesson", {
            keyPath : "name"
        });
    };

    request.onsuccess = function(e) {
        toolboxStorage.indexedDB.db = e.target.result;
        toolboxStorage.indexedDB.getAllLessonItems();
    };

    request.onerror = toolboxStorage.indexedDB.onerror;
};

toolboxStorage.indexedDB.addLesson = function(lessonText, tags, desc, notes) {
    var db = toolboxStorage.indexedDB.db;
    var trans = db.transaction(["lesson"], "readwrite");
    var store = trans.objectStore("lesson");
    var request = store.put({
        "name" : lessonText,
        "tags" : tags,
        "desc" : desc,
        "notes" : notes,
        "timeStamp" : new Date().getTime()
    });

    request.onsuccess = function(e) {
        // Re-render all the lesson's
        toolboxStorage.indexedDB.getAllLessonItems();
    };

    request.onerror = function(e) {
        console.log(e.value);
    };
};

toolboxStorage.indexedDB.getAllLessonItems = function() {
    var lessons = document.getElementById("lessonList");
    lessons.innerHTML = "";

    var db = toolboxStorage.indexedDB.db;
    var trans = db.transaction(["lesson"], "readwrite");
    var store = trans.objectStore("lesson");

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if (!!result == false)
            return;

        renderLesson(result.value);
        result.continue();
    };

    cursorRequest.onerror = toolboxStorage.indexedDB.onerror;
};


toolboxStorage.indexedDB.getLessonItemsByName = function(name)  {
    clearLesson();
    var db = toolboxStorage.indexedDB.db;
    var trans = db.transaction(["lesson"], "readwrite");
    var store = trans.objectStore("lesson");
    var request = store.get(name);
    request.onerror = function(event) {
      // Handle errors!
    };
    request.onsuccess = function(event) {
      // Do something with the request.result!
      var lesson = document.getElementById('lname');
      var tags = document.getElementById('tags');
      var desc = document.getElementById('desc'); 

      var notes = [];
      lesson.value = request.result.name;
      tags.value = request.result.tags;
      desc.value = request.result.desc;
      notes = JSON.parse(request.result.notes);
 
      console.log('retrived notes:' + request.result.notes);
      
      notes.forEach(function(entry) {
        console.log('note:' + entry.noteText);
        $('#sortable').append('<li id="' + entry.noteId + '" class="' + entry.liClasses + '"><div id="note' + $cnt + '" class="' + entry.noteClasses + '">' + entry.noteText + '</div></li>');
        
      });
      $.mobile.navigate( "#note-edit", { transition : "slide", info: "info about the #bar hash" });
    };
};


function renderLesson(row) {
    var lessons = document.getElementById("lessonList");
    var li = document.createElement("li");
    var a = document.createElement("a");
    var a1 = document.createElement("a");

    var t = document.createTextNode("");
    t.data = row.name;
    console.log(row.notes);

    a.addEventListener("click", function(e) {
        toolboxStorage.indexedDB.deleteLesson(row.name);
    });
    
    a1.addEventListener("click", function(e) {
        toolboxStorage.indexedDB.getLessonItemsByName(row.name);
    });
 

    a.textContent = " [Delete]";
    a1.textContent = t.data;
    li.appendChild(a1);
    li.appendChild(a);
    lessons.appendChild(li);
}

toolboxStorage.indexedDB.deleteLesson = function(id) {
    var db = toolboxStorage.indexedDB.db;
    var trans = db.transaction(["lesson"], "readwrite");
    var store = trans.objectStore("lesson");

    var request = store.delete(id);

    request.onsuccess = function(e) {
        toolboxStorage.indexedDB.getAllLessonItems();
    };

    request.onerror = function(e) {
        console.log("Error Adding: ", e);
    };
};

function init() {
    toolboxStorage.indexedDB.open();
    // open displays the data previously saved
}

window.addEventListener("DOMContentLoaded", init, false);

function addLesson() {
    var lesson = document.getElementById('lname');
    var tags = document.getElementById('tags');
    var desc = document.getElementById('desc');        
    
    if (lesson === null) {
        alert("Specify Lesson Name");
        return;
    }
    var arNotes = [];
    $( ".note-default" ).each(function( index ) {
        var obNote = {};  

        obNote.noteId = $( this ).attr('id');
        obNote.noteText = $( this ).html();
        obNote.noteClasses = $( this ).attr('class');
        obNote.liClasses = $( this ).parent().attr('class');

        console.log('Adding:' + JSON.stringify(obNote));

        arNotes.push(obNote);

    });
    
    toolboxStorage.indexedDB.addLesson(lesson.value, tags.value, desc.value, JSON.stringify(arNotes));
    
    clearLesson();
}

function clearLesson() {
    var lesson = document.getElementById('lname');
    var tags = document.getElementById('tags');
    var desc = document.getElementById('desc');    
 
    $('.li-default').remove();

    lesson.value = '';
    tags.value = '';
    desc.value = '';       
}

function newLesson() {
    clearLesson();
    $.mobile.navigate( "#note-edit", { transition : "slide", info: "info about the #bar hash" });
}
