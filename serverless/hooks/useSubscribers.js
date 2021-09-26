const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_SUBSCRIBERS_DATABASE_ID;

/**
 * 노션 구독자 오브젝트
 * @typedef {Object} NotionSubscriber
 * @property {String} pageId - 노션 페이지 id
 * @property {String} chatId
 */

/**
 * 노션 구독자 리스트에 구독자를 추가하는 함수
 * @param {String} chatId - 텔레그램 채팅방 id
 * @returns {Promise<Boolean>} - 성공 여부
 */
async function create(chatId) {
  if (!chatId) throw new Error('invalid chat id');

  if (
    await findOne({
      property: "chat_id",
      text: {
        equals: chatId,
      },
    })
  ) {
    console.log(`${chatId} is already subscribed.`);
    return false;
  }

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "chat_id": {
          title: [
            {
              "text": {
                "content": chatId,
              }
            }
          ]
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

  return true;
}

/**
 * 노션에서 구독자 리스트를 조회하는 함수
 * @param {Object} [filter]
 * @returns {Promise<NotionSubscriber[]>}
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
    return {
      pageId: page.id,
      chatId: page.properties["chat_id"].title[0].text.content,
    }
  });
}

/**
 * 노션에서 구독자 한 명을 찾는 함수
 * @param {Object} [filter]
 * @returns {Promise<NotionSubscriber|Boolean>}
 */
async function findOne(filter) {
  const subscribers = await notion.databases.query({
    database_id: databaseId,
    ...(filter && { filter }),
  });

  const subscriber = subscribers.results[0];

  return subscriber && {
    pageId: subscriber.id,
    chatId: subscriber.properties["chat_id"].title[0].text.content,
  };
}

const useSubscribers = (() => {
  return {
    notion,
    create,
    find,
    findOne,
  };
});

module.exports = useSubscribers;
