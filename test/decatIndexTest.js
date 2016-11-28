QUnit.test( "search one word that should match", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : ['title'], fieldsToStore : ['author','content']})
	idx.indexDoc({id:"1",title : "about yellow socks",content : "yellow socks are the bests !"})
	idx.indexDoc({id:"2",title : "about red socks",content : "red socks are the bests !"})

	var results = idx.search("red")

	assert.ok( results.length == "1" )
	assert.ok( results[0] == "2" )
});

QUnit.test( "search one word with no match", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : ['title'], fieldsToStore : ['content']})
	idx.indexDoc({id:"1",title : "undefined is not a function",content : "js is a mess !"})
	
	var results = idx.search("house")

	assert.ok( results.length == "0", "Passed!" )
});

QUnit.test( "search with some typing errors that should match", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : ['title'], fieldsToStore : ['content']})
	idx.indexDoc({id:"1",title : "undefined is not a function",content : "js is a mess !"})
	
	var results = idx.search("indifine nit foncssion")

	assert.ok( results.length == "1", "Passed!" )
	assert.ok( results[0] == "1", "Passed!" )
});

QUnit.test( "search two words one matching but not the other", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : ['title'], fieldsToStore : ['content']})
	idx.indexDoc({id:"1",title : "house of pain",content : "what a movie !"})
	
	var results = idx.search("house mickey")

	assert.ok( results.length == "0")
});