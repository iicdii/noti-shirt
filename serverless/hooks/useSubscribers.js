const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_SUBSCRIBERS_DATABASE_ID;

/**
 * 노션 구독자 리스트에 구독자를 추가하는 함수
 * @param {String} chatId - 텔레그램 채팅방 id
 * @returns {Promise<Boolean>} - 성공 여부
 */
async function addUser(chatId) {
  if (!chatId) throw new Error('invalid chat id');

  if (await findSubscriberByChatId(chatId)) {
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
                "content": `${chatId}`
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
 * @returns {Promise<{chatId: *, pageId: *}[]>}
 */
async function getSubscribers() {
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
      chatId: page.properties["chat_id"].title[0].text.content,
    }
  });
}

/**
 * 노션에서 텔레그램 채팅방 id로 구독자를 찾는 함수
 * @param {String} chatId
 * @returns {Promise<Object>}
 */
async function findSubscriberByChatId(chatId) {
  if (!chatId) throw new Error('Invalid chat id');

  const subscribers = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "chat_id",
      text: {
        equals: `${chatId}`,
      },
    },
  });

  return subscribers.results[0];
}

const useSubscribers = (() => {
  return {
    notion,
    addUser,
    getSubscribers,
    findSubscriberByChatId,
  };
});

module.exports = useSubscribers;
