(function(){
	var FuzzySet = function(arr, useLevenshtein, gramSizeLower, gramSizeUpper) {
	    var fuzzyset = {
	        version: '0.0.1'
	    };

	    // default options
	    arr = arr || [];
	    fuzzyset.gramSizeLower = gramSizeLower || 2;
	    fuzzyset.gramSizeUpper = gramSizeUpper || 3;
	    fuzzyset.useLevenshtein = (typeof useLevenshtein !== 'boolean') ? true : useLevenshtein;

	    // define all the object functions and attributes
	    fuzzyset.exactSet = {};
	    fuzzyset.matchDict = {};
	    fuzzyset.items = {};

	    // helper functions
	    var levenshtein = function(str1, str2) {
	        var current = [], prev, value;

	        for (var i = 0; i <= str2.length; i++)
	            for (var j = 0; j <= str1.length; j++) {
	            if (i && j)
	                if (str1.charAt(j - 1) === str2.charAt(i - 1))
	                value = prev;
	                else
	                value = Math.min(current[j], current[j - 1], prev) + 1;
	            else
	                value = i + j;

	            prev = current[j];
	            current[j] = value;
	            }

	        return current.pop();
	    };

	    // return an edit distance from 0 to 1
	    var _distance = function(str1, str2) {
	        if (str1 === null && str2 === null) throw 'Trying to compare two null values';
	        if (str1 === null || str2 === null) return 0;
	        str1 = String(str1); str2 = String(str2);

	        var distance = levenshtein(str1, str2);
	        if (str1.length > str2.length) {
	            return 1 - distance / str1.length;
	        } else {
	            return 1 - distance / str2.length;
	        }
	    };
	    var _nonWordRe = /[^\w, ]+/;

	    var _iterateGrams = function(value, gramSize) {
	        gramSize = gramSize || 2;
	        var simplified = '-' + value.toLowerCase().replace(_nonWordRe, '') + '-',
	            lenDiff = gramSize - simplified.length,
	            results = [];
	        if (lenDiff > 0) {
	            for (var i = 0; i < lenDiff; ++i) {
	                value += '-';
	            }
	        }
	        for (var i = 0; i < simplified.length - gramSize + 1; ++i) {
	            results.push(simplified.slice(i, i + gramSize));
	        }
	        return results;
	    };

	    var _gramCounter = function(value, gramSize) {
	        // return an object where key=gram, value=number of occurrences
	        gramSize = gramSize || 2;
	        var result = {},
	            grams = _iterateGrams(value, gramSize),
	            i = 0;
	        for (i; i < grams.length; ++i) {
	            if (grams[i] in result) {
	                result[grams[i]] += 1;
	            } else {
	                result[grams[i]] = 1;
	            }
	        }
	        return result;
	    };

	    // the main functions
	    fuzzyset.get = function(value, defaultValue) {
	        // check for value in set, returning defaultValue or null if none found
	        var result = this._get(value);
	        if (!result && typeof defaultValue !== 'undefined') {
	            return defaultValue;
	        }
	        return result;
	    };

	    fuzzyset._get = function(value) {
	        var normalizedValue = this._normalizeStr(value),
	            result = this.exactSet[normalizedValue];
	        if (result) {
	            return [[1, result]];
	        }

	        var results = [];
	        // start with high gram size and if there are no results, go to lower gram sizes
	        for (var gramSize = this.gramSizeUpper; gramSize >= this.gramSizeLower; --gramSize) {
	            results = this.__get(value, gramSize);
	            if (results) {
	                return results;
	            }
	        }
	        return null;
	    };

	    fuzzyset.__get = function(value, gramSize) {
	        var normalizedValue = this._normalizeStr(value),
	            matches = {},
	            gramCounts = _gramCounter(normalizedValue, gramSize),
	            items = this.items[gramSize],
	            sumOfSquareGramCounts = 0,
	            gram,
	            gramCount,
	            i,
	            index,
	            otherGramCount;

	        for (gram in gramCounts) {
	            gramCount = gramCounts[gram];
	            sumOfSquareGramCounts += Math.pow(gramCount, 2);
	            if (gram in this.matchDict) {
	                for (i = 0; i < this.matchDict[gram].length; ++i) {
	                    index = this.matchDict[gram][i][0];
	                    otherGramCount = this.matchDict[gram][i][1];
	                    if (index in matches) {
	                        matches[index] += gramCount * otherGramCount;
	                    } else {
	                        matches[index] = gramCount * otherGramCount;
	                    }
	                }
	            }
	        }

	        function isEmptyObject(obj) {
	            for(var prop in obj) {
	                if(obj.hasOwnProperty(prop))
	                    return false;
	            }
	            return true;
	        }

	        if (isEmptyObject(matches)) {
	            return null;
	        }

	        var vectorNormal = Math.sqrt(sumOfSquareGramCounts),
	            results = [],
	            matchScore;
	        // build a results list of [score, str]
	        for (var matchIndex in matches) {
	            matchScore = matches[matchIndex];
	            results.push([matchScore / (vectorNormal * items[matchIndex][0]), items[matchIndex][1]]);
	        }
	        var sortDescending = function(a, b) {
	            if (a[0] < b[0]) {
	                return 1;
	            } else if (a[0] > b[0]) {
	                return -1;
	            } else {
	                return 0;
	            }
	        };
	        results.sort(sortDescending);
	        if (this.useLevenshtein) {
	            var newResults = [],
	                endIndex = Math.min(50, results.length);
	            // truncate somewhat arbitrarily to 50
	            for (var i = 0; i < endIndex; ++i) {
	                newResults.push([_distance(results[i][1], normalizedValue), results[i][1]]);
	            }
	            results = newResults;
	            results.sort(sortDescending);
	        }
	        var newResults = [];
	        for (var i = 0; i < results.length; ++i) {
	            if (results[i][0] == results[0][0]) {
	                newResults.push([results[i][0], this.exactSet[results[i][1]]]);
	            }
	        }
	        return newResults;
	    };

	    fuzzyset.add = function(value) {
	        var normalizedValue = this._normalizeStr(value);
	        if (normalizedValue in this.exactSet) {
	            return false;
	        }

	        var i = this.gramSizeLower;
	        for (i; i < this.gramSizeUpper + 1; ++i) {
	            this._add(value, i);
	        }
	    };

	    fuzzyset._add = function(value, gramSize) {
	        var normalizedValue = this._normalizeStr(value),
	            items = this.items[gramSize] || [],
	            index = items.length;

	        items.push(0);
	        var gramCounts = _gramCounter(normalizedValue, gramSize),
	            sumOfSquareGramCounts = 0,
	            gram, gramCount;
	        for (gram in gramCounts) {
	            gramCount = gramCounts[gram];
	            sumOfSquareGramCounts += Math.pow(gramCount, 2);
	            if (gram in this.matchDict) {
	                this.matchDict[gram].push([index, gramCount]);
	            } else {
	                this.matchDict[gram] = [[index, gramCount]];
	            }
	        }
	        var vectorNormal = Math.sqrt(sumOfSquareGramCounts);
	        items[index] = [vectorNormal, normalizedValue];
	        this.items[gramSize] = items;
	        this.exactSet[normalizedValue] = value;
	    };

	    fuzzyset._normalizeStr = function(str) {
	        if (Object.prototype.toString.call(str) !== '[object String]') throw 'Must use a string as argument to FuzzySet functions';
	        return str.toLowerCase();
	    };

	    // return length of items in set
	    fuzzyset.length = function() {
	        var count = 0,
	            prop;
	        for (prop in this.exactSet) {
	            if (this.exactSet.hasOwnProperty(prop)) {
	                count += 1;
	            }
	        }
	        return count;
	    };

	    // return is set is empty
	    fuzzyset.isEmpty = function() {
	        for (var prop in this.exactSet) {
	            if (this.exactSet.hasOwnProperty(prop)) {
	                return false;
	            }
	        }
	        return true;
	    };

	    // return list of values loaded into set
	    fuzzyset.values = function() {
	        var values = [],
	            prop;
	        for (prop in this.exactSet) {
	            if (this.exactSet.hasOwnProperty(prop)) {
	                values.push(this.exactSet[prop]);
	            }
	        }
	        return values;
	    };


	    // initialization
	    var i = fuzzyset.gramSizeLower;
	    for (i; i < fuzzyset.gramSizeUpper + 1; ++i) {
	        fuzzyset.items[i] = [];
	    }
	    // add all the items to the set
	    for (i = 0; i < arr.length; ++i) {
	        fuzzyset.add(arr[i]);
	    }

	    return fuzzyset;
	};

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

	var root = this;
	if (typeof module !== 'undefined' && module.exports) {
	    module.exports = DecatIndex;
	    root.DecatIndex = DecatIndex;
	} else {
	    root.DecatIndex = DecatIndex;
	}

})();
