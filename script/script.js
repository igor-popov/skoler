
		var initialization = function(){
			$.cookie.json = true;

		}();

		var JsonDataParser = function()
		{
			return {groupRatingsByCategories : function(properties){
					var ratingNamePrefix = 'rating_';

					var groupedProperties = new Array();

			    	for (var name in properties){
			    		//console.log(name);
			    		if (name.substring(0, ratingNamePrefix.length) !== 'rating_'){
			    			continue;
			    		}

			    		var ratingValue = properties[name];
			    		var ratingNameComponents = name.substring(ratingNamePrefix.length).split('_');

			    		if (ratingNameComponents.length !== 3){
			    			continue;
			    		}

			    		var subject = ratingNameComponents[0];
			    		var year = ratingNameComponents[1];
			    		var className = ratingNameComponents[2];

			    		var yearData = groupedProperties[year];
			    		if (yearData === undefined)
			    			groupedProperties[year] = yearData = new Array();

			    		var classData = yearData[className];

			    		if (classData === undefined)
			    			yearData[className] = classData = new Array();

			    		classData[subject] = properties[name];
			    	}

			    	return groupedProperties;
				},
			collectSubjects : function(yearData){
					var subjectNames = new Array();

		    		for (var className in yearData){
		    			var classData = yearData[className];
		    			
		    			for (var subjectName in classData){
		    				if (subjectNames.indexOf(subjectName) <= -1)
		    				{
		    					subjectNames.push(subjectName);
		    				}
		    			}
		    		}

		    		return subjectNames;
		    	},
			trimClassLiteral : function(fullClassName){					    
			    	return fullClassName.replace(/(^\s+(K|k)lass[^\s]?\s*)|(\s+(K|k)lass[^\s]?\s*$)/g, '');
			    }
			}
		}

		$(function(){
			/*function autoResizeDiv()
	        {
	            $('#main').css('height', window.innerHeight * 0.9 +'px');
	            $('#main').css('width', window.innerWidth +'px');
	        }

	        window.onresize = autoResizeDiv;
	        autoResizeDiv();*/

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
					    		console.log(subjectNames);

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

									yearRatingText += '<td>' + jsonDataParser.trimClassLiteral(className) + '</td>';

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

					    		/*for (var className in yearData){
					    			var classData = yearData[className];
					    			yearRatingText += '<tr><td>' + className + '</td>';
					    			for (var subjectName in classData){
					    				var ratingValue = classData[subjectName];
					    				yearRatingText += '<td>' + ratingValue + '</td>';
					    			}
					    			yearRatingText += '</tr>'
					    		}*/

					    		yearRatingText += "</tbody></table>"
					    		popupText += yearRatingText;
					    	}

					    	layer.bindPopup(popupText);
					    }
					}

			var schoolLayer;

			var loadGrunnskoler = function(){
				$.get("./json/grunskoler.geojson", function(data){
					schoolLayer = L.geoJson(data, {
					    onEachFeature: initializeEachGeoJsonFeature
					}).addTo(map);

					$("#show_ungdomskoler").parent("li").removeClass("active");
					$("#show_grunnskoler").parent("li").addClass("active");
				})
				.fail(function(jqXHR, message){
					alert("No data for schools:" + message);
				});
			}

			var loadUngdomskoler = function(){
				$.get("./json/ungdomskoler.geojson", function(data){
					schoolLayer = L.geoJson(data, {
					    onEachFeature: initializeEachGeoJsonFeature
					}).addTo(map);

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