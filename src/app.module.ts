import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PdfController } from './modules/pdf/pdf.controller';
import { PdfService } from './modules/pdf/pdf.service';

@Module({
  imports: [],
  controllers: [AppController, PdfController],
  providers: [PdfService],
})
export class AppModule {}
