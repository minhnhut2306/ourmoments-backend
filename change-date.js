require('dotenv').config();
const mongoose = require('mongoose');

const Media = require('./src/models/Media.model');
const FavoriteMedia = require('./src/models/FavoriteMedia.model');

const TARGET_DATE = '2026-01-20';
const NEW_DATE = '2023-01-31';
const COLLECTION_TYPE = 'both';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('Kết nối MongoDB thành công');
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
}

function parseDate(dateStr) {
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  
  const [, year, month, day] = match;
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

async function findRecordsByDate(collection, targetDate) {
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const records = await collection.find({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  return records;
}

async function updateRecordsDates(collection, targetDate, newDateBase) {
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const records = await collection.find({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  let modifiedCount = 0;
  for (const record of records) {
    const oldDate = new Date(record.createdAt);
    
    const newDate = new Date(newDateBase);
    newDate.setUTCHours(
      oldDate.getUTCHours(),
      oldDate.getUTCMinutes(),
      oldDate.getUTCSeconds(),
      oldDate.getUTCMilliseconds()
    );

    await collection.updateOne(
      { _id: record._id },
      { $set: { createdAt: newDate } }
    );
    
    modifiedCount++;
  }

  return { modifiedCount };
}

async function main() {
  await connectDB();

  console.log('\n' + '='.repeat(50));
  console.log('SCRIPT THAY ĐỔI NGÀY TRONG MONGODB');
  console.log('='.repeat(50) + '\n');

  const targetDate = parseDate(TARGET_DATE);
  if (!targetDate) {
    console.log('TARGET_DATE không hợp lệ. Vui lòng dùng format YYYY-MM-DD');
    process.exit(1);
  }

  const newDate = parseDate(NEW_DATE);
  if (!newDate) {
    console.log('NEW_DATE không hợp lệ. Vui lòng dùng format YYYY-MM-DD');
    process.exit(1);
  }

  let collections = [];
  let collectionNames = [];
  
  if (COLLECTION_TYPE === 'media') {
    collections = [Media];
    collectionNames = ['Media'];
  } else if (COLLECTION_TYPE === 'favorite') {
    collections = [FavoriteMedia];
    collectionNames = ['FavoriteMedia'];
  } else if (COLLECTION_TYPE === 'both') {
    collections = [Media, FavoriteMedia];
    collectionNames = ['Media', 'FavoriteMedia'];
  } else {
    console.log('COLLECTION_TYPE không hợp lệ. Chỉ chấp nhận: media, favorite, hoặc both');
    process.exit(1);
  }

  console.log('THÔNG TIN CẤU HÌNH:');
  console.log('-'.repeat(50));
  console.log(`Ngày cần tìm:    ${TARGET_DATE}`);
  console.log(`Ngày thay thế:   ${NEW_DATE}`);
  console.log(`Giờ phút giây:   Giữ nguyên từ record cũ`);
  console.log(`Collections:     ${collectionNames.join(', ')}`);
  console.log('-'.repeat(50) + '\n');

  console.log('Đang tìm kiếm bản ghi...\n');
  let totalFound = 0;
  for (let i = 0; i < collections.length; i++) {
    const records = await findRecordsByDate(collections[i], targetDate);
    console.log(`   ${collectionNames[i]}: Tìm thấy ${records.length} bản ghi`);
    totalFound += records.length;
  }

  if (totalFound === 0) {
    console.log('\nKhông tìm thấy bản ghi nào với ngày này');
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log(`\nTổng cộng: ${totalFound} bản ghi\n`);
  console.log('Đang cập nhật...\n');
  
  let totalUpdated = 0;
  for (let i = 0; i < collections.length; i++) {
    const result = await updateRecordsDates(collections[i], targetDate, newDate);
    console.log(`   ${collectionNames[i]}: Đã cập nhật ${result.modifiedCount} bản ghi`);
    totalUpdated += result.modifiedCount;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`HOÀN THÀNH! Đã cập nhật ${totalUpdated} bản ghi`);
  console.log('='.repeat(50) + '\n');

  await mongoose.connection.close();
  console.log('Đã đóng kết nối MongoDB\n');
}

process.on('unhandledRejection', (err) => {
  console.error('Lỗi:', err.message);
  mongoose.connection.close();
  process.exit(1);
});

main();