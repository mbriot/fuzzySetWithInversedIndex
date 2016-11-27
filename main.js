
var options = {};
options.ref = "productId";
options.fieldsToIndex = ['productName'];
options.fieldsToStore = ['productName','imageUrl'];
var idx = new DecatIndex(options);

var docs = [
{
  "productId":"1",
  "productName":"bubble",
  "imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"
},
  {"productId":"2","productName":"chat","imageUrl":"decathlon.fr/media/832/8327269/classic_c31bae38d50f4d3aa72689edea9e7c8a.jpg"},{"productId":"3","productName":"pingouin","imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"},{"productId":"4","productName":"bubble","imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"},{"productId":"5","productName":"chat","imageUrl":"decathlon.fr/media/832/8327269/classic_c31bae38d50f4d3aa72689edea9e7c8a.jpg"},{"productId":"6","productName":"pingouin","imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"},{"productId":"7","productName":"bubble","imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"},{"productId":"8","productName":"chat","imageUrl":"decathlon.fr/media/832/8327269/classic_c31bae38d50f4d3aa72689edea9e7c8a.jpg"},{"productId":"9","productName":"pingouin","imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"},{"productId":"10","productName":"bubble","imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"},{"productId":"11","productName":"chat","imageUrl":"decathlon.fr/media/832/8327269/classic_c31bae38d50f4d3aa72689edea9e7c8a.jpg"},{"productId":"12","productName":"pingouin","imageUrl":"decathlon.fr/media/837/8370157/classic_aa58a99fee7943908bf34a62877c53bb.jpg"}];

docs.forEach(function(doc){
  idx.indexDoc(doc)
});

$(document).ready(function(e) {   
  
  var $productsFilter = $( "#products-filter" );
  
  $productsFilter.bind("keyup",function(e){
    fieldValue = $productsFilter.val();

    var results = idx.search(fieldValue);    

    var productIdToKeep = [];
    for(i=0;i<results.length;i++){
      productIdToKeep.push(results[i]);
    }

    var $allProducts = $( ".thumbnail" );
    $( ".thumbnail" ).each(function(index,element){
      var keepProduct = productIdToKeep.indexOf(this.id ) > -1;
      if(!keepProduct) {
        $(this).attr('style','display:none');
      } else {
        $(this).attr('style','display:block');
      }
    });

  });
 });