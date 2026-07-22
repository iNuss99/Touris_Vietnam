import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// thu muc chua anh can toi uu hoa
const targetDir = './src/assets/images';

// ham quet de quy cac thu muc va file de thuc hien convert
async function processDirectory(directory) {
  // doc toan bo danh sach file trong thu muc
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    // neu la thu muc thi tiep tuc duyet de quy vao trong
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } 
    // neu la file png thi tien hanh convert sang webp
    else if (path.extname(file).toLowerCase() === '.png') {
      const outputFilePath = filePath.replace(/\.png$/i, '.webp');
      console.log(`Dang chuyen doi: ${filePath} -> ${outputFilePath}`);
      
      try {
        // su dung sharp de nen anh va chuyen doi format sang webp voi quality 80%
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(outputFilePath);
          
        console.log(`Da chuyen doi thanh cong: ${outputFilePath}`);
        
        // xoa file png goc de giam dung luong du an va tranh code thua
        fs.unlinkSync(filePath);
        console.log(`Da xoa file png cu: ${filePath}`);
      } catch (err) {
        console.error(`Loi khi xu ly file ${filePath}:`, err);
      }
    }
  }
}

// khoi chay ham xu ly
console.log('Bat dau qua trinh toi uu hoa hinh anh...');
processDirectory(targetDir)
  .then(() => {
    console.log('Hoan tat qua trinh toi uu hoa hinh anh!');
  })
  .catch(err => {
    console.error('Co loi xay ra trong qua trinh toi uu anh:', err);
  });
