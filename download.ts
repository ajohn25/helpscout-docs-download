import fs from "fs";

type helpScoutCollection = {
  id: string;
  name: string;
};

type helpScoutArticle = {
  id: string;
  slug: string;
  text: string;
};

const { HELPSCOUT_API_KEY, LOG_SAVE_PROGRESS } = process.env;

const getHelpScoutURL = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      // HelpScout uses "basic" auth but ignores the password
      // https://developer.helpscout.com/docs-api/#authentication
      'Authorization': 'Basic ' + btoa(`${HELPSCOUT_API_KEY}:password`)
    }
  });
  return await response.json();
};

const getHelpScoutCollections = async () => {
  const result = await getHelpScoutURL("https://docsapi.helpscout.net/v1/collections");
  const collections = result.collections.items;
  return collections;
};

const getHelpScoutArticles = async (collectionId: string) => {
  const result = await getHelpScoutURL(`https://docsapi.helpscout.net/v1/collections/${collectionId}/articles`);
  const articles = result.articles.items;
  return articles;
};

const getHelpScoutArticle = async (articleId: string) => {
  const result = await getHelpScoutURL(`https://docsapi.helpscout.net/v1/articles/${articleId}`);
  return result.article;
};

const logFSError = (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error(err);
  }
  // else saved successfully
};

const createLocalCollectionFolders = (collections: helpScoutCollection[]) => {
  for (const collection of collections) {
    try {
      const { name } = collection;
      if (!fs.existsSync(name)) fs.mkdir(name, logFSError);
    } catch (err) {
      console.error(err);
    }
  }
};

const createLocalArticleFile = async (article: helpScoutArticle, collection: helpScoutCollection) => {
  const { slug } = article;
  if (LOG_SAVE_PROGRESS === "true") console.log(article.slug);
  fs.writeFile(`${collection.name}/${slug}.html`, article.text, logFSError);
};

const createLocalArticleFiles = async (collections: helpScoutCollection[]) => {
  for (const collection of collections) {
    const articles = await getHelpScoutArticles(collection.id);
    for (const article of articles) {
      const fullArticle = await getHelpScoutArticle(article.id);
      createLocalArticleFile(fullArticle, collection);
    }
  }
};

const downloadArticles = async () => {
  const collections = await getHelpScoutCollections();
  createLocalCollectionFolders(collections);
  if (LOG_SAVE_PROGRESS === "true") console.log("Saving:");
  createLocalArticleFiles(collections);
};

downloadArticles();