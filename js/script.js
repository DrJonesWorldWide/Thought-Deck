$(document).bind("mobileinit", function() {
    $.event.special.tap.tapholdThreshold = 550;
    $.event.special.tap.emitTapOnTaphold = false;
});


var $cnt = 1;
$(document).ready($(function() {
    $('.newThoughtButton').on('click', function() {
        if($("#thought_id").val() != '') {
            $('#' + $("#thought_id").val()).html(shorten($('#thought').html(),80));
            $('#' + $("#thought_id").val()).attr('fulltext',$('#thought').html());

        } else {
            $cnt++;
            $('#sortable').append('<li class="li-default reg_imp"><div id="thought' + $cnt + '" fulltext="'+ $('#thought').html() + '" class="thought-default">' + shorten($('#thought').html(), 80) + '</div></li>');
            $('#thought').html("");
        }
        $("#thought_id").val('');
        $.mobile.changePage( "#deck-edit", { transition: "slideup", changeHash: false });
    });

    $('.cancelThoughtButton').on('click', function() {
        $('#thought').html("");
        $.mobile.changePage( "#deck-edit", { transition: "slideup", changeHash: false });

    });

    const limit = 140;
    var rem = limit - $('#thought').html().length;
    $("#thought").on('input', function () {
        var char = $('#thought').html().length;
        rem = limit - char;
        if (rem < 40) {
            $("#counter").html("Only have <strong>" + rem + "</strong> chars left, if you want to tweet this.");
        }
        console.log(char)
        console.log(rem);
        if(char>140)
        {
            $(".shareThoughtButton").remove();
            $("#counter").html('"Brevity is the soul of wit." -Shakespeare :)');
        }
    });

}));

$(function() {
    $("#sortable").sortable();
    $("#sortable").sortable('disable');
    $("#sortable").disableSelection();

    $('.ui-content').css('padding','0px');


    $("#sorton").on('tap', function() {
           $('#sortable').sortable('enable');
           $('.li-default').addClass("glow");
           $( "#pushPanel" ).panel( "close" );         
    });

    $(".addthought").on('tap', function() {
        $('#thought_id').val('');
        $('#thought').html('');        
        $.mobile.changePage( "#thought-edit", { transition: "slide", changeHash: false });    
    });


    $("#sortable").on("taphold", tapholdHandler);

    // Callback function references the event target and adds the 'swiperight' class to it
    function tapholdHandler(event, ui) {
        $('#thought_id').val($(event.target).attr('id'));
        $('#thought').html($(event.target).attr('fulltext'));
        $.mobile.changePage( "#thought-edit", { transition: "slide", changeHash: false });
    }


    $("#sortable").on("sortstop", function(event, ui) {
        $('#sortable').sortable('disable');
        $('.li-default').removeClass("glow");
    });

    // Bind the swiperightHandler callback function to the swipe event on div.box
    $("#sortable").on("swiperight", swiperightHandler);

    // Callback function references the event target and adds the 'swiperight' class to it
    function swiperightHandler(event, ui) {
        if ($(event.target).parent().hasClass("maj_imp")) {
            $(event.target).parent().removeClass("maj_imp");
            $(event.target).parent().addClass("reg_imp");
        } else if ($(event.target).parent().hasClass("reg_imp")) {
            $(event.target).parent().removeClass("reg_imp");
            $(event.target).parent().addClass("min_imp");
        }
    }

    // Bind the swiperightHandler callback function to the swipe event on div.box
    $("#sortable").on("swipeleft", swipeleftHandler);

    // Callback function references the event target and adds the 'swiperight' class to it
    function swipeleftHandler(event, ui) {
        if ($(event.target).parent().hasClass("min_imp")) {
            $(event.target).parent().removeClass("min_imp");
            $(event.target).parent().addClass("reg_imp");
        } else if ($(event.target).parent().hasClass("reg_imp")) {
            $(event.target).parent().removeClass("reg_imp");
            $(event.target).parent().addClass("maj_imp");
        }
    }
});

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
    $.mobile.navigate("#deck-edit", {
        transition : "slide",
        info : "info about the #bar hash"
    });
}

function shorten(text, maxLength) {
    var ret = text;
    if (ret.length > maxLength) {
        ret = ret.substr(0,maxLength-3) + "...";
    }
    return ret;
}
 
