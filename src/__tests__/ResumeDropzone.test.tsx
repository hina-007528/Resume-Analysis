import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { ResumeDropzone } from "@/components/analyzer/ResumeDropzone";

vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => ({
    getRootProps: () => ({
      "data-testid": "drop-root",
      onDrop: (e: DragEvent) => {
        const files = Array.from(e.dataTransfer?.files || []);
        const accepted = files.filter((f) => f.type === "application/pdf");
        onDrop(accepted as File[]);
      },
    }),
    getInputProps: () => ({
      "data-testid": "resume-input",
      accept: ".pdf",
    }),
    isDragActive: false,
  }),
}));

describe("ResumeDropzone", () => {
  it("handles drop/select for valid pdf", () => {
    const onFileSelect = vi.fn();
    render(<ResumeDropzone onFileSelect={onFileSelect} selectedFile={null} />);
    const root = screen.getByTestId("drop-root");
    const pdf = new File(["%PDF"], "resume.pdf", { type: "application/pdf" });
    fireEvent.drop(root, { dataTransfer: { files: [pdf] } });
    expect(onFileSelect).toHaveBeenCalledWith(pdf);
  });

  it("rejects non-pdf files", () => {
    const onFileSelect = vi.fn();
    render(<ResumeDropzone onFileSelect={onFileSelect} selectedFile={null} />);
    const root = screen.getByTestId("drop-root");
    const txt = new File(["text"], "resume.txt", { type: "text/plain" });
    fireEvent.drop(root, { dataTransfer: { files: [txt] } });
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("allows removing selected file", () => {
    const onFileSelect = vi.fn();
    const selected = new File(["%PDF"], "resume.pdf", { type: "application/pdf" });
    render(<ResumeDropzone onFileSelect={onFileSelect} selectedFile={selected} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onFileSelect).toHaveBeenCalledWith(null);
  });
});
