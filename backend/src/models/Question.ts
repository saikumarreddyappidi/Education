import { Schema, model, Document, Types } from 'mongoose';

interface IAnswer extends Document {
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

interface IQuestion extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  answers: IAnswer[];
  tags: string[];
  status: 'open' | 'resolved';
  createdAt: Date;
  assignedTeacher?: Types.ObjectId | null;
  assignedTeacherCode?: string | null;
}

const QuestionSchema = new Schema<IQuestion>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [AnswerSchema],
  tags: [{ type: String }],
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  assignedTeacher: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  assignedTeacherCode: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Question = model<IQuestion>('Question', QuestionSchema);

export default Question;
