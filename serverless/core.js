const axios = require('axios');
const useSubscribers = require('./hooks/useSubscribers');
const useProducts = require('./hooks/useProducts');
const useShop = require('./hooks/useShop');

module.exports = async (event, context) => {
  const { getSubscribers } = useSubscribers();
  const { getProducts, addItem, updateItem } = useProducts();
  const { getProducts: getShopProducts } = useShop();

  const notionProducts = await getProducts();
  const shopProducts = await getShopProducts('29cm');

  const createPromises = [], updatePromises = [];
  const newProducts = [], productsInStock = [];
  for (let product of shopProducts) {
    const notionProduct = notionProducts.find(n => n.id === product.id);
    if (notionProduct) {
      // 재입고 상품
      if (notionProduct.soldOut && !product.soldOut) {
        productsInStock.push(product);
      }

      if (
        notionProduct.soldOut !== product.soldOut ||
        notionProduct.new !== product.new ||
        notionProduct.name !== product.name
      ) {
        updatePromises.push(updateItem(notionProduct.pageId, product));
      }
    } else {
      createPromises.push(addItem(product.id, product.name, product.soldOut, product.new));
      // 새로 등록된 상품
      newProducts.push(product);
    }
  }

  // 노션 DB 상품 생성/업데이트 실행
  try {
    await Promise.all([...createPromises, ...updatePromises]);
  } catch (e) {
    console.log('create/update notion failed');
    console.log('e', e);
    throw e;
  }

  const subscribers = await getSubscribers();

  // 구독자들에게 신상품 알림 보내기
  if (newProducts.length) {
    const text = '<b>[신상품]</b>\n' + newProducts.map(n => n.name).join('\n');
    await Promise.all(
      subscribers.map(({ chatId }) =>
        axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          { chat_id: chatId, text, parse_mode: 'html' }
        )
      )
    );
  }

  // 구독자들에게 재입고 알림 보내기
  if (productsInStock.length) {
    const text = '<b>[재입고]</b>\n' + productsInStock.map(n => n.name).join('\n');
    await Promise.all(
      subscribers.map(({ chatId }) =>
        axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          { chat_id: chatId, text, parse_mode: 'html' }
        )
      )
    );
  }

  return { message: '실행 완료 🚀', event };
}
