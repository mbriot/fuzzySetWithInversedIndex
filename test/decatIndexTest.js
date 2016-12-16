//test multi field numeric range
// split test in different file
// methode d'autocompletion
// add read me avec exemple
// site doc hosté par github
// normalizer : virer accent symbole 
// stop word filter
// porter stemmer (exemple chaussures et chaussure doivent retourner les memme resultat)

QUnit.test( "should be able to find a range of integer", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name:'title',type:'string'},{name:'price',type:'integer'}],
	 fieldsToStore : ['title','price']})
	idx.indexDoc({id:"1",title : "a",price : "5.99"})
	idx.indexDoc({id:"2",title : "b",price : "11"})
	idx.indexDoc({id:"3",title : "c",price : "12.50"})
	idx.indexDoc({id:"4",title : "d",price : "17.9"})
	idx.indexDoc({id:"5",title : "e",price : "22"})

	var results = idx.search("  price:[12:18]  ")

	assert.equal( results.length , 2 )
	assert.equal( results[0].id , 3 )
	assert.equal( results[1].id , 4 )
});

QUnit.test( "should be able to find a range of integer and another string field", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name:'title',type:'string'},{name:'price',type:'integer'}],
	 fieldsToStore : ['title','price']})
	idx.indexDoc({id:"1",title : "a",price : "5.99"})
	idx.indexDoc({id:"2",title : "b",price : "11"})
	idx.indexDoc({id:"3",title : "c",price : "12.50"})
	idx.indexDoc({id:"4",title : "d",price : "17.9"})
	idx.indexDoc({id:"5",title : "e",price : "22"})

	var results = idx.search("price:[0:20] c")

	assert.equal( results.length , 1 )
	assert.equal( results[0].id , 3 )
});

QUnit.test( "search one word that should match", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name:'title',type:'string'}], fieldsToStore : ['author','content']})
	idx.indexDoc({id:"1",title : "about yellow socks",content : "yellow socks are the bests !"})
	idx.indexDoc({id:"2",title : "about red socks",content : "red socks are the bests !"})

	var results = idx.search("red")

	assert.equal( results.length , 1 )
	assert.ok( results[0].id , 2 )
});

QUnit.test( "should match even with wrong case", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name:'title',type:'string'}], fieldsToStore : ['author','content']})
	idx.indexDoc({id:"1",title : "about yElLoW socks",content : "yellow socks are the bests !"})
	idx.indexDoc({id:"2",title : "about red socks",content : "red socks are the bests !"})

	var results = idx.search("yellow")
	assert.equal( results.length , 1 )
	assert.equal( results[0].id , 1 )

	results = idx.search("YeLlOw")
	assert.equal( results.length , 1 )
	assert.equal( results[0].id , 1 )
});

QUnit.test( "search one word with no match", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name : 'title',type : 'string'}], fieldsToStore : ['content']})
	idx.indexDoc({id:"1",title : "toto is not a function",content : "js is a mess !"})

	var results = idx.search("house")

	assert.equal( results.length , 0)
});

QUnit.test( "search with some typing errors that should match", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name : 'title',type : 'string'}], fieldsToStore : ['content']})
	idx.indexDoc({id:"1",title : "undefined is not a function",content : "js is a mess !"})

	var results = idx.search("indifine nit foncssion")

	assert.equal( results.length , 1 )
	assert.equal( results[0].id , 1 )
});

QUnit.test( "search two words one matching but not the other", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name : 'title',type : 'string'}], fieldsToStore : ['content']})
	idx.indexDoc({id:"1",title : "house of pain",content : "what a movie !"})

	var results = idx.search("house mickey")

	assert.equal( results.length , 0 )
});

QUnit.test( "search two words in three docs with only one matching doc", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name : 'title',type : 'string'}], fieldsToStore : ['title']})
	idx.indexDoc({id:"1",title : "house of pain"})
	idx.indexDoc({id:"2",title : "house of mickey"})
	idx.indexDoc({id:"3",title : "horse of mickey"})

	var results = idx.search("house mickey")

	assert.equal( results.length , 1 ) 
	assert.equal( results[0].id , 2 )
});

QUnit.test( "should return docs from store", function( assert ) {
	var idx = new DecatIndex({ref : "testId", fieldsToIndex : [{name : 'title',type : 'string'}], fieldsToStore : ['title','content','author']})
	idx.indexDoc({testId:"1",title : "house of pain",content : "a book about java",author : "manu"})
	idx.indexDoc({testId:"2",title : "house of mickey",content : "a book about css",author : "raphael"})
	idx.indexDoc({testId:"3",title : "house of mickey",content : "a book about javascript",author : "thèrence"})

	var results = idx.search("house")

	assert.equal( results.length , 3)
	assert.equal( results[0].testId , 1 )
	assert.equal( results[0].title, "house of pain" )
	assert.equal( results[0].content , "a book about java" )
	assert.equal( results[0].author , "manu" )
	assert.equal( results[2].testId , 3 )
	assert.equal( results[2].title ,"house of mickey" )
	assert.equal( results[2].content, "a book about javascript" )
	assert.equal( results[2].author , "thèrence" )
});

QUnit.test( "should serialized and rebuild index correctly", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name : 'title',type : 'string'}], fieldsToStore : ['title']})
	idx.indexDoc({id:"1",title : "house of pain"})
	idx.indexDoc({id:"2",title : "house of mickey"})
	idx.indexDoc({id:"3",title : "horse of mickey"})

	var serializedIndex = idx.toJson()
	var newIdx = new DecatIndex({
		ref : serializedIndex.ref,
		index : serializedIndex.index,
		store : serializedIndex.store,
		stringFieldsToIndex : serializedIndex.stringFieldsToIndex,
		integerFieldsToIndex : serializedIndex.integerFieldsToIndex,
		fieldsToStore : serializedIndex.fieldsToStore,
		dictionary : serializedIndex.dictionary
	})
	var results = newIdx.search("house mickey")

	assert.equal( results.length , 1)
	assert.equal( results[0].id , 2 )
});

QUnit.test( "should store doc ref in index with gamma transformation", function( assert ) {
	var idx = new DecatIndex({ref : "id", fieldsToIndex : [{name : 'title',type : 'string'}], fieldsToStore : ['title']})
	idx.indexDoc({id:"1",title : "house"})
	idx.indexDoc({id:"3",title : "house"})
	idx.indexDoc({id:"7",title : "house"})
	idx.indexDoc({id:"12",title : "house"})

	assert.deepEqual(idx.getFromIndex('house'),[1,2,4,5])
	var docs = idx.search("house")
	var ids = docs.map(function(doc){return doc.id})
	assert.deepEqual(ids,[1,3,7,12])
});
