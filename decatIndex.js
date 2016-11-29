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
    var self = this;
    for (var key in doc) {
       if(key === this.ref) var id = doc[key]
    }

    for (var key in doc) {
      if (doc.hasOwnProperty(key) && this.fieldsToIndex.indexOf(key) != -1 && key !== this.ref) {
        var tokens = doc[key].split(" ").map(function(token){
          return token.toLowerCase();
        });
      
        tokens.forEach(function(token){
          self.dictionary.add(token);
          self.fuzzySet.add(token);
          var existingValues = self.index[token];
          if(existingValues === undefined){
            self.index[token] = [doc[self.ref]];
            return;
          }
          self.index[token].push(doc[self.ref]);
        });
      }

      if (doc.hasOwnProperty(key) && this.fieldsToStore.indexOf(key) != -1 && key !== this.ref) {
        if(!self.store[id]) self.store[id] = {} 
        self.store[id][key] =  doc[key]
      }
    }
  };

  Index.prototype.search = function(str){
    var self = this;
    var documentsByToken = [];
    var tokens = str.split(" ").map(function(element){
      return element.toLowerCase();
    });
    tokens.forEach(function(token){
      var fuzzySetResults = self.fuzzySet.get(token);
      if(fuzzySetResults !== null) {
        documentsByToken.push(self.index[fuzzySetResults[0][1]]);
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