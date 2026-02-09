const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Thư mục chứa code web của bạn
const WWW_DIR = path.join(__dirname, 'www');
const MANIFEST_FILE = path.join(WWW_DIR, 'chcp.manifest');

// Hàm tính mã Hash của file
function getFileHash(filePath) {
    const fileData = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileData).digest('hex');
}

// Hàm quét tất cả các file trong thư mục www
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            // Không tính các file manifest và json của chính plugin
            if (file !== 'chcp.manifest' && file !== 'chcp.json') {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function buildManifest() {
    console.log('🚀 Đang bắt đầu tạo file manifest...');
    
    try {
        const allFiles = getAllFiles(WWW_DIR);
        const manifest = [];

        allFiles.forEach(file => {
            const relativePath = path.relative(WWW_DIR, file).replace(/\\/g, '/');
            const hash = getFileHash(file);
            manifest.push({
                file: relativePath,
                hash: hash
            });
        });

        fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
        console.log(`✅ Thành công! Đã quét xong ${manifest.length} file.`);
        console.log(`📍 File lưu tại: ${MANIFEST_FILE}`);
    } catch (error) {
        console.error('❌ Lỗi rồi:', error.message);
        process.exit(1);
    }
}

buildManifest();
