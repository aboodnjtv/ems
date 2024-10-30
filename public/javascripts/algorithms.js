//calculate Item's weight given its ingredients, and ingredients has ingredients' quantities
// for Total Weight of the item not the Final Weight
// Total Weight is the total of quantities
// Final Weight is measured
module.exports.calculateItemWeight = function (ingredients) {
  let weight = 0;
  for (let ingredient of ingredients) {
    weight += ingredient.quantity;
  }
  return weight;
};

//calculate Item's Cost given its ingredients, and ingredients has ingredients' costs
module.exports.calculateItemCost = function (ingredients) {
  let cost = 0;
  for (let ingredient of ingredients) {
    cost += (ingredient.id.cost * ingredient.quantity) / 1000;
  }
  return cost;
};

//calculate Item's Cost in (KG) given its ingredients, and ingredients has ingredients' costs
module.exports.calculateItemCostInKG = function (ingredients, weight) {
  let cost = 0;
  for (let ingredient of ingredients) {
    cost += (ingredient.id.cost * ingredient.quantity) / 1000;
  }
  return ((cost / weight) * 1000).toFixed(2);
};
// returns the cost in KG, given the cost and weight
module.exports.itemCostInKG = function (cost, weight) {
  return ((cost / weight) * 1000).toFixed(2);
};

//calculate Item's Cost in (LB) given its ingredients, and ingredients has ingredients' costs
module.exports.calculateItemCostInLB = function (ingredients, weight) {
  let cost = 0;
  for (let ingredient of ingredients) {
    cost += (ingredient.id.cost * ingredient.quantity) / 1000;
  }
  return ((cost / weight) * 453.592).toFixed(2);
};

// returns the cost in LB, given the cost and weight
module.exports.itemCostInLB = function (cost, weight) {
  return ((cost / weight) * 453.592).toFixed(2);
};
