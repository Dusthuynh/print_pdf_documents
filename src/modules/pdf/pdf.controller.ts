// pdf.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import * as fs from 'fs';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('generate-pdf')
  async generateStudentListPdf(@Res() res: Response) {
    const pdfBuffer = await this.pdfService.generateStudentListPdfFromEjs();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=generated.pdf`);
    res.send(pdfBuffer);
  }

  @Get('score-students')
  async generateScoreStudentsPdf(@Res() res: Response) {
    const pdfBuffer = await this.pdfService.generateScoreStudentsPdfFromEjs();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=generated.pdf`);
    res.send(pdfBuffer);
  }

  @Get('generate-score-students')
  async generatePdf(@Res() res: Response): Promise<void> {
    const zipFilePath = await this.pdfService.generateScoreStudentsPdf();
    res.download(zipFilePath, 'result.zip', (err) => {
      if (err) {
      } else {
        fs.unlinkSync(zipFilePath);
      }
    });
  }
}
