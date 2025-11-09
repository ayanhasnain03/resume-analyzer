import PDFParser from "pdf2json";

export const extractText = async (file: string) => {
  const fileBuffer = Buffer.from(file, "base64");
  const pdfParser = new (PDFParser as any)(null, 1);
  const resumeText = await new Promise<string>((resolve, reject) => {
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(
        new Error(
          `Error parsing PDF: ${errData.parserError || errData.message}`
        )
      );
    });

    pdfParser.on("pdfParser_dataReady", () => {
      const parsedText = (pdfParser as any).getRawTextContent();
      resolve(parsedText);
    });

    pdfParser.parseBuffer(fileBuffer);
  });
  return resumeText;
};
