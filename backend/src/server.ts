import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import cors from 'cors'

const app = express();
const upload = multer({ dest: 'uploads/' });
const unlink = promisify(fs.unlink);

interface CSVData {
  [key: string]: string;
}

let csvData: CSVData[] = [];

app.use(cors())

app.post('/api/files', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(500).json({ message: 'Failed to upload file.' });
  }

  const filePath = path.join(__dirname, '../uploads', req.file.filename);
  
  try {
    const fileData: CSVData[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => fileData.push(row))
        .on('end', () => {
          csvData = fileData;
          resolve();
        })
        .on('error', (error) => reject(error));
    });

    await unlink(filePath);
    // console.log(fileData)

    res.status(200).json({ message: 'The file was uploaded successfully.' });
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();

  if (!query) {
    return res.status(200).json({ data: csvData });
  }

  const filteredData = csvData.filter((row) =>
    Object.values(row).some((value) => value.toLowerCase().includes(query))
  );

  res.status(200).json({ data: filteredData });
});

app.use((err:any, req:any, res:any, next:any) => {
  console.error(err);
  res.status(500).json({ message: 'An error occurred.' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
