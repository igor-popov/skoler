
		var initialization = function(){
			$.cookie.json = true;

		}();

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
			var osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 30, attribution: osmAttrib});	

			var map = L.map('map');

			var center = $.cookie('map_center');
			var zoom = $.cookie('map_zoom'); 

			if (center === undefined || undefined === zoom){
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
		

		$(function(){
			function autoResizeDiv()  {
	        	//required because map wants some nice px instead of % during initialization
	            $('#map').css('height','100%');
	            $('#map').css('width','100%');
	        }

	        autoResizeDiv();

			var map = initializeMap();
			
			var initializeEachGeoJsonFeature = function (feature, layer) {

					    if (feature.properties && feature.properties.school_name) {

					    	var jsonDataParser = new JsonDataParser();

					    	var properties = feature.properties;
					    	var popupText = '<table class="map-popup table table-striped table-hover table-condensed">'
					    	popupText += '<tr><td>Navn</td><td>' + properties.school_name + '</td></tr>';
					    	popupText += '<tr><td>Adresse</td><td>' + properties.address + '</td></tr>';
					    	popupText += '<tr><td>Kommune</td><td>' + properties.kommune  + '</td></tr></table>';

					    	var ratingsByYearClassAndSubject = jsonDataParser.groupRatingsByCategories(properties);

					    	for (var year in ratingsByYearClassAndSubject){
					    		var yearRatingText = '<h3>' + year + '</h3>' + '<br><table class="map-popup table table-striped table-hover table-condensed">';

					    		var yearData = ratingsByYearClassAndSubject[year];

					    		var subjectNames = jsonDataParser.collectSubjects(yearData);

					    		yearRatingText += '<thead><tr>';

					    		yearRatingText += '<th>klasse</th>';

								for (var i = 0; i < subjectNames.length; i++){
									var subjectName = subjectNames[i];
				    				yearRatingText += '<th>' + subjectName + '</th>';
					    		}

					    		yearRatingText += '</tr></thead>';

					    		yearRatingText += '<tbody>';

					    		for (var className in yearData){
					    			var classData = yearData[className];
					    			
									yearRatingText += '<tr>'

									yearRatingText += '<td><strong>' + jsonDataParser.trimClassLiteral(className) + '</strong></td>';

					    			for (var i = 0; i < subjectNames.length; i++){
					    				var ratingValue = classData[subjectNames[i]];
					    				if (ratingValue !== undefined){
					    					yearRatingText += '<td>' + ratingValue + '</td>';
					    				}
					    				else{
					    					yearRatingText += '<td></td>';
					    				}
					    			}
					    			yearRatingText += '</tr>'
					    		}

					    		yearRatingText += "</tbody></table>"
					    		popupText += yearRatingText;
					    	}

					    	layer.bindPopup(popupText);
					    }
					}

			var schoolLayer;

			

			var loadSchoolDataAsGeoJson = function(data, targetMap)
			{
				var geojsonMarkerOptions = {
							    radius: 8,
							    fillColor: "#ff7800",
							    color: "#000",
							    weight: 1,
							    opacity: 1,
							    fillOpacity: 0.8
							};

				schoolLayer = L.geoJson(data, {
					    onEachFeature: initializeEachGeoJsonFeature,
					    pointToLayer: function (feature, latlng) {
						        return L.circleMarker(latlng, geojsonMarkerOptions);
						    }
						}).addTo(targetMap);
			}

			var loadGrunnskoler = function(){
				$.get("./json/grunskoler.geojson", function(data){

					loadSchoolDataAsGeoJson(data, map);
					
					$("#show_ungdomskoler").parent("li").removeClass("active");
					$("#show_grunnskoler").parent("li").addClass("active");
				})
				.fail(function(jqXHR, message){
					alert("No data for schools:" + message);
				});
			}

			var loadUngdomskoler = function(){
				$.get("./json/ungdomskoler.geojson", function(data){

					loadSchoolDataAsGeoJson(data, map);
					
					$("#show_ungdomskoler").parent("li").addClass("active");
					$("#show_grunnskoler").parent("li").removeClass("active");

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

				if ($("#show_grunnskoler").parent("li").hasClass("active"))
					return;

				clearGeoJsonLayers();
				loadGrunnskoler();
			});

			$("#show_ungdomskoler").click(function(){

				if ($("#show_ungdomskoler").parent("li").hasClass("active"))
					return;

				clearGeoJsonLayers();
				loadUngdomskoler();
			});

			loadGrunnskoler();

		});

		