# Help Scout Docs Download

Use this script to create a local backup of your Help Scout [knowledge base(s)](https://docs.helpscout.com/article/129-help-scout-docs)

#### Install dependencies

```sh
bun install
```

#### Copy the example environment

```sh
cp .env.example .env
```

#### Add your Help Scout Docs API Key

https://developer.helpscout.com/docs-api/

#### Run the script

```sh
bun download.ts
```

A subfolder for each of your Help Scout collections will be created in the main project folder. The text for each article will be saved in the appropriate folder as a `.html` file titled with the article slug.