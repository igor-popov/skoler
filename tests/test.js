test( "Q unit test", function() {
  ok( 1 == "1", "Passed!" );
});

test ("Having class prefix in class name trimClassLiteral removes it", function(){
	var className = "Klass 6";
	var jsonDataParser = new JsonDataParser();

	var trimmedClassName = jsonDataParser.trimClassLiteral(className);

	ok(trimmedClassName === "6", "Expected '6' but was " + trimmedClassName);
});

test ("Having small class prefix in class name trimClassLiteral removes it", function(){
	var className = "klass 6";
	var jsonDataParser = new JsonDataParser();
	var trimmedClassName = jsonDataParser.trimClassLiteral(className);

	ok(trimmedClassName === "6", "Expected '6' but was " + trimmedClassName);
});

test ("Having no class prefix in class name trimClassLiteral keeps it", function(){
	var className = "just 6";
	var jsonDataParser = new JsonDataParser();
	var trimmedClassName = jsonDataParser.trimClassLiteral(className);

	ok(trimmedClassName === className, "Expected '" + className + "' but was " + trimmedClassName);
});