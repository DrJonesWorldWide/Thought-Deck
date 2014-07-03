
$(document).bind("mobileinit", function() {
    $.event.special.tap.tapholdThreshold = 750;
    $.event.special.tap.emitTapOnTaphold = false;
});

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
        $(".thought-default").more({
            length : 80,
            moreText : '<span style="text-shadow:none;color:gray;">more</span>',
            lessText : '<span style="text-shadow:none;color:gray;">less</span>'
        });
    });
}));


$(function() {
    $("#sortable").sortable();
    $("#sortable").sortable('disable');
    $("#sortable").disableSelection();

/*
    $(".thought-default").on("click", function() {
        $('#thought_id').val($(this).attr("id"));
        $('#thought').val($(this).attr("id"));
        $("#fireThoughtBubble").click();
    });
*/ 

/*
    $( "#sortable" ).bind( "sortstop", function(event, ui) {    
        if (Math.abs(ui.offset.top - ui.originalPosition.top)>35){
            $(this).sortable();
        }
    });
*/   

  $( "#sortable" ).on( "taphold", tapholdHandler );
 
  // Callback function references the event target and adds the 'swiperight' class to it
  function tapholdHandler( event ){
    $('#sortable').sortable('enable');
    $( event.target ).parent().addClass( "glow" );
  }


  $( "#sortable" ).bind( "sortstop", function(event, ui) {    
    $('#sortable').sortable('disable');
    //alert(ui.item[0].attr("class"));
    $('.li-default').removeClass( "glow" );
  });

    // Bind the swiperightHandler callback function to the swipe event on div.box
  $( "#sortable" ).on( "swiperight", swiperightHandler );
 
  // Callback function references the event target and adds the 'swiperight' class to it
  function swiperightHandler( event, ui ){
    if($( event.target ).parent().hasClass( "maj_imp" )) {
        $( event.target ).parent().removeClass( "maj_imp" );
        $( event.target ).parent().addClass( "reg_imp" );        
    } else if($( event.target ).parent().hasClass( "reg_imp" )) {
        $( event.target ).parent().removeClass( "reg_imp" );
        $( event.target ).parent().addClass( "min_imp" );        
        
    }
  }

    // Bind the swiperightHandler callback function to the swipe event on div.box
  $( "#sortable" ).on( "swipeleft", swipeleftHandler );
 
  // Callback function references the event target and adds the 'swiperight' class to it
  function swipeleftHandler( event, ui ){
    if($( event.target ).parent().hasClass( "min_imp" )) {
        $( event.target ).parent().removeClass("min_imp");
        $( event.target ).parent().addClass( "reg_imp" );        
    } else if($( event.target ).parent().hasClass("reg_imp")) {
        $( event.target ).parent().removeClass( "reg_imp" );
        $( event.target ).parent().addClass( "maj_imp" );        
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
    $.mobile.navigate("#thought-edit", {
        transition : "slide",
        info : "info about the #bar hash"
    });
}

