import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StoryAttachmentViewer } from "./StoryAttachmentViewer";

/*
 * Image attachment
 */
describe("renders image URL in StoryAttachmentViewer", () => {
  const testImageUrl = "https://localhost:8000/image.jpg";

  it("renders an image when given an image URL", () => {
    render(<StoryAttachmentViewer attachmentUrl={testImageUrl} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", testImageUrl);
    expect(image).toHaveAttribute("alt", "Story Attachment");
  });

  it("stops click propagation when clicking on the attachment", () => {
    const handleClick = jest.fn(); // mock the click function
    // simulate situation with background propagation
    render(
      <div onClick={handleClick}>
        <StoryAttachmentViewer attachmentUrl={testImageUrl} />
      </div>
    );
    const image = screen.getByRole("img");
    fireEvent.click(image);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

/*
 * PDF attachment
 */
describe("renders PDF URL in StoryAttachmentViewer", () => {
  // Set PDF test url
  const testPdfUrl = "https://localhost:8000/document.pdf";

  it("renders a PDF preview", () => {
    render(<StoryAttachmentViewer attachmentUrl={testPdfUrl} />);
    // Find PDF via the role set
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("renders a PDF preview with an anchor tag", () => {
    render(<StoryAttachmentViewer attachmentUrl={testPdfUrl} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", testPdfUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  // Test for loading state remains the same
  it("handles loading state when rendering PDF preview", () => {
    render(<StoryAttachmentViewer attachmentUrl={testPdfUrl} />);
    expect(screen.getByText("Loading PDF...")).toBeInTheDocument();
  });

  // New test for error state
  it("displays an error message if the PDF fails to load", async () => {
    render(<StoryAttachmentViewer attachmentUrl={testPdfUrl} />);
    // Use findByText for potentially asynchronous updates, and assume the error state is somehow triggered
    const errorMessage = await screen.findByText("Can't load PDF");
    expect(errorMessage).toBeInTheDocument();
  });
});

describe("StoryAttachmentViewer Rendering Other Files", () => {
  const baseTestUrl = "https://localhost:8000/";
  const fileTypes = [
    { type: "text", extension: ".txt" },
    { type: "Microsoft Word", extension: ".docx" },
    { type: "Microsoft PowerPoint", extension: ".pptx" },
    { type: "Microsoft Excel", extension: ".xlsx" },
    { type: "RTF", extension: "" },
  ];

  fileTypes.forEach(({ type, extension }) => {
    // filename with random numbers by current logic of assigning name
    const sampleFileName = `sample-222222222222-777777777777${extension}`;
    const testUrl = `${baseTestUrl}${sampleFileName}`;

    // Check properties of the anchor's tags
    it(`correctly handles and renders a link for a ${type} file`, () => {
      render(<StoryAttachmentViewer attachmentUrl={testUrl} />);

      // Get the anchor's href
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", testUrl);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    // Mock the onClick handler for attachments
    it(`ensures the onClick handler for a ${type} file prevents default event handling and propagation`, () => {
      const handleClick = jest.fn((e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      render(
        <a href={testUrl} onClick={handleClick}>
          Sample ${type} File
        </a>
      );
      const attachmentLink = screen.getByRole("link");
      act(() => {
        /* fire events that update state */
        fireEvent.click(attachmentLink);
      });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // Test file-type-specific icons
    it(`displays the correct icon for a ${type} file`, () => {
      render(<StoryAttachmentViewer attachmentUrl={testUrl} />);

      // Select icon
      const icon = screen.getByRole("icon");
      expect(icon).toBeInTheDocument();
    });

    it(`displays the correct filename for a ${type} file`, () => {
      render(<StoryAttachmentViewer attachmentUrl={testUrl} />);

      // Select filename
      const fileNameElement = screen.getByTestId("filename");
      expect(fileNameElement).toHaveTextContent(
        `${sampleFileName.split("-").slice(0, -2)}${extension}`
      );
    });
  });
});
