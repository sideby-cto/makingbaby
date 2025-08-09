export const getFileType = (filename: string): string => {
  const fileExtension = filename.split(".").pop()?.toLowerCase();
  switch (fileExtension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "svg":
      return "image";

    case "pdf":
      return "pdf";

    case "doc":
    case "docx":
      return "word";

    case "xls":
    case "xlsx":
      return "excel";

    case "ppt":
    case "pptx":
      return "powerpoint";

    case "txt":
    case "text":
      return "text";

    default:
      return "unknown";
  }
};
