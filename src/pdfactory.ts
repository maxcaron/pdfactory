import { Browser } from "puppeteer";

import {
  compileRenderingFunctions,
  renderHtmlStrings,
  RenderedHtmlStrings,
} from "./renderingFunctions";
import {
  PdfRequest,
  Pdfactory,
  RenderingFunctions,
  PdfactoryError,
} from "./types";
import { htmlStringsToPdf } from "./htmlStringsToPdf";
import { launchBrowser } from "./browser";
import { DEFAULT_EJS_CONFIG, DEFAULT_PDF_OPTIONS } from "./constants";

let browser: Browser;
let renderingFunctions: RenderingFunctions;

const pdfactory: Pdfactory = async (
  config = DEFAULT_EJS_CONFIG,
  pdfOptions = DEFAULT_PDF_OPTIONS
) => {
  browser = await launchBrowser();

  try {
    renderingFunctions = compileRenderingFunctions(
      config
    ) as RenderingFunctions;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  return async (pdfRequest: PdfRequest): Promise<Buffer | PdfactoryError> => {
    const { renderedHtml, headerTemplate, footerTemplate } = renderHtmlStrings(
      renderingFunctions,
      pdfRequest
    ) as RenderedHtmlStrings;

    const pdf: Buffer = await htmlStringsToPdf(browser, renderedHtml, {
      ...pdfOptions,
      displayHeaderFooter: !!(headerTemplate || footerTemplate),
      headerTemplate,
      footerTemplate,
    });

    return pdf;
  };
};

export { pdfactory };
