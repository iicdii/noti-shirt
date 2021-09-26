const { Client } = require('@notionhq/client');
const { v4: uuidv4 } = require('uuid');

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_SUBSCRIBE_DATABASE_ID;

/**
 * 구독 오브젝트
 * @typedef {Object} Subscribe
 * @property {String} id
 * @property {String} chatId
 * @property {('29cm')} shop
 * @property {String[]} target - 구독 정보
 */

/**
 * 노션 구독 오브젝트
 * @typedef {Object} NotionSubscribe
 * @property {String} pageId - 노션 페이지 id
 * @property {String} id
 * @property {String} chatId
 * @property {('29cm')} shop
 * @property {String[]} target - 구독 정보
 * ex: ['front_brand_no=1708','category_large_code=272100100']
 */

/**
 * 노션에 구독을 추가하고 결과를 리턴하는 함수
 * @param {String} chatId
 * @param {('29cm')} shop
 * @param {String[]} target - 구독 정보
 * @returns {Promise<*>}
 */
async function create(
  chatId,
  shop,
  target,
) {
  let res;
  try {
    res = await notion.pages.create({
      parent: {database_id: databaseId},
      properties: getPropertiesFromSubscribe({
        id: uuidv4(),
        chatId,
        shop,
        target,
      })
    });
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }

  return res;
}

/**
 * 노션 구독 리스트를 찾는 함수
 * @param {Object} [filter]
 * @returns {Promise<NotionSubscribe[]>}
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
      id: properties["id"].title[0].text.content,
      chatId: properties["chat_id"].rich_text[0].text.content,
      shop: properties["shop"].select.name,
      target: properties["target"].multi_select.map(s => s.name),
    }
  });
}

/**
 * 구독을 노션 포맷에 맞게 가공하는 함수
 * @param {Product} subscribe
 * @returns {Object}
 */
function getPropertiesFromSubscribe(subscribe) {
  const { id, chatId, shop, target } = subscribe;
  return {
    "id": {
      "title": [{ type: "text", text: { content: id } }],
    },
    "chat_id": {
      "rich_text": [{ type: "text", text: { content: chatId }}]
    },
    "shop": {
      "type": "select",
      "select": { name: shop, }
    },
    "target": {
      "type": "multi_select",
      "multi_select": target.map(name => ({ name })),
    },
  }
}

const useSubscribe = (() => {
  return {
    notion,
    create,
    find,
  };
});

module.exports = useSubscribe;
