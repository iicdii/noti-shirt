const axios = require('axios');
const useProducts = require('./hooks/useProducts');
const useShop = require('./hooks/useShop');
const useSubscribe = require('./hooks/useSubscribe');

const targetProducts = [{
  shop: '29cm',
  params: [
    { key: 'front_brand_no', value: '1708' },
    { key: 'category_large_code', value: '272100100' }
  ],
}];

module.exports = async (event, context) => {
  const productsHelper = useProducts();
  const shopHelper = useShop();
  const subscribeHelper = useSubscribe();

  const telegramPromises = [];
  for (let info of targetProducts) {
    let notionProducts = [], shopProducts = [];
    const createPromises = [], updatePromises = [];
    const { shop, params } = info;
    try {
      [notionProducts, shopProducts] = await Promise.all([
        productsHelper.find({
          and: params.map(({key, value}) => ({
            property: key,
            text: {
              equals: value
            }
          }))
        }),
        shopHelper.requestProducts(
          shop,
          params.reduce((result, current) => {
            return Object.assign(result, {[current.key]: current.value});
          }, {}),
        )
      ])
    } catch (e) {
      console.log('failed to query products');
      console.log('e', e);
      throw e;
    }

    const notionProductLookup = {};
    notionProducts.forEach(item => notionProductLookup[item.id] = item);

    const newProducts = [], productsInStock = [];
    for (let product of shopProducts) {
      const notionProduct = notionProductLookup[product.id];
      if (notionProduct) {
        // 구독자에게 알릴 재입고 상품 +
        if (notionProduct.soldOut && !product.soldOut) {
          productsInStock.push(product);
        }

        // 변경 사항이 있으면 노션에 상품 업데이트
        if (
          notionProduct.soldOut !== product.soldOut ||
          notionProduct.new !== product.new ||
          notionProduct.name !== product.name
        ) {
          updatePromises.push(
            productsHelper.update(notionProduct.pageId, product)
          );
        }
      } else {
        // 노션에 상품 추가
        createPromises.push(
          productsHelper.create(
            product.id,
            product.name,
            product.frontBrandNo,
            product.categoryLargeCode,
            product.soldOut,
            product.new
          )
        );
        // 구독자들에게 알릴 신상품 +
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

    let subscribers = [];
    try {
      const result = await subscribeHelper.find({
        and: [
          {
            property: 'shop',
            select: {
              equals: shop
            },
          },
          ...params.map(({ key, value }) => ({
            property: 'target',
            multi_select: {
              contains: `${key}=${value}`
            }
          }))
        ]
      });
      subscribers = subscribers.concat(result);
    } catch (e) {
      console.log('failed to fetch subscribers');
      console.log('e', e);
      throw e;
    }

    // 신상품 알림 +
    if (newProducts.length || (subscribers || []).length) {
      const text = '<b>[신상품]</b>\n' + newProducts.map(n => n.name).join('\n');
      telegramPromises.push(
        ...subscribers.map(({ chatId }) =>
          axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            { chat_id: chatId, text, parse_mode: 'html' }
          )
        )
      );
    }

    // 재입고 알림 +
    if (productsInStock.length || (subscribers || []).length) {
      const text = '<b>[재입고]</b>\n' + productsInStock.map(n => n.name).join('\n');
      telegramPromises.push(
        ...subscribers.map(({ chatId }) =>
          axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            { chat_id: chatId, text, parse_mode: 'html' }
          )
        )
      )
    }
  }

  // 구독자들에게 알림 보내기
  if (telegramPromises.length) {
    try {
      await Promise.all([...telegramPromises]);
    } catch (e) {
      console.log('send telegram message failed');
      console.log('e', e);
      throw e;
    }
  }

  return { message: '실행 완료 🚀', event };
}
