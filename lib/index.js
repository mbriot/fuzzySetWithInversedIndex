var DecatIndex = function(options) {
		var decatIndex = {};
		var ref = options.ref;
		var integerFieldsToIndex = options.fieldsToIndex
			.filter(function(field){if(field.type == 'integer') return true})
			.map(function(field){return field.name});
		var stringFieldsToIndex = options.fieldsToIndex
			.filter(function(field){if(field.type == 'string') return true})
			.map(function(field){return field.name});
		var fieldsToStore = options.fieldsToStore;
		var index = options.index || {};
		var store = options.store || {};
		var dictionary = new Set();
		var fuzzySet = (options.dictionary && options.dictionary.length > 0) ? FuzzySet(options.dictionary) : FuzzySet();

	decatIndex.getFromIndex = function(term){
		return index[term]
	};

	decatIndex.indexDoc = function(doc) {
		for (var key in doc) {
			if (doc.hasOwnProperty(key)) {
				var fieldName = key;
				var fieldValue = doc[key];
			} else {
				continue;
			}

			if(fieldName == ref) continue;

			if (integerFieldsToIndex.indexOf(fieldName) != -1) {
				fieldValue = parseInt(fieldValue);
				var lowerBound = Math.floor(fieldValue / 10) * 10;
				var upperBound = Math.ceil(fieldValue / 10)  * 10;
				var token = lowerBound + "x" + upperBound;
				var documentId = parseInt(doc[ref]);
				var docsId = index[token];
				if(docsId === undefined){
					index[token] = [documentId];
					return;
				}
				var newCompressedList = addTermToCompressedArray(docsId,documentId);
				index[token] = newCompressedList;
			}

			if (stringFieldsToIndex.indexOf(fieldName) != -1) {
				var tokens = fieldValue.split(" ").map(function(token){
					return token.toLowerCase();
				});
				tokens.forEach(function(token){
					dictionary.add(token);
					fuzzySet.add(token);
					var documentId = parseInt(doc[ref]);
					var docsId = index[token];
					if(docsId === undefined){
						index[token] = [documentId];
						return;
					}
					var newCompressedList = addTermToCompressedArray(docsId,documentId);
					index[token] = newCompressedList;
				});
			}

			if (fieldsToStore.indexOf(key) != -1) {
				if(!store[doc[ref]]) store[doc[ref]] = {}
				store[doc[ref]][key] =  doc[key]
			}
		}
	};

	decatIndex.search = function(str){
		var documentsByToken = [];
		var tokens = str.trim().split(" ").map(function(element){
			return element;
		});
		tokens.forEach(function(token){
			var regex = /.*:.*/;
			var isNumericRangeQuery = regex.test(token);
			if(isNumericRangeQuery){
				// parse query
				// find all bounds
				// process queries and push them
				documentsByToken.push([]);
			} else {
				var fuzzySetResults = fuzzySet.get(token);
				if(fuzzySetResults !== null) {
					documentsByToken.push(unCompressed(index[fuzzySetResults[0][1]]));
				} else {
					documentsByToken.push([]);
				}
			}
		});

		var finalResult = documentsByToken.reduce(function(previous,current){
				return previous.filter(function(e){
					if(current.indexOf(e) != -1) return true;
				});
		});

		return finalResult.map(function(id) {
			var doc = store[id];
			doc[ref] = id;
		  return doc;
		});
	};

	decatIndex.toJson = function(){
		return {
			ref : ref,
			index : index,
			store : store,
			fieldsToIndex : fieldsToIndex,
			fieldsToStore : fieldsToStore,
			dictionary :  Array.from(dictionary)
		}
	};

	var addTermToCompressedArray = function(oldList,id){
			var unCompressedArray = unCompressed(oldList)
			unCompressedArray.push(id)
			var newCompressedArray = [unCompressedArray[0]]
			for(var j = 1;j <unCompressedArray.length;j++){
					newCompressedArray[j] = unCompressedArray[j] - unCompressedArray[j-1]
			}
			return newCompressedArray
	};

	var unCompressed = function(oldArray){
		var unCompressedArray = [oldArray[0]];
			for(var i = 1; i<oldArray.length; i++){
				unCompressedArray[i] = oldArray[i] + unCompressedArray[i-1]
			}
		return unCompressedArray
	}

	return decatIndex;
	};
