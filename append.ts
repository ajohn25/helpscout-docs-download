import fs from "fs";

const { LOG_SAVE_PROGRESS } = process.env;
const astroFolderName = 'astro';

const logFSError = (err: NodeJS.ErrnoException | null) => {
  if (err) {
    console.error(err);
  }
  // else saved successfully
};

const getTitle = (fileName: string) => {
  const wordsArray = fileName.split('-');
  const capitalizedArray = wordsArray.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  const title = capitalizedArray.join(' ');
  return title;
};

const getFiles = async (path: string) => {
  return fs.readdirSync(path, { withFileTypes: true });
};

const getCollectionFolders = async (path: string) => {
  const folders = (await getFiles(path))
    .filter(dirent => dirent.isDirectory())
    .filter(dir => dir.name.includes(' '));
  return folders;
};

const createAstroFolders = (collectionFolders: fs.Dirent[]) => {
  if (!fs.existsSync(astroFolderName)) fs.mkdir(astroFolderName, logFSError);

  for (const folder of collectionFolders) {
    try {
      const { name: existingName } = folder;
      const newFolderName = astroFolderName + '/' + existingName;

      if (!fs.existsSync(newFolderName)) fs.mkdir(newFolderName, logFSError);
    } catch (err) {
      console.error(err);
    }
  }
};

const createAstroFile = async (folderName: string, fileName: string) => {
  const HTML_EXTENSION_LENGTH = 5;
  const fileNameNoExtension = fileName.substring(0, fileName.length - HTML_EXTENSION_LENGTH);
  const newFileName = fileNameNoExtension + '.astro';

  const path = folderName + '/' + fileName;
  if (LOG_SAVE_PROGRESS) console.log(path);
  const html = fs.readFileSync(path);

  const title = getTitle(fileNameNoExtension);

  const fullContent = `	
---
import Layout from "../../../../layouts/Layout.astro";
import "animate.css";
---

<Layout title="With the Ranks">
	<main
		class="animate__animated animate__fadeIn animate__slow py-20 md:py-40"
	>
		<div class="flex items-center flex-col">
			<h2 class="text-center">${title}</h2>

`
    + html
    + `
    </div>
	</main>
</Layout>
`;

  const newFilePath = astroFolderName + '/' + folderName + '/' + newFileName;
  fs.writeFile(newFilePath, fullContent, logFSError);
};

const createAstroFiles = async (collectionFolders: fs.Dirent[]) => {
  for (const folder of collectionFolders) {
    const articleFiles = await getFiles(folder.name);
    for (const file of articleFiles) {
      createAstroFile(folder.name, file.name);
    }
  }
};

const downloadArticles = async () => {
  const collectionFolders = await getCollectionFolders('./');
  createAstroFolders(collectionFolders);
  if (LOG_SAVE_PROGRESS === "true") console.log("Saving:");
  createAstroFiles(collectionFolders);
};

downloadArticles();