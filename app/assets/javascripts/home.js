var LOCATIONS = {
  'porto': {lat: 41.165432, lng: -8.629065},
  'lisbon': {lat: 38.728876, lng: -9.138234}
}
var CUSTOM_MAP_STYLES = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];

document.addEventListener("turbolinks:load", function() {
  startGMaps();
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var city = this.id.split('-')[0];
    showTab(city)
  });
});

function startGMaps(){
  var defaultCity = "porto";
  async('maps.googleapis.com/maps/api/js?key=AIzaSyBSuC-_fpdtL7xCl1jWperw8d71Ce9jIeU', function() {
    showTab(defaultCity);
  });
}

function showTab(city){
  $('#'+city+'-map').html("");
  var map = new google.maps.Map(document.getElementById(city+'-map'), {
    center: LOCATIONS[city],
    zoom: 12,
    styles: CUSTOM_MAP_STYLES,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true
  });
}
