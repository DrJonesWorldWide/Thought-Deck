/* Author: 

*/


$("select:has(option[value=]:first-child)").on('change', function() {
  $(this).toggleClass("empty", $.inArray($(this).val(), ['', null]) >= 0);
}).trigger('change');

var $cnt=1;
$(document).ready(
    $(function () {
        $('.newNoteButton').on('click', function () {
            $cnt++;
            $('#sortable').append('<li id="li' + $cnt + '" class="li-default' + ' ' + $('#imp').val() + '"><div id="note' + $cnt + '" class="note-default ' + $('#ntype').val() + '">' + $('#note').val() + '<p><a href="#" del-ref="li' + $cnt + '" data-icon="delete"></a></p></li>') ;                         
        $('#ntype').val("");
        $('#imp').val("");
        $('#note').val("");
        });
    })
);

 $(function() {
$( "#sortable" ).sortable({
placeholder: "ui-state-highlight"
});
$( "#sortable" ).disableSelection();
});

$(document).ready(
$(function () {
    $('.cancelMarkupButton').on('click', function () {
        $("#newMarkupContainer").hide();
    });
}));



















