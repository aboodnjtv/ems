const dark_mode = document.querySelector("#dark_mode"); //dark mode switch
const dark_mode_grey = document.querySelectorAll(".dark_mode_grey");
const dark_mode_black = document.querySelectorAll(".dark_mode_black");
const dark_mode_white = document.querySelectorAll(".dark_mode_white");
const dark_mode_table = document.querySelectorAll(".dark_mode_table");
const dark_mode_roundness_index = document.querySelectorAll(".dark_mode_roundness_index");
const dark_mode_roundness_show = document.querySelectorAll(".dark_mode_roundness_show");

const addClasses = function(instant){
    for(let element of dark_mode_grey){
        element.classList.add("add_grey"+instant);
        element.classList.remove("remove_grey");

    }
    // add black background
    for(let element of dark_mode_black){
        element.classList.add("add_black"+instant);   
        element.classList.remove("remove_black");

    }
    // add white color to font
    for(let element of dark_mode_white){
        element.classList.add("add_white"+instant);
        element.classList.remove("remove_white");

    }
    //make table dark
    for(let element of dark_mode_table){
        element.classList.add("table-dark");
    }
    //add roundness to index image
    for(let element of dark_mode_roundness_index){
        element.classList.add("add_roundness_right_index"+instant);
        element.classList.remove("remove_roundness_right_index");

    }
    //add roundness to show image
    for(let element of dark_mode_roundness_show){
        element.classList.add("add_roundness_show"+instant);
        element.classList.remove("remove_roundness_show");

    }
}

const removeClasses = function(){
    for(let element of dark_mode_grey){
        element.classList.remove("add_grey");
        element.classList.remove("add_grey_instant");
        element.classList.add("remove_grey");
        
    }
    for(let element of dark_mode_black){
        element.classList.remove("add_black");
        element.classList.remove("add_black_instant");
        element.classList.add("remove_black");

    }
    for(let element of dark_mode_white){
        element.classList.remove("add_white");
        element.classList.remove("add_white_instant");
        element.classList.add("remove_white");

    }
    for(let element of dark_mode_table){
        element.classList.remove("table-dark");
        element.classList.remove("table-dark_instant");
        
    }
    for(let element of dark_mode_roundness_index){
        element.classList.remove("add_roundness_right_index");
        element.classList.remove("add_roundness_right_index_instant");
        element.classList.add("remove_roundness_right_index");
        
    }
    for(let element of dark_mode_roundness_show){
        element.classList.remove("add_roundness_show");
        element.classList.remove("add_roundness_show_instant");
        element.classList.add("remove_roundness_show");

        

    }
}


if(sessionStorage.getItem(dark_mode)=="true"){
    dark_mode.checked = true;// keep the switch on
    addClasses("_instant"); // add _instant so we do not have a transition every time we refresh or change the page
}

// if there is a change on the switch we check if checkbox is checked
dark_mode.addEventListener("change",function(e){
    if(this.checked){
        sessionStorage.clear();
        sessionStorage.setItem(dark_mode,"true");
        addClasses("");
        document.body.style.backgroundColor = "";
        
    }else{
        sessionStorage.clear();
        removeClasses();

    }
});