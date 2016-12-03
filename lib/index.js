var DecatIndex = function(options) {
		var decatIndex = {};
		var ref = options.ref;
		var fieldsToIndex = options.fieldsToIndex;
		var fieldsToStore = options.fieldsToStore;
		var index = options.index || {};
		var store = options.store || {};
		var dictionary = new Set();
		var fuzzySet = (options.dictionary && options.dictionary.size > 0) ? FuzzySet(Array.from(options.dictionary)) : FuzzySet();

	decatIndex.getFromIndex = function(term){
		return index[term]
	};

	decatIndex.indexDoc = function(doc) {
		for (var key in doc) {
			if (doc.hasOwnProperty(key) && fieldsToIndex.indexOf(key) != -1 && key !== ref) {
				var tokens = doc[key].split(" ").map(function(token){
					return token.toLowerCase();
				});
				tokens.forEach(function(token){
					var documentId = parseInt(doc[ref]);
					dictionary.add(token);
					fuzzySet.add(token);
					var existingValues = index[token];
					if(existingValues === undefined){
						index[token] = [documentId];
						return;
					}
					var docsId = index[token];
					var newList = addTermToCompressedArray(docsId,documentId);
					index[token] = newList;
				});
			}

			if (doc.hasOwnProperty(key) && fieldsToStore.indexOf(key) != -1 && key !== ref) {
				if(!store[ref]) store[ref] = {}
				store[ref][key] =  doc[key]
			}
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

	decatIndex.search = function(str){
		var documentsByToken = [];
		var tokens = str.split(" ").map(function(element){
			return element.toLowerCase();
		});
		tokens.forEach(function(token){
			var fuzzySetResults = fuzzySet.get(token);
			if(fuzzySetResults !== null) {
				documentsByToken.push(unCompressed(index[fuzzySetResults[0][1]]));
			} else {
				documentsByToken.push([]);
			}
		});

		if(documentsByToken.length == 0) return [];

		var finalResult = documentsByToken.reduce(function(previous,current){
				return previous.filter(function(e){
					if(current.indexOf(e) != -1) return true;
				});
		});

		return finalResult;
	};

	decatIndex.toJson = function(){
		return {
			ref : ref,
			index : index,
			store : store,
			fieldsToIndex : fieldsToIndex,
			fieldsToStore : fieldsToStore,
			dictionary : dictionary
		}
	};

	decatIndex.load = function(serializedIndex){
		var indexFromJson = JSON.parse(serializedIndex);
		return new DecatIndex({
			ref : indexFromJson.ref,
			index : indexFromJson.index,
			store : indexFromJson.store,
			fieldsToStore : indexFromJson.fieldsToStore,
			fieldsToIndex : indexFromJson.fieldsToIndex,
			dictionary : indexFromJson.dictionary
		});
	};
	return decatIndex;
	};
