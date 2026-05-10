import 'dotenv/config';
import mongoose from 'mongoose';
import slugify from 'slugify';
import Comment from './src/models/Comment.js';
import Comic from './src/models/Comic.js';
import Chapter from './src/models/Chapter.js';
import Category from './src/models/Category.js';
import User from './src/models/User.js';
import Payment from './src/models/Payment.js';


const IMG_BASE = 'https://picsum.photos/seed';

const categoriesData = [
  { name: 'Hành động', description: 'Thể loại hành động kịch tính', order: 1 },
  { name: 'Phiêu lưu', description: 'Những cuộc phiêu lưu kỳ thú', order: 2 },
  { name: 'Hài hước', description: 'Mang lại tiếng cười', order: 3 },
  { name: 'Drama', description: 'Kịch tính, cảm động', order: 4 },
  { name: 'Fantasy', description: 'Thế giới huyền ảo', order: 5 },
  { name: 'Kinh dị', description: 'Rùng rợn, ma quái', order: 6 },
  { name: 'Huyền bí', description: 'Bí ẩn, siêu nhiên', order: 7 },
  { name: 'Lãng mạn', description: 'Tình yêu đôi lứa', order: 8 },
  { name: 'Viễn tưởng', description: 'Khoa học viễn tưởng', order: 9 },
  { name: 'Siêu nhiên', description: 'Sức mạnh siêu nhiên', order: 10 },
  { name: 'Tâm lý', description: 'Chiều sâu tâm lý nhân vật', order: 11 },
  { name: 'Đời thường', description: 'Cuộc sống thường ngày', order: 12 },
  { name: 'Thể thao', description: 'Các môn thể thao', order: 13 },
  { name: 'Seinen', description: 'Dành cho nam giới trưởng thành', order: 14 },
  { name: 'Shounen', description: 'Dành cho nam thiếu niên', order: 15 },
  { name: 'Shoujo', description: 'Dành cho nữ thiếu niên', order: 16 },
];

const comicsData = [
  {
    title: 'One Piece',
    author: 'Oda Eiichiro',
    description: 'Monkey D. Luffy, một chàng trai trẻ có ước mơ trở thành Vua Hải Tặc, bắt đầu hành trình tìm kiếm kho báu One Piece huyền thoại. Cùng với băng Mũ Rơm, Luffy vượt qua vô số thử thách, đối đầu với hải quân và những tên hải tặc khét tiếng trên khắp bốn biển.',
    status: 'ongoing',
    publicationYear: 1997,
    categories: ['Hành động', 'Phiêu lưu', 'Hài hước', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 158000, totalBookmarks: 9500 }
  },
  {
    title: 'Naruto',
    author: 'Kishimoto Masashi',
    description: 'Uzumaki Naruto là một cậu bé ninja bị phong ấn Cửu Vĩ Hồ ly bên trong cơ thể. Bị mọi người xa lánh, Naruto quyết tâm trở thành Hokage – người đứng đầu làng Lá – để được công nhận. Hành trình của cậu cùng đồng đội Sakura và Sasuke đầy gian nan nhưng cũng tràn đầy tình bạn.',
    status: 'completed',
    publicationYear: 1999,
    categories: ['Hành động', 'Phiêu lưu', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 142000, totalBookmarks: 8800 }
  },
  {
    title: 'Attack on Titan',
    author: 'Isayama Hajime',
    description: 'Nhân loại sống trong những bức tường không lồ để tránh khỏi Titan – những sinh vật khổng lồ ăn thịt người. Eren Yeager sau khi mất mẹ vì Titan đã thề sẽ tiêu diệt tất cả bọn chúng. Nhưng sự thật đằng sau những bức tường còn khủng khiếp hơn những gì cậu từng tưởng tượng.',
    status: 'completed',
    publicationYear: 2009,
    categories: ['Hành động', 'Drama', 'Kinh dị', 'Seinen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 135000, totalBookmarks: 8200 }
  },
  {
    title: 'Demon Slayer',
    author: 'Gotouge Koyoharu',
    description: 'Kamado Tanjiro sống cùng gia đình trên núi. Sau khi trở về từ chợ, cậu phát hiện cả gia đình bị quỷ sát hại, chỉ còn em gái Nezuko bị biến thành quỷ. Tanjiro trở thành Thợ săn quỷ để tìm cách hóa giải lời nguyền cho em gái và trả thù cho gia đình.',
    status: 'completed',
    publicationYear: 2016,
    categories: ['Hành động', 'Phiêu lưu', 'Siêu nhiên', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 128000, totalBookmarks: 7900 }
  },
  {
    title: 'Jujutsu Kaisen',
    author: 'Akutami Gege',
    description: 'Itadori Yuji là một học sinh trung học có thể lực phi thường. Một ngày nọ, cậu nuốt phải ngón tay của Sukuna – Chú Linh cực kỳ nguy hiểm – và trở thành vật chủ của hắn. Itadori gia nhập trường Cao đẳng Chú thuật để tiêu diệt lời nguyền và tìm kiếm những ngón tay còn lại của Sukuna.',
    status: 'ongoing',
    publicationYear: 2018,
    categories: ['Hành động', 'Siêu nhiên', 'Kinh dị', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 121000, totalBookmarks: 7500 }
  },
  {
    title: 'Dragon Ball',
    author: 'Toriyama Akira',
    description: 'Son Goku, một cậu bé đuôi khỉ có sức mạnh phi thường, cùng bạn bè đi tìm ngọc rồng để thực hiện ước nguyện. Từ cuộc phiêu lưu thuở nhỏ đến những trận chiến sinh tử bảo vệ Trái Đất và vũ trụ, Goku không ngừng vượt qua giới hạn của bản thân.',
    status: 'completed',
    publicationYear: 1984,
    categories: ['Hành động', 'Phiêu lưu', 'Hài hước', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 115000, totalBookmarks: 7100 }
  },
  {
    title: 'Death Note',
    author: 'Ohba Tsugumi',
    description: 'Yagami Light, một thiên tài học sinh trung học, nhặt được một cuốn sổ đen có tên Death Note. Cuốn sổ có khả năng giết chết bất kỳ ai có tên được viết vào đó. Light bắt đầu cuộc chiến thanh lọc thế giới tội phạm, đối đầu với thám tử lừng danh L trong màn rượt đuổi trí tuệ nghẹt thở.',
    status: 'completed',
    publicationYear: 2003,
    categories: ['Tâm lý', 'Huyền bí', 'Seinen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 108000, totalBookmarks: 6800 }
  },
  {
    title: 'Fullmetal Alchemist',
    author: 'Arakawa Hiromu',
    description: 'Anh em nhà Elric – Edward và Alphonse – đã thực hiện phép thuật cấm kỵ để hồi sinh người mẹ quá cố, nhưng thất bại thảm khốc. Edward mất một chân một tay, Alphonse mất toàn bộ cơ thể. Họ lên đường tìm kiếm Hòn đá Phù thủy để khôi phục lại cơ thể mình.',
    status: 'completed',
    publicationYear: 2001,
    categories: ['Hành động', 'Phiêu lưu', 'Fantasy', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 102000, totalBookmarks: 6500 }
  },
  {
    title: 'Sword Art Online',
    author: 'Kawahara Reki',
    description: 'Năm 2022, thế giới thực tế ảo VRMMORPG Sword Art Online ra mắt. Người chơi phát hiện mình bị mắc kẹt trong game và không thể thoát ra cho đến khi đánh bại boss cuối. Nếu chết trong game, họ cũng chết ngoài đời thực. Kirito phải chiến đấu để sống sót và giải thoát mọi người.',
    status: 'completed',
    publicationYear: 2002,
    categories: ['Hành động', 'Viễn tưởng', 'Fantasy', 'Lãng mạn'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 95000, totalBookmarks: 6000 }
  },
  {
    title: 'My Hero Academia',
    author: 'Horikoshi Kouhei',
    description: 'Trong thế giới nơi 80% dân số sở hữu siêu năng lực (Quirk), Midoriya Izuku là một trong số ít người không có năng lực. Dù vậy, ước mơ trở thành anh hùng của cậu không bao giờ tắt. Sau cuộc gặp định mệnh với All Might, Izuku bắt đầu hành trình trở thành anh hùng vĩ đại nhất.',
    status: 'completed',
    publicationYear: 2014,
    categories: ['Hành động', 'Hài hước', 'Siêu nhiên', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 92000, totalBookmarks: 5800 }
  },
  {
    title: 'Tokyo Revengers',
    author: 'Wakui Ken',
    description: 'Hanagaki Takemichi phát hiện tin tức người yêu cũ bị giết bởi băng đảng Tokyo Manji. Bất ngờ, cậu bị xuyên không về 12 năm trước – thời trung học của mình. Takemichi quyết định thay đổi quá khứ để cứu bạn bè và người yêu, dù phải đối đầu với thế giới ngầm đầy nguy hiểm.',
    status: 'completed',
    publicationYear: 2017,
    categories: ['Hành động', 'Drama', 'Đời thường', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 88000, totalBookmarks: 5500 }
  },
  {
    title: 'One Punch Man',
    author: 'ONE',
    description: 'Saitama là một anh hùng có thể hạ gục bất kỳ kẻ thù nào chỉ bằng một cú đấm. Quá mạnh mẽ khiến cuộc sống của anh trở nên nhàm chán và luôn khao khát tìm được một đối thủ xứng tầm. Bộ truyện hài hước kết hợp với những trận đánh mãn nhãn đầy kịch tính.',
    status: 'ongoing',
    publicationYear: 2012,
    categories: ['Hành động', 'Hài hước', 'Siêu nhiên', 'Seinen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 85000, totalBookmarks: 5300 }
  },
  {
    title: 'Hunter x Hunter',
    author: 'Togashi Yoshihiro',
    description: 'Gon Freecss, một cậu bé 12 tuổi, rời hòn đảo nhỏ để trở thành Thợ săn (Hunter) và tìm kiếm người cha đã mất tích từ lâu. Trên hành trình, Gon kết bạn với Killua, Kurapika và Leorio, cùng nhau vượt qua kỳ thi Hunter đầy khắc nghiệt và khám phá những bí mật của thế giới.',
    status: 'ongoing',
    publicationYear: 1998,
    categories: ['Hành động', 'Phiêu lưu', 'Fantasy', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 82000, totalBookmarks: 5100 }
  },
  {
    title: 'Chainsaw Man',
    author: 'Fujimoto Tatsuki',
    description: 'Denji là một chàng trai nghèo khổ làm thợ săn quỷ để trả nợ cho cha. Sau bị phản bội, cậu hợp thể với chú quỷ cưng Pochita và trở thành Chainsaw Man – người có đầu và tay biến thành lưỡi cưa máy. Denji gia nhập tổ chức săn quỷ và khám phá những bí mật đen tối.',
    status: 'ongoing',
    publicationYear: 2018,
    categories: ['Hành động', 'Kinh dị', 'Siêu nhiên', 'Seinen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 78000, totalBookmarks: 4900 }
  },
  {
    title: 'Bleach',
    author: 'Kubo Tite',
    description: 'Kurosaki Ichigo có thể nhìn thấy linh hồn từ nhỏ. Một ngày, cậu vô tình nhận được sức mạnh của Thần chết (Shinigami) từ Rukia. Ichigo trở thành Thần chết thay thế, bảo vệ linh hồn và chiến đấu với Hollow – những linh hồn sa ngã.',
    status: 'completed',
    publicationYear: 2001,
    categories: ['Hành động', 'Siêu nhiên', 'Phiêu lưu', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 75000, totalBookmarks: 4700 }
  },
  {
    title: 'Spy x Family',
    author: 'Endo Tatsuya',
    description: 'Điệp viên tài ba Twilight phải xây dựng một gia đình giả để thực hiện nhiệm vụ duy trì hòa bình. Anh nhận nuôi một cô bé biết đọc suy nghĩ và kết hôn với một sát thủ chuyên nghiệp. Một gia đình kỳ lạ nhưng ấm áp bắt đầu.',
    status: 'ongoing',
    publicationYear: 2019,
    categories: ['Hài hước', 'Hành động', 'Đời thường', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 72000, totalBookmarks: 4500 }
  },
  {
    title: 'Solo Leveling',
    author: 'Chugong',
    description: 'Trong thế giới nơi những cánh cổng kết nối với thế giới quái vật, Sung Jinwoo là Thợ săn yếu nhất. Sau một biến cố trong hầm ngục kép, cậu nhận được năng lực đặc biệt – hệ thống cho phép cậu lên cấp không giới hạn.',
    status: 'completed',
    publicationYear: 2016,
    categories: ['Hành động', 'Fantasy', 'Siêu nhiên', 'Seinen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 98000, totalBookmarks: 6200 }
  },
  {
    title: 'Vinland Saga',
    author: 'Yukimura Makoto',
    description: 'Thorfinn là một cậu bé sống ở Iceland vào đầu thế kỷ 11. Sau khi cha bị sát hại bởi lính đánh thuê Askeladd, Thorfinn gia nhập phe của hắn để trả thù. Hành trình đưa cậu từ một chiến binh chỉ biết hận thù đến khám phá ý nghĩa thực sự của cuộc sống.',
    status: 'ongoing',
    publicationYear: 2005,
    categories: ['Hành động', 'Phiêu lưu', 'Drama', 'Seinen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 68000, totalBookmarks: 4200 }
  },
  {
    title: 'Haikyuu!!',
    author: 'Furudate Haruichi',
    description: 'Hinata Shoyo, dù thấp bé nhưng đam mê bóng chuyền cháy bỏng. Cậu gia nhập câu lạc bộ bóng chuyền trường Karasuno và cùng với đối thủ cũ Kageyama Tobio xây dựng một cặp đôi tấn công không thể ngăn cản.',
    status: 'completed',
    publicationYear: 2012,
    categories: ['Thể thao', 'Hài hước', 'Đời thường', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 65000, totalBookmarks: 4000 }
  },
  {
    title: 'The Promised Neverland',
    author: 'Shirai Kaiu',
    description: 'Ba đứa trẻ Emma, Norman và Ray sống trong Trại Grace Field – một ngôi nhà trẻ em tưởng chừng như thiên đường. Chúng phát hiện ra sự thật khủng khiếp: những đứa trẻ được nuôi để làm thức ăn cho quỷ.',
    status: 'completed',
    publicationYear: 2016,
    categories: ['Kinh dị', 'Huyền bí', 'Tâm lý', 'Shounen'],
    isPublished: true,
    statistics: { totalChapters: 0, totalViews: 62000, totalBookmarks: 3800 }
  },
];

const chapterTitles = {
  1: ['Khởi đầu', 'Ngày đầu tiên', 'Quyết định', 'Bước ngoặt', 'Đối thủ'],
  2: ['Trận chiến', 'Sức mạnh mới', 'Đồng đội', 'Thử thách', 'Vượt qua'],
  3: ['Bí mật', 'Sự thật', 'Quá khứ', 'Hy vọng', 'Tương lai'],
  4: ['Cuộc gặp gỡ', 'Liên minh', 'Kế hoạch', 'Tấn công', 'Phản công'],
  5: ['Kết thúc', 'Khởi đầu mới', 'Hành trình', 'Lời hứa', 'Vĩnh biệt'],
};

const commentUsers = [
  'Ngọc Anh', 'Minh Tuấn', 'Hoàng Long', 'Phương Thảo', 'Đức Huy',
  'Linh Chi', 'Bảo Nam', 'Quỳnh Mai', 'Tuấn Kiệt', 'Hương Giang',
  'Anh Khoa', 'Mai Phương', 'Thành Trung', 'Ánh Tuyết', 'Văn Hải',
];

const commentTemplates = [
  'Truyện hay quá! Mình đọc một mạch không dừng được luôn.',
  'Chap này đỉnh thật, càng đọc càng cuốn.',
  'Vẽ đẹp, nội dung hấp dẫn, plot twist bất ngờ.',
  'Mong chap tiếp theo quá, ra nhanh nha tác giả!',
  'Cốt truyện ngày càng hay, nhân vật phát triển tốt.',
  'Đây là bộ truyện yêu thích của mình, đọc đi đọc lại vẫn thấy hay.',
  'Chap này hơi ngắn nhưng chất lượng vẫn giữ vững.',
  'Phân cảnh chiến đấu mãn nhãn, hồi hộp từ đầu đến cuối.',
  'Nước mắt rơi lúc nào không hay, cảm động quá.',
  'Hài hước quá, cười không nhặt được mồm luôn.',
  'Nhân vật phản diện được xây dựng quá tốt, ghét nhưng phải nể.',
  'Đọc xong chờ tuần sau mới ra chap mới, sốt ruột quá!',
  'Cặp chính dễ thương quá, shipp ngay và luôn.',
  'Mạch truyện nhanh không kéo dài lê thê, rất thích.',
  'Bối cảnh thế giới rộng lớn, tác giả xây dựng rất công phu.',
  'Khúc này gây cấn quá, không rời mắt được.',
  'Âm thanh và hình ảnh nếu làm anime chắc phải siêu phẩm.',
  'Mỗi nhân vật đều có câu chuyện riêng, rất nhân văn.',
  'Thích cách tác giả dẫn dắt câu chuyện, không bị lủng củng.',
  'Cố lên tác giả! Ủng hộ bộ truyện này mãi mãi!',
];

const pageCounts = [7, 8, 9, 10, 11, 12];
const paymentMethods = ['bank_transfer', 'momo', 'zalopay', 'viettelpay'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/metruyen_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Comic.deleteMany({}),
      Chapter.deleteMany({}),
      Comment.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    console.log('Creating users...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@metruyen.com',
      password: 'admin123',
      displayName: 'Admin MeTruyen',
      role: 'admin',
      bio: 'Quản trị viên hệ thống MeTruyen',
      mPoints: 999999,
    });

    const demoUser = await User.create({
      username: 'demo',
      email: 'demo@metruyen.com',
      password: 'demo123',
      displayName: 'Nguyễn Thành Nam',
      bio: 'Người yêu truyện tranh',
      mPoints: 50000,
    });

    const reader = await User.create({
      username: 'reader',
      email: 'reader@metruyen.com',
      password: 'reader123',
      displayName: 'Minh Đức',
      bio: 'Đọc truyện mỗi ngày',
      mPoints: 20000,
    });

    const minhAnh = await User.create({
      username: 'minhanh',
      email: 'minhanh@metruyen.com',
      password: 'minhanh123',
      displayName: 'Minh Anh',
      bio: 'Mê mấy bộ shounen',
      mPoints: 10000,
    });

    const hoangLong = await User.create({
      username: 'hoanglong',
      email: 'hoanglong@metruyen.com',
      password: 'hoanglong123',
      displayName: 'Hoàng Long',
      bio: 'Thích đọc truyện kinh dị',
      mPoints: 30000,
    });

    const allUsers = [admin, demoUser, reader, minhAnh, hoangLong];
    console.log(`Created ${allUsers.length} users`);

    console.log('Creating 10 payment records...');
    const paymentUsers = [demoUser, reader, minhAnh, hoangLong];
    const paymentAmounts = [10000, 20000, 50000, 100000, 200000, 50000, 10000, 50000, 100000, 50000];
    for (let i = 0; i < 10; i++) {
      const user = paymentUsers[i % paymentUsers.length];
      const amount = paymentAmounts[i];
      const status = i < 6 ? 'success' : i < 8 ? 'pending' : 'failed';
      await Payment.create({
        userId: user._id,
        transactionId: `TXN${String(Date.now()).slice(-8)}${i}`,
        amount,
        paymentMethod: pickRandom(paymentMethods),
        status,
        createdAt: new Date(Date.now() - (10 - i) * 86400000),
      });
    }
    console.log('Created 10 payment records');

    console.log('Creating categories...');
    const createdCategories = {};
    for (const cat of categoriesData) {
      const created = await Category.create({
        name: cat.name,
        slug: slugify(cat.name, { lower: true, strict: true }),
        description: cat.description,
        order: cat.order,
      });
      createdCategories[cat.name] = created._id;
    }
    console.log(`Created ${categoriesData.length} categories`);

    console.log('Creating comics...');
    const userIds = [admin._id, demoUser._id, reader._id];

    for (let i = 0; i < comicsData.length; i++) {
      const data = comicsData[i];
      const slug = slugify(data.title, { lower: true, strict: true, locale: 'vi' });
      const categoryIds = data.categories.map((name) => createdCategories[name]).filter(Boolean);

      const comic = await Comic.create({
        title: data.title,
        slug,
        coverImage: {
          url: `${IMG_BASE}/${slug}/400/600`,
          publicId: `seed/${slug}-cover`,
        },
        description: data.description,
        author: data.author,
        categories: categoryIds,
        status: data.status,
        publicationYear: data.publicationYear,
        lastChapterUpdate: data.lastChapterUpdate || new Date(),
        isPublished: true,
        statistics: data.statistics,
        createdBy: pickRandom(userIds),
      });

      const numPages = pickRandom(pageCounts);

      for (let ch = 1; ch <= 5; ch++) {
        const chapter = await Chapter.create({
          comicId: comic._id,
          chapterNumber: ch,
          title: pickRandom(chapterTitles[ch % 5 + 1] || chapterTitles[1]),
          slug: `chapter-${ch}`,
          pages: Array.from({ length: numPages }, (_, p) => ({
            url: `${IMG_BASE}/${slug}-ch${ch}-p${p + 1}/800/1200`,
            publicId: `seed/${slug}-ch${ch}-p${p + 1}`,
            order: p + 1,
            width: 800,
            height: 1200,
          })),
          isPublished: true,
          publishDate: new Date(Date.now() - (5 - ch) * 86400000),
        });

        if (ch === 1) {
          comic.lastChapterUpdate = chapter.publishDate;
        }
      }

      comic.statistics.totalChapters = 5;
      await comic.save();

      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $inc: { comicCount: 1 } }
      );

      console.log(`[${i + 1}/20] Created: ${data.title}`);
    }

    console.log('Linking chapter navigation...');
    const allChapters = await Chapter.find({}).sort({ comicId: 1, chapterNumber: 1 }).lean();
    const comicChaptersMap = {};
    for (const ch of allChapters) {
      const key = ch.comicId.toString();
      if (!comicChaptersMap[key]) comicChaptersMap[key] = [];
      comicChaptersMap[key].push(ch);
    }

    for (const [, chapters] of Object.entries(comicChaptersMap)) {
      for (let i = 0; i < chapters.length; i++) {
        const prevId = i > 0 ? chapters[i - 1]._id : null;
        const nextId = i < chapters.length - 1 ? chapters[i + 1]._id : null;
        await Chapter.findByIdAndUpdate(chapters[i]._id, {
          previousChapter: prevId,
          nextChapter: nextId,
        });
      }
    }

    console.log('Creating comments...');
    const allComics = await Comic.find({}).lean();
    const allCreatedChapters = await Chapter.find({}).lean();
    const commentUsers2 = [demoUser, reader, minhAnh, hoangLong];

    for (let i = 0; i < 80; i++) {
      const comic = pickRandom(allComics);
      const user = pickRandom(commentUsers2);
      const chapterChance = Math.random();

      let chapterId = null;
      if (chapterChance < 0.5) {
        const comicChapters = allCreatedChapters.filter(
          (ch) => ch.comicId.toString() === comic._id.toString()
        );
        if (comicChapters.length > 0) {
          chapterId = pickRandom(comicChapters)._id;
        }
      }

      const daysAgo = Math.floor(Math.random() * 14);
      const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.floor(Math.random() * 86400000));

      await Comment.create({
        comicId: comic._id,
        userId: user._id,
        chapterId,
        content: pickRandom(commentTemplates),
        createdAt,
        updatedAt: createdAt,
      });
    }

    console.log('Created 80 comments');

    console.log('Creating bookmarks and history for demo user...');
    const bookmarkedComics = pickRandomN(allComics, 5);
    const bookmarkedIds = bookmarkedComics.map((c) => c._id);

    demoUser.library.bookmarks = bookmarkedIds.map((id) => ({
      comicId: id,
      addedAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)),
    }));

    const historyChapters = pickRandomN(allCreatedChapters, 8);
    demoUser.library.history = historyChapters.map((ch) => ({
      comicId: ch.comicId,
      chapterId: ch._id,
      lastReadAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
    }));

    await demoUser.save();
    console.log('Created demo user library data');

    console.log('');
    console.log('========================================');
    console.log('  Seed completed successfully!');
    console.log('========================================');
    console.log('');
    console.log('Users:');
    console.log('  admin     | admin@metruyen.com      | admin123');
    console.log('  demo      | demo@metruyen.com       | demo123');
    console.log('  reader    | reader@metruyen.com     | reader123');
    console.log('  minhanh   | minhanh@metruyen.com    | minhanh123');
    console.log('  hoanglong | hoanglong@metruyen.com  | hoanglong123');
    console.log('');
    console.log(`Categories: ${categoriesData.length}`);
    console.log(`Comics: ${comicsData.length}`);
    console.log(`Chapters: ${5 * comicsData.length}`);
    console.log(`Comments: 80`);
    console.log(`Payments: 10`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
