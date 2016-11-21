var indexer = (function(){
  
  var Indexer = function() {
    this.test = "test";
    this.index = {};
    this.store = {};
    this.fuzzySet = FuzzySet();
  };

  Indexer.prototype.indexDoc = function(doc) {
    var self = this;
    for (var key in doc) {
      if (doc.hasOwnProperty(key) && key !== "id") {
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
    }
  };

  Indexer.prototype.search = function(str){
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

  return {Indexer : Indexer};
})();

var indexer = new indexer.Indexer();
var docs = [];
docs.push({id : 1, name : "ballon champions league",color:"jaune",sport : "football"});
docs.push({id : 2, name : "ballon coupe du monde",color:"rouge",sport : "football"});
docs.forEach(function(doc){indexer.indexDoc(doc)});

$(document).ready(function(e) {   
  
  var $productsFilter = $( "#products-filter" );
  
  $productsFilter.bind("keyup",function(e){
    fieldValue = $productsFilter.val();

    var results = indexer.search(fieldValue); 
    console.log({'results' : results});
  });
});