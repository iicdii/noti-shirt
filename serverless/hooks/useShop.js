const axios = require('axios');
const dayjs = require('dayjs');

/**
 * 조회 옵션
 * @typedef {Object} QueryOption
 * @property {String} front_brand_no - 브랜드 고유 번호
 * @property {String} category_large_code - 카테고리 고유 번호
 */

/**
 * 쇼핑몰에서 상품을 받아오는 쿼리
 * @param {('29cm')} shop - 쇼핑몰 이름
 * @param {QueryOption} params - 조회 옵션
 * @returns {Promise<Product[]>}
 */
async function requestProducts(shop = '29cm', params) {
  const { front_brand_no, category_large_code } = params;
  const { data } = await axios.get(
    'https://apihub.29cm.co.kr/api/v2/nsearch/brand-home/',
    {
      params: {
        front_brand_no,
        category_large_code,
        count: 100,
        sort: 'new',
      }
    }
  );
  return data.data.products.map(n => ({
    id: `${n.item_no}`,
    name: n.item_name,
    frontBrandNo: front_brand_no,
    categoryLargeCode: category_large_code,
    soldOut: n.is_soldout === "T",
    new: dayjs(n.visible_begin_timestamp).isSame(dayjs(), 'months'),
  }));
}

const useShop = (() => {
  return {
    requestProducts,
  };
});

module.exports = useShop;
