import mongoose from 'mongoose';
import slugify from 'slugify';

const comicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  coverImage: {
    url: {
      type: String,
      required: [true, 'Cover image is required']
    },
    publicId: String
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: 100
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
    default: 'ongoing'
  },
  publicationYear: Number,
  statistics: {
    totalChapters: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalBookmarks: {
      type: Number,
      default: 0
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastChapterUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'comics'
});

comicSchema.index({ title: 'text', description: 'text' });
comicSchema.index({ categories: 1 });
comicSchema.index({ status: 1 });
comicSchema.index({ 'statistics.totalViews': -1 });
comicSchema.index({ lastChapterUpdate: -1 });
comicSchema.index({ isPublished: 1 });

comicSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true, locale: 'vi' });
  }
});

comicSchema.methods.updateChapterCount = async function() {
  const Chapter = mongoose.model('Chapter');
  this.statistics.totalChapters = await Chapter.countDocuments({ comicId: this._id });
  await this.save();
};

const Comic = mongoose.model('Comic', comicSchema);
export default Comic;
