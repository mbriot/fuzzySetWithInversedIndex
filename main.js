

var idx = new DecatIndex(['color','sport','type','brandName'],['name','imageUrl'])

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