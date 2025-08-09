import React, { useState } from "react";
import {
  FaFile,
  FaFileAlt,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
} from "react-icons/fa";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { getFileType } from "./storyAttachmentViewerUtils";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface StoryAttachmentViewerProps {
  attachmentUrl: string;
  isModal?: boolean;
}

enum LoadingStates {
  Success = "success",
  Loading = "loading",
  Error = "error",
}

export const StoryAttachmentViewer: React.FC<StoryAttachmentViewerProps> = ({
  attachmentUrl,
  isModal = false,
}) => {
  const attachmentIsAvailable = attachmentUrl !== "";
  const fileNamePartInURL = attachmentUrl.split("/").pop();

  const [loadState, setLoadState] = useState<LoadingStates>(
    LoadingStates.Loading
  );

  const handleLoadSuccess = () => {
    setLoadState(LoadingStates.Success);
  };

  const handleLoadError = () => {
    setLoadState(LoadingStates.Error);
  };

  const renderIconForTextOrOfficeOrGenericFile = (fileType: string) => {
    let IconComponent;
    let extension = "";
    // Ignore time value and random number generated in backend
    const originalFileName = fileNamePartInURL
      ?.split("-")
      .slice(0, -2)
      .join("-");

    switch (fileType) {
      case "text":
        IconComponent = FaFileAlt;
        extension = ".txt";
        break;
      case "word":
        IconComponent = FaFileWord;
        extension = ".docx";
        break;
      case "powerpoint":
        IconComponent = FaFilePowerpoint;
        extension = ".pptx";
        break;
      case "excel":
        IconComponent = FaFileExcel;
        extension = ".xlsx";
        break;
      default: // for generic file
        IconComponent = FaFile;
        break;
    }

    // Combine the original file name with its extension
    const formattedFileName = `${originalFileName}${extension}`;

    const isMovFile = attachmentUrl.toLocaleLowerCase().includes(".mov");
    const isMp4File = attachmentUrl.toLocaleLowerCase().includes(".mp4");

    if (isMp4File || isMovFile) {
      return (
        <video
          style={{ width: "100%", height: "370px", display: "block" }}
          controls
        >
          <source src={attachmentUrl} type="video/mp4" />
        </video>
      );
    }

    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center pt-10 md:pt-0"
        data-testid="attachment"
      >
        <IconComponent role="icon" size="48" />
        <p
          className="font-interMedium text-md text-black m-2"
          data-testid="filename"
        >
          {formattedFileName}
        </p>
      </a>
    );
  };

  const url = attachmentUrl.replace("http://", "https://");

  const pdfDimensions = isModal ? 500 : 350;
  // functions to render attachments based on file types
  const renderAttachment = (fileType: string) => {
    switch (fileType) {
      case "image":
        return (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full relative"
            data-testid="attachment"
          >
            <img
              src={attachmentUrl}
              alt="Story Attachment"
              style={{ objectFit: "contain", borderRadius: "20px" }}
              className="w-full lg:w-[90%] h-[70%] lg:h-[80%] h-full bg-white mx-auto my-auto p-2"
            />
          </a>
        );
      case "pdf":
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full relative"
            data-testid="attachment"
          >
            <Document
              file={url}
              loading={<div>Loading PDF...</div>}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
            >
              <Page
                pageNumber={1}
                renderTextLayer={false}
                height={pdfDimensions}
                width={pdfDimensions}
              />
            </Document>
            {loadState === "error" && <div>Can't load PDF</div>}
          </a>
        );
      // handle .txt, msft office files and others with onClick Icon
      default:
        return renderIconForTextOrOfficeOrGenericFile(fileType);
    }
  };

  return (
    <div
      className="flex flex-col mx-auto my-auto items-center pt-1"
      onClick={(e) => e.stopPropagation()}
    >
      {attachmentIsAvailable && renderAttachment(getFileType(attachmentUrl))}
    </div>
  );
};
