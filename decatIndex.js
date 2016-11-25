(function(){

  var Index = function(fieldsToIndex,fieldsToStore) {
    this.fieldsToIndex = fieldsToIndex;
    this.fieldsToStore = fieldsToStore;
    this.index = {};
    this.store = {};
    this.fuzzySet = FuzzySet();
  };

  Index.prototype.indexDoc = function(doc) {
    var self = this;
    for (var key in doc) {
       if(key === "id") var id = doc[key]
    }

    for (var key in doc) {
      if (doc.hasOwnProperty(key) && this.fieldsToIndex.indexOf(key) != -1 && key !== "id") {
        var tokens = doc[key].split(" ").map(function(token){
          return token.toLowerCase();
        });
      
        tokens.forEach(function(token){
          self.fuzzySet.add(token);
          var existingValues = self.index[token];
          if(existingValues === undefined){
            self.index[token] = [doc["id"]];
            return;
          }
          self.index[token].push(doc["id"]);
        });
      }

      if (doc.hasOwnProperty(key) && this.fieldsToStore.indexOf(key) != -1 && key !== "id") {
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
      documentsByToken.push(self.index[fuzzySetResults[0][1]]);
    });
    var finalResult = documentsByToken.reduce(function(previous,current){
        return previous.filter(function(e){
          if(current.indexOf(e) != -1) return true;
        });
    });
    
    return finalResult;
  };

  return window.DecatIndex = Index;
})();