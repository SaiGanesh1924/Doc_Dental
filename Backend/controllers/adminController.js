import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import PDFDocument from "pdfkit";
import Submission from "../models/Submission.model.js";
import cloudinary from "../libs/cloudinary.js";
import axios from "axios";

// =============================
// Get all submissions (Admin)
// =============================
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate("patient", "name email")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
};

async function downloadImage(url, filePath) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  await fs.writeFile(filePath, response.data);
  return filePath;
}

// =============================
// Save annotation
// =============================
export const saveAnnotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { annotationData, annotatedImageData, imageType } = req.body;
    // imageType should be 'upper', 'front', or 'bottom'

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Convert base64 -> buffer -> temp file
    const base64Data = annotatedImageData.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const buffer = Buffer.from(base64Data, "base64");

    const tempDir = "temp";
    const tempPath = path.join(
      tempDir,
      `annotated-${imageType}-${Date.now()}.png`
    );

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(tempPath, buffer);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      folder: `Oralvis/annotated/${imageType}`,
    });

    // Clean up temp file
    await fs.unlink(tempPath);
    if (!submission.annotationData) submission.annotationData = {};
    console.log(imageType, annotationData);

    // Save annotation and URL to correct field
    submission.annotationData = {
      ...submission.annotationData,
      [imageType]: annotationData[imageType],
    };
    submission.markModified("annotationData");

    if (imageType === "upper")
      submission.upperAnnotatedImageUrl = uploadResult.secure_url;
    else if (imageType === "front")
      submission.frontAnnotatedImageUrl = uploadResult.secure_url;
    else if (imageType === "bottom")
      submission.bottomAnnotatedImageUrl = uploadResult.secure_url;

    submission.status = "annotated";

    await submission.save();

    res.json({
      message: `Annotation saved successfully for ${imageType} image`,
      submission,
    });
  } catch (error) {
    console.error("Error saving annotation:", error);
    res.status(500).json({ message: "Error saving annotation" });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id).populate(
      "patient",
      "name email"
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Ensure temp folder
    await fs.mkdir("temp", { recursive: true });
    const tempPath = path.join("temp", `report-${Date.now()}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const stream = createWriteStream(tempPath);
    doc.pipe(stream);

    // === Background + Outer Border ===
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#EDE7F6"); // light purple
    doc.fillColor("black");
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke("#3B82F6");

    // === Title ===
    doc
      .fontSize(22)
      .fillColor("#4B0082")
      .font("Helvetica-Bold")
      .text("Oral Health Screening Report", {
        align: "center",
        underline: true,
      });
    doc.moveDown();

    // === Patient Info Row ===
    doc
      .fontSize(10)
      .fillColor("#000")
      .font("Helvetica")
      .text(`Name: ${submission.patient?.name || "N/A"}`, 40, 100)
      .text(`PatientId: ${submission.patientId || "N/A"}`, 250, 100)
      .text(`Date: ${new Date().toLocaleDateString()}`, 450, 100);

    doc.moveDown(2);

    // === SCREENING REPORT HEADING ===
    let screeningY = 140; // fixed Y position below patient info
    doc
      .fontSize(12)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("SCREENING REPORT:", 40, screeningY);

    // === Grey Image Box ===
    let sectionY = doc.y + 10;
    let boxX = 40;
    let boxWidth = doc.page.width - 80;
    let boxHeight = 240;

    doc
      .rect(boxX, sectionY, boxWidth, boxHeight)
      .fillAndStroke("#F5F5F5", "black");

    // === Images inside the box ===
    let imgSize = 150;
    let spacing = 20;
    let startX = boxX + 20;
    let y = sectionY + 10;

    const drawImageWithHeading = async (imageUrl, label, x) => {
      if (!imageUrl) return;
      const tempImg = await downloadImage(
        imageUrl,
        `temp/${label}-${Date.now()}.jpg`
      );

      // Draw image
      doc.image(tempImg, x, y, { width: imgSize, height: imgSize + 20 });

      // Red label box with grey border
      let headingY = y + imgSize + 10;
      doc.rect(x, headingY, imgSize, 20).fillAndStroke("#FF4C4C", "grey");
      doc
        .fillColor("white")
        .fontSize(10)
        .text(label, x, headingY + 4, {
          align: "center",
          width: imgSize,
        });

      await fs.unlink(tempImg);
    };

    await drawImageWithHeading(
      submission.upperAnnotatedImageUrl,
      "Upper Teeth",
      startX
    );
    await drawImageWithHeading(
      submission.frontAnnotatedImageUrl,
      "Front Teeth",
      startX + imgSize + spacing
    );
    await drawImageWithHeading(
      submission.bottomAnnotatedImageUrl,
      "Lower Teeth",
      startX + 2 * (imgSize + spacing)
    );

    // === LEGEND (below grey box) ===
    let legendY = sectionY + boxHeight + 30;
    let legendItems = [
      { color: "#5D1451", text: "Inflammed / Red gums" },
      { color: "#FFD700", text: "Malaligned" },
      { color: "#8B7B8B", text: "Receded gums" },
      { color: "#FF0000", text: "Stains" },
      { color: "#00CED1", text: "Attrition" },
      { color: "#C71585", text: "Crowns" },
    ];
    let lx = 30;
    let ly = legendY;
    let maxWidth = doc.page.width - 60; // leave some margin

    legendItems.forEach((item, i) => {
      // Draw color box
      doc.rect(lx, ly, 10, 10).fill(item.color).stroke();

      // Draw text
      doc
        .fillColor("black")
        .fontSize(9)
        .text(item.text, lx + 15, ly - 2, { width: 120 }); // give width to prevent overflow

      // Move X for next item
      lx += 140; // more horizontal spacing

      if (lx + 140 > maxWidth) {
        lx = 30; // reset X
        ly += 20; // move to next line
      }
    });

    let recommendationsY = legendY + 50; // push 50px below legend
    doc
      .fontSize(12)
      .fillColor("#0A2540")
      .font("Helvetica-Bold")
      .text("TREATMENT RECOMMENDATIONS:", 40, recommendationsY);

    let treatments = [
      {
        color: "#581845",
        text: "Inflammed or Red gums",
        suggestion: "Scaling.",
      },
      {
        color: "#FFD700",
        text: "Malaligned",
        suggestion: "Braces or Clear Aligner",
      },
      { color: "#8D6E63", text: "Receded gums", suggestion: "Gum Surgery." },
      {
        color: "#FF0000",
        text: "Stains",
        suggestion: "Teeth cleaning and polishing.",
      },
      {
        color: "#00BCD4",
        text: "Attrition",
        suggestion: "Filling/ Night Guard.",
      },
      {
        color: "#E91E63",
        text: "Crowns",
        suggestion:
          "If the crown is loose or broken, better get it checked. Teeth coloured caps are the best ones.",
      },
    ];

    let ty = recommendationsY + 20;
    treatments.forEach((t) => {
      doc.rect(40, ty, 10, 10).fill(t.color).stroke();
      doc
        .fillColor("black")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(t.text, 60, ty - 2, { continued: true })
        .font("Helvetica")
        .text(" : " + t.suggestion);
      ty += 20;
    });

    doc.end();

    // Wait for stream
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      folder: "Oralvis_reports",
      resource_type: "raw",
      format: "pdf",
    });

    await fs.unlink(tempPath);

    submission.reportUrl = uploadResult.secure_url;
    submission.status = "reported";
    await submission.save();

    res.json({
      message: "PDF report generated successfully",
      reportUrl: submission.reportUrl,
      submission,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF report" });
  }
};
