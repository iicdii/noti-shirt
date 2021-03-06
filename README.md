# 👕 noti-shirt
No T-shirt? get a NOTI of the shirt.

## About
좋아하는 브랜드의 재입고, 신상품 알림을 텔레그램에서 받아보세요.

## Why noti-shirt?
재입고, 신상품 알림을 지원하지 않는 쇼핑몰에서 알림을 받고 싶어서 만들었습니다.

## How does it work?
사이트에서 내가 원하는 브랜드 구독 신청을 하면 텔레그램 봇이 재입고, 신상품 알림 메세지를 보내줍니다.

## Getting started
### Notion
#### 1. Create an integration

Referring [here](https://developers.notion.com/docs/getting-started#step-1-create-an-integration), create an integration.

#### 2. Create `Products` Database

| Column Name         | Type    |
|:-------------------:|:-------:|
| id                  | Text    |
| name                | Title   |
| front_brand_no      | Text    |
| category_large_code | Text    |
| sold_out            | Boolean |
| new                 | Boolean |

#### 3. Create `Subscribers` Database

| Column Name | Type  |
|:-----------:|:-----:|
| chat_id     | Title |

#### 4. Create `Subscribe` Database

| Column Name   | Type         |
|:-------------:|:------------:|
| id            | Title        |
| chat_id       | Text         |
| shop          | Select       |
| target        | Multi Select |

#### 5. Share databases with integration

Refer to [here](https://developers.notion.com/docs/getting-started#step-2-share-a-database-with-your-integration) and share the databases you created with the integration you created.

### Serverless
#### 1. Install packages
```sh
cd serverless
yarn install
```

#### 2. Copy `.env.example` to `.env` and fill it.

Note that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are necessary for
deploying serverless.

#### 3. Define AWS profile named `noti-shirt` generally located in `~/.aws/credentials`

**Example**
```
[default]
aws_access_key_id=
aws_secret_access_key=
region=ap-northeast-1

[noti-shirt]
aws_access_key_id=
aws_secret_access_key=
region=ap-northeast-2
```

Now you don't have to switch AWS profile between projects using `aws configure` every time.

#### 4. Test core function
```sh
sls invoke local --function core
```

#### 5. Deploy
```sh
sls deploy --stage production
```

### Front-end
#### 1. Start dev mode
```sh
cd frontend
yarn dev
```

## Shop
- 29cm

## Built with
- [Serverless](https://www.serverless.com/)
- [Notion API](https://developers.notion.com/)
- [Telegram API](https://core.telegram.org/)
- [Next.js](https://nextjs.org/)

## License
[MIT](https://github.com/iicdii/noti-shirt/blob/main/LICENSE)
