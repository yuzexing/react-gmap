
export function loadJS(key){
  if(key) {
    key = '&key='+key;
  }else {
    key = '';
  }
  if(window.loadPromise) {
    return window.loadPromise;
  } else {
    const loadPromise = new Promise((resolve, reject) => {
      let s = document.createElement('script');
      s.src = 'http://ditu.google.cn/maps/api/js?libraries=places'+key;
      s.onload = resolve;
      s.onerror = reject;
      let x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    });
    window.loadPromise = loadPromise;
    return loadPromise;
  }
}

export function geocode(options, callback) {
  if(window.google) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(options, callback);
  } else {
    loadJS().then(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(options, callback);
    })
  }
}

export function latLng(lat, lng) {
  return new google.maps.LatLng(lat, lng);
}

export function fitMap(map, options) {
  if(!options.coords || options.coords.lenght == 0) {
    return;
  }
  let coords = options.coords;
  fitBounds(map, coords);

  const leftTop = function(coords) {
    let lats = [],lngs = [];

    coords.forEach((coord) => {
      lats.push(parseFloat(coord.lat));
      lngs.push(parseFloat(coord.lng));
    })

    return {left: Math.min.apply(null,lngs), top: Math.max.apply(null,lats)};
  }

  const projCb = function(proj) {
    const defaultPix = {x: 0, y: 0};
    const pix = options.pix || defaultPix;
    const c1 = new google.maps.Point(0, 0);
    const c2 = new google.maps.Point(pix.x, pix.y);

    const coord1 = proj.fromContainerPixelToLatLng(c1);
    const coord2 = proj.fromContainerPixelToLatLng(c2);

    const offset = {left: coord2.lng() - coord1.lng(), top: coord2.lat() - coord1.lat()};

    coords.push({lat: leftTop(coords).top - offset.top, lng: leftTop(coords).left - offset.left});
    fitBounds(map, coords);
  }

  latToCoords(map, projCb);
}

function fitBounds(map, coords) {
  if(!window.google) {
    return;
  }
  let bounds = new google.maps.LatLngBounds();
  coords && coords.forEach((coord) => {
    bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
  })
  map.fitBounds(bounds);
}

function latToCoords(map, callback) {
  if(!window.google) {
    return;
  }
  let ov;
  function OV(map) {
    this.setMap(map);
  }
  OV.prototype = new google.maps.OverlayView();
  OV.prototype.draw = function() {
    return false;
  }
  OV.prototype.onAdd = function(){
    var proj = this.getProjection();
    callback && callback(proj);
  };
  ov = new OV(map);
}