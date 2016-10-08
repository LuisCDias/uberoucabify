var LOCATIONS = {
  'porto': {lat: 41.165432, lng: -8.629065},
  'lisbon': {lat: 38.728876, lng: -9.138234}
}
var CUSTOM_MAP_STYLES = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];

document.addEventListener("turbolinks:load", function() {
  var phonePictureIntervalId = setInterval(function(){
    $('.picture-container').toggleClass('showing-second-image');
  }, 1500);

  $('.picture-container')
  .on('mouseover',function(){
    console.log("over");
    clearInterval(phonePictureIntervalId);
  })
  .on('mousedown touchstart',function(){
    $('.picture-container').toggleClass('showing-second-image');
  })

  startGMaps();
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var city = this.id.split('-')[0];
    showTab(city)
  });

  $('.js-calculate-cost').on('click',function(e){
    e.preventDefault();
    var fromInput = document.getElementById('place-from-input');
    var toInput   = document.getElementById('place-to-input');
    if(fromInput.value == "" || toInput.value == ""){
      fromInput.value == "" ? fromInput.focus() : toInput.focus();
      return false;
    }
  })
});

function startGMaps(){
  var defaultCity = "porto";
  async('maps.googleapis.com/maps/api/js?key=AIzaSyBSuC-_fpdtL7xCl1jWperw8d71Ce9jIeU&libraries=places', function() {
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
    mapTypeControl: false,
    streetViewControl: false
  });
  loadPlacesSearch(map);
}

function loadPlacesSearch(map){
  // Create the search box and link it to the UI element.
  var fromInput = document.getElementById('place-from-input');
  var toInput   = document.getElementById('place-to-input');
  var calculateButton = document.getElementById('calculate-cost-button');
  var fromSearchBox = new google.maps.places.SearchBox(fromInput);
  var toSearchBox = new google.maps.places.SearchBox(toInput);
  // TODO do something with toSearchBox
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(fromInput);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(toInput);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(calculateButton);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    fromSearchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  fromSearchBox.addListener('places_changed', function() {
    var places = fromSearchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}
