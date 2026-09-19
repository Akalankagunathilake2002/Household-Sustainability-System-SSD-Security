const emissionCategories = {
  laptop: {
    weight: 1.8,
    activityId: "metals-type_aluminum_production" 
  },
  phone: {
    weight: 0.2,
    activityId: "metals-type_aluminum_production" 
  },
  electronics_other: {
    weight: 3,
    activityId: "metals-type_aluminum_production" 
  },
  clothing: {
    weight: 0.5,
    activityId: "consumer_goods-type_cotton_clothing" 
  },
  furniture_wood: {
    weight: 20,
    activityId: "timber_forestry-type_wood_primary_material_production" 
  },
  furniture_metal: {
    weight: 15,
    activityId: "metals-type_steel_production" 
  },
  tools_steel: {
    weight: 2,
    activityId: "metals-type_steel_production" 
  },
  plastic_items: {
    weight: 3,
    activityId: "plastics_rubber-type_average_plastics_primary_material_production" 
  },
  books: {
    weight: 0.5,
    activityId: "paper_products-type_copy_paper" 
  },
  other: {
    weight: 2,
    useFallback: true
  }
};

const allowedCategories = Object.keys(emissionCategories);

module.exports = { emissionCategories, allowedCategories };