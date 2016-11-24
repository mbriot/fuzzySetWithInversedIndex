var decatIndex = (function(){
  

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
        if(self.store[id]){
          self.store[id].push(key : doc[key])  
        } else {
          self.store[id] = {id : id, values : []};
          self.store[id].push(key : doc[key])
        }
        
        
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

  return {Index : Index} ;
})();

var idx = new decatIndex.Index(['color','sport','type','brandName'],['name','imageUrl'])
//var idx = decatIndex()

var docs = [];
docs.push({id : 1, name : "Maillot football enfant F300 blanc",imageUrl : "decathlon.fr/media/832/8327269/classic_c31bae38d50f4d3aa72689edea9e7c8a.jpg",color:"blanc",sport : "football",type : "maillot",brandName : "kipsta"});
docs.push({id : 2, name : "Maillot football enfant Entrada blanc",imageUrl : "decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg",color:"blanc",sport : "football",type : "maillot",brandName : "adidas"});
docs.forEach(function(doc){
  idx.indexDoc(doc)
});

$(document).ready(function(e) {
  
  var $productsFilter = $( "#products-filter" );
  
  $productsFilter.bind("keyup",function(e){
    fieldValue = $productsFilter.val();

    var results = idx.search(fieldValue); 
    console.log({'results' : results});
  });
});