
		var initialization = function(){
			$.cookie.json = true;

		}();

		$(function(){
			var map = initializeMap();
			
			var initializeEachGeoJsonFeature = function (feature, layer) {
					    
					    if (feature.properties && feature.properties.school_name) {
					    	var properties = feature.properties;
					    	var popupText = '<table><tr><td>Navn</td><td>' + properties.school_name + 
					    		'</td></tr><tr><td>Adresse</td><td>' + properties.address + 
					    		'</td></tr><tr><td>Kommune</td><td>' + properties.kommune;

					    	var ratingNamePrefix = 'rating_';

					    	for (var name in properties){
					    		console.log(name);
					    		if (name.substring(0, ratingNamePrefix.length) !== 'rating_'){
					    			continue;
					    		}

					    		var ratingValue = properties[name];
					    		popupText += '</td></tr><tr><td>'+ name.substring(ratingNamePrefix.length) + '</td><td>' + ratingValue;
					    	}

					    	popupText += '</td></tr></table>'

					    	layer.bindPopup(popupText);
					    }
					}

			var schoolLayer;

			var loadGrunnskoler = function(){
				$.get("/skoler/json/grunskoler.geojson", function(data){
					schoolLayer = L.geoJson(data, {
					    onEachFeature: initializeEachGeoJsonFeature
					}).addTo(map);

				})
				.fail(function(jqXHR, message){
					alert("No data for schools:" + message);
				});
			}

			var loadUngdomskoler = function(){
				$.get("/skoler/json/ungdomskoler.geojson", function(data){
					schoolLayer = L.geoJson(data, {
					    onEachFeature: initializeEachGeoJsonFeature
					}).addTo(map);

				})
				.fail(function(jqXHR, message){
					alert("No data for schools:" + message);
					return undefined;
				});
			}

			var clearGeoJsonLayers = function(){
				if (schoolLayer !== undefined)
				{
					map.removeLayer(schoolLayer);
					schoolLayer = undefined;
				}
			}


			$("#show_grunnskoler").click(function(){
				clearGeoJsonLayers();
				loadGrunnskoler();
			});

			$("#show_ungdomskoler").click(function(){
				clearGeoJsonLayers();
				loadUngdomskoler();
			});

			loadGrunnskoler();

		});

		var onMapExtentChanged = function(type, target){
			var self = this;
			var center = self.getCenter();
			var zoom = self.getZoom();

			$.cookie('map_center', center);
			$.cookie('map_zoom', zoom);

		};

		var initializeMap = function(){
			var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
			var osmAttrib='Map data © OpenStreetMap  contributors';
			var osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 15, attribution: osmAttrib});	

			var map = L.map('map');

			var center = $.cookie('map_center');
			var zoom = $.cookie('map_zoom'); 

			if (center === undefined || center === zoom){
				map.fitBounds([[54, 10], [72, 15]]);//.setView({center:{lat: 65, lng: 15}, zoom:130});
			}
			else{
				map.setView(center, zoom);
			}
			
			map.addLayer(osm);	

			$(map).bind("moveend", onMapExtentChanged);
			$(map).bind("zoomend", onMapExtentChanged);
			$(map).bind("dragend", onMapExtentChanged);
			

			return map;
		}