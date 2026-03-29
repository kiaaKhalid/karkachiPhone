const fetch = require('node-fetch');

async function test() {
  const url = 'http://localhost:3001/api';
  // ID is Sony PlayStation 5 DualSense which has price 750 or ID in screens
  // I need to find the product ID from products list first or get a sample one
  try {
    const listRes = await fetch(`${url}/public/products?limit=10`);
    const listData = await listRes.json();
    const target = listData.data.items.find(i => i.price === 750 || i.name.includes('Sony'));
    
    if (!target) {
      console.log("No product found for Sony/750. Sample item:", listData.data.items[0]);
      return;
    }

    console.log("LIST ITEM IMAGE:", target.image);

    const detailRes = await fetch(`${url}/public/products/${target.id}`);
    const detailData = await detailRes.json();
    console.log("DETAIL ITEM FULL PAYLOAD DATA:", JSON.stringify(detailData.data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
