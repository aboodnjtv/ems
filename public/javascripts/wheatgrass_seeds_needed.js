const form = document.querySelector("#wheatgrass_form");
const weight = document.querySelector("#weight");
const cost = document.querySelector("#cost");
form.addEventListener("submit",function(e){
    e.preventDefault();
    
    // grams=(defaultGrams*area)/defaultArea;
	// double cost=(defaultPrice*grams)/defaultWeight;
    
    weight.innerText = "";
    area = form.area.value;

    const defaultArea=625; // 25*25 plate has an area of 625
	const defaultGrams=100; // 25*25 plate needs 100 grams of  seeds
	
    const total_weight = (defaultGrams*area)/defaultArea;
    
    if(!validInputs(area)) return;
    weight.append("Wheatgrass Seeds Needed: "+total_weight.toFixed(0)+"g");
    
})

const validInputs = function(area){
    if(isNaN(area)||area==""){
        weight.append("Make Sure To Have Numeric Values!");
        return false;
    }
    if(area <1){
        weight.append("Make Sure To Have Positive Values!");
        return false;
    }
    //passed all cases
    return true;
}