import { Toastify } from "../../utils";

async function GetImageBlob(url: any) {
  const image = await fetch(url);
  const blob = await image.blob();
  return blob;
}

const resourceUrlHack = (url: string) => {
  const appurl = window.location.href;
  let resourceUrl = url;
  if (appurl.startsWith("http:") && url.startsWith("https:")) {
    resourceUrl = url.replace("https:", "http:");
    return resourceUrl;
  }
  if (appurl.startsWith("https:") && url.startsWith("http:")) {
    resourceUrl = url.replace("http:", "https:");
    return resourceUrl;
  }
  return resourceUrl;
};

export const DownloadAttachment = async (file: any) => {
  if (!file) {
    Toastify("warn", "No Attachment found");
    return;
  }
  try {
    const { url } = file;
    const resourceUrl = resourceUrlHack(url);
    const filename = resourceUrl!.split("/").pop();
    const imageBlog = await GetImageBlob(resourceUrl);
    const imageURL = URL.createObjectURL(imageBlog);
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "" + filename + "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error: any) {
    Toastify("error", "Failed to Download Attachment");
  }
};
