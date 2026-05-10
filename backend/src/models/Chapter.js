import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  comicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comic',
    required: [true, 'Comic ID is required']
  },
  chapterNumber: {
    type: Number,
    required: [true, 'Chapter number is required'],
    min: 0
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  pages: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    width: Number,
    height: Number,
    order: {
      type: Number,
      required: true
    }
  }],
  previousChapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    default: null
  },
  nextChapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    default: null
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  isVIPOnly: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'chapters'
});

chapterSchema.index({ comicId: 1, chapterNumber: 1 }, { unique: true });
chapterSchema.index({ slug: 1 });
chapterSchema.index({ createdAt: -1 });

chapterSchema.pre('save', function() {
  if (this.isModified('chapterNumber') || this.isModified('title')) {
    this.slug = `chapter-${this.chapterNumber}`;
  }
});

chapterSchema.post('save', async function() {
  try {
    const Comic = mongoose.model('Comic');
    await Comic.findByIdAndUpdate(this.comicId, {
      lastChapterUpdate: new Date()
    });
  } catch (error) {
    console.error('Error updating comic lastChapterUpdate:', error);
  }
});

const Chapter = mongoose.model('Chapter', chapterSchema);
export default Chapter;
