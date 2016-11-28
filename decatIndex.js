(function(){

  var Index = function(options) {
    this.ref = options.ref;
    this.fieldsToIndex = options.fieldsToIndex;
    this.fieldsToStore = options.fieldsToStore;
    this.index = {};
    this.store = {};
    this.fuzzySet = FuzzySet();
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
      if(fuzzySetResults !== null)
        documentsByToken.push(self.index[fuzzySetResults[0][1]]);
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
      store : this.store
    }
  };

  return window.DecatIndex = Index;
})();