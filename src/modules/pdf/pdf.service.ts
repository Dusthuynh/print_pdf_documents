// pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import scoreStudents from 'src/files/data/score-students.data';
import listStudent from 'src/files/data/list-student.data';

@Injectable()
export class PdfService {
  async generateStudentListPdfFromEjs() {
    const students = listStudent;
    const ejsTemplate = fs.readFileSync(
      'src/files/templates/student-list.ejs',
      'utf8',
    );

    const teacherName = 'Đoàn Thị Điểm';
    const htmlContent = ejs.render(ejsTemplate, { students, teacherName });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setContent(htmlContent);

    // Tạo tệp PDF
    const pdfBuffer = await page.pdf();

    await browser.close();
    return pdfBuffer;
  }

  async generateScoreStudentsPdfFromEjs() {
    const scoreStudent = scoreStudents[3];
    const ejsTemplate = fs.readFileSync(
      'src/files/templates/score-students.ejs',
      'utf8',
    );
    const htmlContent = ejs.render(ejsTemplate, { sinhVien: scoreStudent });

    const browser = await puppeteer.launch({ headless: 'new' });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf();
    await browser.close();
    return pdfBuffer;
  }

  async generateScoreStudentsPdf(): Promise<string> {
    const pdfsFolder = path.join(__dirname, 'pdfs'); // Tạo thư mục lưu trữ các PDF tạm thời
    fs.mkdirSync(pdfsFolder, { recursive: true });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const ejsTemplate = fs.readFileSync(
      'src/files/templates/score-students.ejs',
      'utf8',
    );

    const pdfPromises = [];

    for (const student of scoreStudents) {
      const pdfFilePath = path.join(pdfsFolder, `Diem_${student.ten}.pdf`);
      await page.setContent(ejs.render(ejsTemplate, { sinhVien: student }));
      await page.pdf({ path: pdfFilePath, format: 'A4' });
      pdfPromises.push(pdfFilePath);
    }

    await browser.close();

    // Nén các tệp PDF thành một tệp ZIP
    const zipFilePath = path.join(__dirname, 'result.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    pdfPromises.forEach((pdfPath) => {
      archive.file(pdfPath, { name: path.basename(pdfPath) });
    });

    archive.finalize();

    return new Promise<string>((resolve) => {
      output.on('close', () => {
        resolve(zipFilePath);
      });
    });
  }
}
