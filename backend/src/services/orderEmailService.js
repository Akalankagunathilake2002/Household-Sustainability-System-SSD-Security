const sendEmail = require("./emailService");

function baseTemplate(title, content) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">
      
      <h2 style="color: #2e7d32; margin-bottom: 10px;">
        EcoPulse - Household Sustainability Marketplace
      </h2>
      
      <h3 style="color: #333;">${title}</h3>
      
      <div style="color: #555; font-size: 14px; line-height: 1.6;">
        ${content}
      </div>

      <hr style="margin: 20px 0;" />

      <p style="font-size: 12px; color: #888;">
        You are receiving this email because you are part of EcoPulse.
      </p>

    </div>
  </div>
  `;
}

// Order Placed (to Seller)
async function sendOrderPlacedEmail(order, product, buyer, seller) {

  const subject = "New Order Received";

  const content = `
    <p>Hello <strong>${seller.username}</strong>,</p>

    <p>You have received a new order for your product:</p>

    <p>
      <strong>Product:</strong> ${product.title}<br/>
      <strong>Buyer:</strong> ${buyer.username}
    </p>

    <p>Please log in to your dashboard to confirm or cancel the order.</p>

    <p>Thank you for supporting sustainable reuse</p>
  `;

  await sendEmail(
    seller.email,
    subject,
    "You have received a new order.",
    baseTemplate(subject, content)
  );
}


// Order Confirmed (to Buyer)
async function sendOrderConfirmedEmail(order, product, buyer, seller) {

  const subject = "Your Order Has Been Confirmed";

  const content = `
    <p>Hello <strong>${buyer.username}</strong>,</p>

    <p>Your order has been confirmed</p>

    <p>
      <strong>Product:</strong> ${product.title}<br/>
      <strong>Seller:</strong> ${seller.username}
    </p>

    <p>You may now coordinate pickup directly with the seller.</p>

    <p>By choosing reuse, you helped reduce carbon emissions</p>
  `;

  await sendEmail(
    buyer.email,
    subject,
    "Your order has been confirmed.",
    baseTemplate(subject, content)
  );
}


// Order Cancelled (to Both Buyer and Seller)
async function sendOrderCancelledEmail(order, product, buyer, seller, reason = "manual") {

  const subject = reason === "expired"
    ? "Order Expired Automatically"
    : "Order Cancelled";

  const reasonMessage = reason === "expired"
    ? `
      <p>This order was automatically cancelled because it was not confirmed within the allowed time period.</p>
      <p>The product is now available for other community members.</p>
    `
    : `
      <p>The order has been cancelled by one of the participants.</p>
      <p>If you still wish to proceed, you may place a new order.</p>
    `;

  const content = `
    <p>Hello,</p>

    <p>The order for <strong>${product.title}</strong> has been cancelled.</p>

    ${reasonMessage}

    <p>Thank you for supporting sustainable reuse.</p>
  `;

  await sendEmail(
    buyer.email,
    subject,
    "The order has been cancelled.",
    baseTemplate(subject, content)
  );

  await sendEmail(
    seller.email,
    subject,
    "The order has been cancelled.",
    baseTemplate(subject, content)
  );
}

module.exports = {
  sendOrderPlacedEmail,
  sendOrderConfirmedEmail,
  sendOrderCancelledEmail
};