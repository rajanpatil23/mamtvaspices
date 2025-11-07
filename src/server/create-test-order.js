require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Find the test user
    const user = await prisma.user.findUnique({
      where: { email: 'user@example.com' }
    });

    if (!user) {
      console.error('❌ User not found. Please run the seed script first.');
      process.exit(1);
    }

    console.log('✅ Found user:', user.email);

    // Get some products
    const products = await prisma.product.findMany({
      take: 2,
      include: {
        variants: true
      }
    });

    if (products.length === 0) {
      console.error('❌ No products found. Please run the seed script first.');
      process.exit(1);
    }

    console.log(`✅ Found ${products.length} products`);

    // Create an order
    const orderData = {
      userId: user.id,
      amount: 0, // Will calculate
      status: 'PENDING',
      orderItems: {
        create: []
      }
    };

    let totalAmount = 0;

    // Add order items
    for (const product of products) {
      const variant = product.variants[0];
      if (variant) {
        const quantity = 2;
        const price = variant.price;
        totalAmount += price * quantity;

        orderData.orderItems.create.push({
          variantId: variant.id,
          quantity: quantity,
          price: price
        });
      }
    }

    orderData.amount = totalAmount;

    console.log('📦 Creating order with total amount:', totalAmount);

    const order = await prisma.order.create({
      data: orderData,
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Order created successfully!');
    console.log('📋 Order Details:');
    console.log('   Order ID:', order.id);
    console.log('   User:', user.email);
    console.log('   Total Amount: $' + order.amount);
    console.log('   Status:', order.status);
    console.log('   Items:', order.orderItems.length);
    console.log('\n📦 Order Items:');
    order.orderItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.variant.product.name}`);
      console.log(`      Quantity: ${item.quantity}`);
      console.log(`      Price: $${item.price}`);
      console.log(`      Subtotal: $${item.price * item.quantity}`);
    });

    console.log('\n✅ Test order created! You can now check "My Orders" page.');
    console.log('🌐 Visit: http://localhost:3000/orders');

  } catch (error) {
    console.error('❌ Error creating test order:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
