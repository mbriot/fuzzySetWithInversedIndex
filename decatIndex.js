(function(){

	var Index = function(options) {
		this.ref = options.ref;
		this.fieldsToIndex = options.fieldsToIndex;
		this.fieldsToStore = options.fieldsToStore;
		this.index = options.index || {};
		this.store = options.store || {};
		this.dictionary = new Set();
		this.fuzzySet = (options.dictionary && options.dictionary.size > 0) ? FuzzySet(Array.from(options.dictionary)) : FuzzySet();
	};

	Index.prototype.indexDoc = function(doc) {
		for (var key in doc) {
			if (doc.hasOwnProperty(key) && this.fieldsToIndex.indexOf(key) != -1 && key !== this.ref) {
				var tokens = doc[key].split(" ").map(function(token){
					return token.toLowerCase();
				});
			
				var self = this;
				tokens.forEach(function(token){
					var documentId = parseInt(doc[self.ref]);
					self.dictionary.add(token);
					self.fuzzySet.add(token);
					var existingValues = self.index[token];
					if(existingValues === undefined){
						self.index[token] = [documentId];
						return;
					}
					var docsId = self.index[token];
					var newList = self.addTermToCompressedArray(docsId,documentId);
					self.index[token] = newList;
				});
			}

			if (doc.hasOwnProperty(key) && this.fieldsToStore.indexOf(key) != -1 && key !== this.ref) {
				if(!this.store[this.ref]) this.store[this.ref] = {} 
				this.store[this.ref][key] =  doc[key]
			}
		}
	};

	Index.prototype.addTermToCompressedArray = function(oldList,id){
			var unCompressedArray = this.unCompressedArray(oldList)
			unCompressedArray.push(id)
			var newCompressedArray = [unCompressedArray[0]]
			for(var j = 1;j <unCompressedArray.length;j++){
					newCompressedArray[j] = unCompressedArray[j] - unCompressedArray[j-1]
			}
			return newCompressedArray
	};

	Index.prototype.unCompressedArray = function(oldArray){
		var unCompressedArray = [oldArray[0]];
			for(var i = 1; i<oldArray.length; i++){
				unCompressedArray[i] = oldArray[i] + unCompressedArray[i-1]
			}
		return unCompressedArray
	}

	Index.prototype.search = function(str){
		var documentsByToken = [];
		var tokens = str.split(" ").map(function(element){
			return element.toLowerCase();
		});
		var self = this;
		tokens.forEach(function(token){
			var fuzzySetResults = self.fuzzySet.get(token);
			if(fuzzySetResults !== null) {
				documentsByToken.push(self.unCompressedArray(self.index[fuzzySetResults[0][1]]));
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

	Index.prototype.toJson = function(){
		return {
			ref : this.ref,
			index : this.index,
			store : this.store,
			fieldsToIndex : this.fieldsToIndex,
			fieldsToStore : this.fieldsToStore,
			dictionary : this.dictionary
		}
	};

	Index.prototype.load = function(serializedIndex){
		var indexFromJson = JSON.parse(serializedIndex);
		return new Index({
			ref : indexFromJson.ref,
			index : indexFromJson.index,
			store : indexFromJson.store,
			fieldsToStore : indexFromJson.fieldsToStore,
			fieldsToIndex : indexFromJson.fieldsToIndex,
			dictionary : this.dictionary
		});
	};

	return window.DecatIndex = Index;
})();