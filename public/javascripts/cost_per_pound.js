const form = document.querySelector("#cost_per_pound_form");//cost_result
const cost_result = document.querySelector("#cost_result");
form.addEventListener("submit",function(e){
    e.preventDefault();
    cost = form.cost.value;
    weight = form.weight.value;
    cost_result.innerText = "";

    if(!validInputs(cost,weight)) return;
    
    cost_result.append("Cost/LB =  $"+((cost*453.592)/weight).toFixed(2));
    

});

const validInputs = function(cost,weight){
    if(isNaN(cost)||isNaN(weight)||cost=="" ||weight==""){
        cost_result.append("Make Sure To Have Numeric Values!");
        return false;
    }
    if(cost <1 || weight<1){
        cost_result.append("Make Sure To Have Positive Values!");
        return false;
    }
    //passed all cases
    return true;
}