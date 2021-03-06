# π noti-shirt
No T-shirt? get a NOTI of the shirt.

## About
μ’μνλ λΈλλμ μ¬μκ³ , μ μν μλ¦Όμ νλ κ·Έλ¨μμ λ°μλ³΄μΈμ.

## Why noti-shirt?
μ¬μκ³ , μ μν μλ¦Όμ μ§μνμ§ μλ μΌνλͺ°μμ μλ¦Όμ λ°κ³  μΆμ΄μ λ§λ€μμ΅λλ€.

## How does it work?
μ¬μ΄νΈμμ λ΄κ° μνλ λΈλλ κ΅¬λ μ μ²­μ νλ©΄ νλ κ·Έλ¨ λ΄μ΄ μ¬μκ³ , μ μν μλ¦Ό λ©μΈμ§λ₯Ό λ³΄λ΄μ€λλ€.

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
