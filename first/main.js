$(function() {
    $( "#slider" ).slider({
      value:20,
      min: 6,
      max: 100,
      step: 1,
      slide: function( event, ui ) {
        $( "#age-slider" ).val(ui.value );
      }
    });
    $( "#age-slider" ).val($( "#slider" ).slider( "value" ) );
  });