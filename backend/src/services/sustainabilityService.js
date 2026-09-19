const User = require("../models/User");

async function awardSustainabilityPoints(order) {
  const co2Value = order.product.co2Saved || 0;

  if (co2Value <= 0) return;

  const buyer = await User.findById(order.buyer);
  const seller = await User.findById(order.product.seller);

  if (buyer) {
    buyer.sustainabilityScore += co2Value;
    await buyer.save();
  }

  if (seller) {
    seller.sustainabilityScore += co2Value;
    await seller.save();
  }
}

module.exports = { awardSustainabilityPoints };
