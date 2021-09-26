const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_PRODUCTS_DATABASE_ID;

/**
 * 상품 오브젝트
 * @typedef {Object} Product
 * @property {String} id
 * @property {String} name
 * @property {String} frontBrandNo
 * @property {String} categoryLargeCode
 * @property {Boolean} soldOut
 * @property {Boolean} new
 */

/**
 * 노션 상품 오브젝트
 * @typedef {Object} NotionProduct
 * @property {String} pageId - 노션 페이지 id
 * @property {String} id
 * @property {String} name
 * @property {String} front_brand_no
 * @property {String} category_large_code
 * @property {Boolean} soldOut
 * @property {Boolean} new
 */

/**
 * 노션에 상품을 추가하고 결과를 리턴하는 함수
 * @param {String} id
 * @param {String} name
 * @param {String} frontBrandNo
 * @param {String} categoryLargeCode
 * @param {Boolean} soldOut
 * @param {Boolean} isNew
 * @returns {Promise<*>}
 */
async function create(
  id,
  name,
  frontBrandNo,
  categoryLargeCode,
  soldOut = false,
  isNew = false
) {
  let res;
  try {
    res = await notion.pages.create({
      parent: {database_id: databaseId},
      properties: getPropertiesFromProduct({
        id,
        name,
        frontBrandNo,
        categoryLargeCode,
        soldOut,
        new: isNew,
      })
    });
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }

  return res;
}

/**
 * 노션에 상품을 업데이트하고 결과를 리턴하는 함수
 * @param {String} pageId
 * @param {Product} product
 * @returns {Promise<*>}
 */
async function update(pageId, product) {
  let res;
  try {
    res = await notion.pages.update({
      page_id: pageId,
      properties: getPropertiesFromProduct(product),
    });
    console.log("Success! Entry updated.")
  } catch (error) {
    console.error(error.body)
  }

  return res;
}

/**
 * 노션 상품을 조회, 리턴하는 함수
 * @param {Object} [filter]
 * @returns {Promise<NotionProduct[]>}
 */
async function find(filter) {
  const pages = [];
  let cursor;
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      ...(filter && { filter }),
    });
    cursor = next_cursor;
    pages.push(...results);
    if (!next_cursor) break;
  }

  return pages.map(page => {
    const { id, properties } = page;

    return {
      pageId: id,
      id: properties["id"].rich_text[0].text.content,
      name: properties["name"].title[0].text.content,
      frontBrandNo: properties["front_brand_no"].rich_text[0].text.content,
      categoryLargeCode: properties["category_large_code"].rich_text[0].text.content,
      soldOut: properties["sold_out"].checkbox,
      new: properties["new"].checkbox,
    }
  });
}

/**
 * 상품을 노션 포맷에 맞게 가공하는 함수
 * @param {Product} product
 * @returns {Object}
 */
function getPropertiesFromProduct(product) {
  const { id, name, frontBrandNo, categoryLargeCode, soldOut, new: isNew } = product;
  return {
    "id": {
      "rich_text": [{ type: "text", text: { content: id }}]
    },
    "name": {
      "title": [{ type: "text", text: { content: name } }],
    },
    "front_brand_no": {
      "rich_text": [{ type: "text", text: { content: frontBrandNo }}]
    },
    "category_large_code": {
      "rich_text": [{ type: "text", text: { content: categoryLargeCode }}]
    },
    "sold_out": {
      "type": "checkbox",
      "checkbox": soldOut,
    },
    "new": {
      "type": "checkbox",
      "checkbox": isNew,
    },
  }
}

const useProducts = (() => {
  return {
    notion,
    create,
    update,
    find,
  };
});

module.exports = useProducts;
