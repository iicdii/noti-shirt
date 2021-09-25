const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_PRODUCTS_DATABASE_ID;

/**
 * 상품 오브젝트
 * @typedef {Object} Product
 * @property {String} id
 * @property {String} name
 * @property {Boolean} soldOut
 * @property {Boolean} new
 */

/**
 * 노션 상품 오브젝트
 * @typedef {Object} NotionProduct
 * @property {String} pageId - 노션 페이지 id
 * @property {String} id
 * @property {String} name
 * @property {Boolean} soldOut
 * @property {Boolean} new
 */

/**
 * 노션에 상품을 추가하고 결과를 리턴하는 함수
 * @param {String} id
 * @param {String} name
 * @param {Boolean} soldOut
 * @param {Boolean} isNew
 * @returns {Promise<*>}
 */
async function addItem(id, name, soldOut = false, isNew = false) {
  let res;
  try {
    res = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "id": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": id
              }
            },
          ]
        },
        "name": {
          title: [
            {
              "text": {
                "content": name
              }
            }
          ]
        },
        "sold_out": {
          checkbox: soldOut,
        },
        "new": {
          checkbox: isNew,
        },
        "created_at": {
          date: {
            "start": new Date().toISOString(),
          }
        },
      },
    })
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
async function updateItem(pageId, product) {
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
 * 노션의 모든 상품을 조회, 리턴하는 함수
 * @returns {Promise<NotionProduct[]>}
 */
async function getProducts() {
  const pages = [];
  let cursor;
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });
    cursor = next_cursor;
    pages.push(...results);
    if (!next_cursor) break;
  }

  return pages.map(page => {
    return {
      pageId: page.id,
      id: page.properties["id"].rich_text[0].text.content,
      name: page.properties["name"].title[0].text.content,
      soldOut: page.properties["sold_out"].checkbox,
      new: page.properties["new"].checkbox,
    }
  });
}

/**
 * 상품을 노션 포맷에 맞게 가공하는 함수
 * @param {Product} product
 * @returns {Object}
 */
function getPropertiesFromProduct(product) {
  const { id, name, soldOut, new: isNew } = product;
  return {
    "id": {
      "rich_text": [{ type: "text", text: { content: id }}]
    },
    "name": {
      "title": [{ type: "text", text: { content: name } }],
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
    addItem,
    updateItem,
    getProducts,
  };
});

module.exports = useProducts;
