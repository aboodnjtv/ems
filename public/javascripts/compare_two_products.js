const form = document.querySelector("#comparison-form");
const table = document.querySelector("#table");

//results area
const results = document.querySelector("#results");
const cost_per_kg_1 = document.querySelector("#cost_per_kg_1");
const cost_per_kg_2 = document.querySelector("#cost_per_kg_2");
const cost_per_lb_1 = document.querySelector("#cost_per_lb_1");
const cost_per_lb_2 = document.querySelector("#cost_per_lb_2");
const comparison = document.querySelector("#comparison");

 
form.addEventListener("submit",function(e){
    e.preventDefault();
    
    // form data;
    const first_cost = form.first_cost.value;
    const first_weight = form.first_weight.value;
    const second_cost = form.second_cost.value;
    const second_weight = form.second_weight.value;
    
    results.innerText = "";
    cost_per_kg_1.innerText = "";
    cost_per_kg_2.innerText = "";
    cost_per_lb_1.innerText = "";
    cost_per_lb_2.innerText = "";
    comparison.innerText = "";

    results.classList.add("mt-3");
    if(!validInputs(first_cost,first_weight,second_cost,second_weight)) return;
    results.append("Results Summary");
    calculate_costs(first_cost,first_weight,second_cost,second_weight);
    compare_products(first_cost,first_weight,second_cost,second_weight);
});


//returns cost per KG
const cost_per_kg = function(cost,weight){
    return (1000/weight*cost).toFixed(2);
}

//returns cost per LB
const cost_per_lb = function(cost,weight){
    return (453.592/weight*cost).toFixed(2);
}

//checks if valid input
const validInputs = function(first_cost,first_weight,second_cost,second_weight){
    //check if input is NaN or empty
    if(isNaN(first_cost)||isNaN(first_weight)||isNaN(second_cost)||isNaN(second_weight)||
    first_cost==""||first_weight==""||second_cost==""||second_weight==""){
        results.append("Make Sure To Have Numeric Values!");
        return false;
    }
    //check if negative
    if(first_cost < 1||first_weight < 1||second_cost < 1||second_weight < 1){
        results.append("Make Sure To Have Positive Values!");
        return false;
    }
    //  passed all cases
    // make table visible
    table.classList.remove("invisible");
    return true;
}

//calculates the costs per KG and per LB
const calculate_costs = function(first_cost,first_weight,second_cost,second_weight){
    cost_per_kg_1.append("$"+cost_per_kg(first_cost,first_weight));
    cost_per_kg_2.append("$"+cost_per_kg(second_cost,second_weight));
    cost_per_lb_1.append("$"+cost_per_lb(first_cost,first_weight));
    cost_per_lb_2.append("$"+cost_per_lb(second_cost,second_weight));
}

const compare_products = function(first_cost,first_weight,second_cost,second_weight){
    if(cost_per_kg(first_cost,first_weight) > cost_per_kg(second_cost,second_weight)){
        comparison.append("The First Product is More Expensive By: %"+ Math.round(cost_per_kg(first_cost,first_weight)/cost_per_kg(second_cost,second_weight)*100));
    }
    else if(cost_per_kg(first_cost,first_weight) < cost_per_kg(second_cost,second_weight)){
        comparison.append("The Second Product is More Expensive By: %"+Math.round(cost_per_kg(second_cost,second_weight)/cost_per_kg(first_cost,first_weight)*100));

    }else{
        comparison.append("The Two Products Have The Same Cost");
    }
}