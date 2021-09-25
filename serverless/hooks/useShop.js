const axios = require('axios');
const dayjs = require('dayjs');

/**
 * 쇼핑몰에서 상품을 받아오는 쿼리
 * @param {('29cm')} shop - 쇼핑몰 이름
 * @param {Object} params - 조회 옵션
 * @returns {Promise<Product[]>}
 */
async function getProducts(shop = '29cm', params) {
  const { data } = await axios.get(
    'https://apihub.29cm.co.kr/api/v2/nsearch/brand-home/',
    {
      params: params || {
        front_brand_no: 1708, // Another Office
        count: 100,
        category_large_code: 272100100, // 남성의류
        sort: 'new',
      }
    }
  );
  return data.data.products.map(n => ({
    id: `${n.item_no}`,
    name: n.item_name,
    soldOut: n.is_soldout === "F" ? false : true,
    new: dayjs(n.visible_begin_timestamp).isSame(dayjs(), 'months'),
  }));
}

const useShop = (() => {
  return {
    getProducts,
  };
});

module.exports = useShop;
