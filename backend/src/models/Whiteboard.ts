import mongoose, { Document, Schema } from 'mongoose';

export interface IWhiteboard extends Document {
  title: string;
  imageData: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  teacherCode?: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whiteboardSchema = new Schema<IWhiteboard>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  imageData: {
    type: String,
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  teacherCode: {
    type: String,
    default: null
  },
  isShared: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

whiteboardSchema.index({ authorId: 1, createdAt: -1 });
whiteboardSchema.index({ teacherCode: 1, isShared: 1 });

export default mongoose.model<IWhiteboard>('Whiteboard', whiteboardSchema);
