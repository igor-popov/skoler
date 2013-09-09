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
			    	return fullClassName.replace(/(K|k)lass[^\s]?/g, '').replace(/^\s+|\s+$/g, '');
			    }
			}
		}