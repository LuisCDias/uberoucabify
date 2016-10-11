var LOCATIONS = { 'porto': {lat: 41.165432, lng: -8.629065}, 'lisbon': {lat: 38.728876, lng: -9.138234} };
var CUSTOM_MAP_STYLES = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"latdscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];
var markers = {};
var directionsDisplay;
var directionsService;
var map;
var slat;
var slon;
var dlat;
var dlon;

document.addEventListener("turbolinks:load", function() {
  var phonePictureIntervalId = setInterval(togglePhoneImage, 1500);
  setTimeout(function(){
    clearInterval(phonePictureIntervalId);
  }, 3000);

  $('.picture-container')
  .on('mouseover',function(){
    togglePhoneImage();
    phonePictureIntervalId = setInterval(togglePhoneImage, 1500);
  })
  .on('mouseout',function(){
    clearInterval(phonePictureIntervalId);
  });

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
    $('#results > .fa-spin').show();
    calcRoute(fromInput.value,toInput.value);
    launchResultsModal(fromInput.value,toInput.value);
  });

  $('#results')
  .on('click','.close',function(){
    $('#results').hide();
    $('.result-information > #winner').html("");
    $('.result-information > #price').html("");
    $('#results > .result-switcher').hide();
    $('#results > .result-information').hide();
  })
  .on('click','#new-search',function(){
    $('#results > .close').click();
    clearMapdata();
  })
  .on('change','input[name=results]',function(){
    var selected = $('input[name=results]:checked');
    // Text should announce as winner
    if(selected.val() == selected.data('winner')){
      $('.result-information > #winner').html("Deves escolher ir de <strong>" + selected.val().capitalizeFirstLetter() + "</strong>");
      $('.result-information > #price').html(selected.data('estimate'));
    }
    else{
      $('.result-information > #winner').html("É melhor ir de <strong>" + selected.val().capitalizeFirstLetter() + "</strong> que de táxi.");
      $('.result-information > #price').html(selected.data('estimate'));
    }
    // Price is set independently of winner
  });


  $('.fb-share, .twitter-share-button, .plus-share').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
    return false;
  });
});

function togglePhoneImage(){
  $('.picture-container').toggleClass('showing-second-image');
}

function startGMaps(){
  var defaultCity = $('.tab-pane.active').attr('id');
  async('maps.googleapis.com/maps/api/js?key=AIzaSyBSuC-_fpdtL7xCl1jWperw8d71Ce9jIeU&libraries=places', function() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({preserveViewport: true});
    showTab(defaultCity);
  });
}

function showTab(city){
  $('#place-from-input').val("");
  $('#place-to-input').val("");
  $('#'+city+'-map').html("");
  map = new google.maps.Map(document.getElementById(city+'-map'), {
    center: LOCATIONS[city],
    zoom: 13,
    styles: CUSTOM_MAP_STYLES,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    scrollwheel: false,
    minZoom: 13,
    maxZoom: 17,
    panControl: true
  });
  directionsDisplay.setMap(map);
  loadPlacesSearch();
}

function loadPlacesSearch(){
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
    toSearchBox.setBounds(map.getBounds());
  });


  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  fromSearchBox.addListener('places_changed', function() {
    var places = fromSearchBox.getPlaces();
    if (places.length == 0) return;

    // For each place, get the icon, name and location.
    place = places[0];
    setMarkerToPlace(place,'from');
  });
  toSearchBox.addListener('places_changed', function() {
    var places = toSearchBox.getPlaces();
    if (places.length == 0) return;

    // For each place, get the icon, name and location.
    place = places[0];
    setMarkerToPlace(place,'to');
  });
}

function setMarkerToPlace(place,markerKey){
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

  // Clear out the old marker if exists.
  if(markers[markerKey])
    markers[markerKey].setMap(null);

  // Create a marker for each place.
  markers[markerKey] = new google.maps.Marker({
    map: map,
    title: place.name,
    position: place.geometry.location
  });

  if(markerKey == "from"){
    slat = place.geometry.location.lat();
    slon = place.geometry.location.lng();
  }
  else{
    dlat = place.geometry.location.lat();
    dlon = place.geometry.location.lng();
  }

  var bounds = new google.maps.LatLngBounds();

  for(var key in markers){
    bounds.extend(markers[key].getPosition());
  }

  map.fitBounds(bounds);
  map.panToBounds(bounds);

  if(Object.keys(markers).length == 2)
    $('.js-calculate-cost').removeClass('disabled');
  else
    $('.js-calculate-cost').addClass('disabled');
}

function calcRoute(start,end) {
  var request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING'
  };

  for(var key in markers){
    markers[key].setMap(null);
  }

  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });
}

function launchResultsModal(start,end){
 $('#results').show();
  var data = { slat: slat, slon: slon, dlat: dlat, dlon: dlon };
  $.post('/results',data)
  .done(function(result){
    $('#results > .fa-spin').hide();
    showResult(result);
    console.log(result);
    $('#result-uber').data(result.uber).data('winner',result.winner.name);
    $('#result-cabify').data(result.cabify).data('winner',result.winner.name);
  })
  .fail(function(){

  })
}

function showResult(result){
  $("#result-"+result.winner.name).prop("checked", true);
  $('.result-information > #winner').html("Deves escolher ir de <strong>" + result.winner.name.capitalizeFirstLetter() + "</strong>");
  $('.result-information > #price').html(result.winner.estimate);
  $('#results > .result-switcher').show();
  $('#results > .result-information').show();
  $('#results > .additional-information').show();
}

function clearMapdata(){
  var fromInput = document.getElementById('place-from-input');
  var toInput   = document.getElementById('place-to-input');
  fromInput.value = ""
  toInput.value = ""

  for(var key in markers){
    markers[key].setMap(null);
  }
  directionsDisplay.setMap(null);
}
