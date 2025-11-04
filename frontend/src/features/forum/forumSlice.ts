import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { RootState } from '../../store';

export interface Answer {
  _id: string;
  content: string;
  author: {
    _id: string;
    registrationNumber: string;
    name?: string;
    role?: string;
    teacherCode?: string;
  };
  createdAt: string;
}

export interface AssignedTeacher {
  _id: string;
  registrationNumber: string;
  teacherCode?: string;
  subject?: string;
  role?: string;
}

export interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    registrationNumber: string;
    name?: string;
    role?: string;
    teacherCode?: string;
  };
  answers: Answer[];
  tags: string[];
  status: 'open' | 'resolved';
  createdAt: string;
  assignedTeacher?: AssignedTeacher | null;
  assignedTeacherCode?: string | null;
}

interface ForumState {
  questions: Question[];
  currentQuestion: Question | null;
  loading: boolean;
  error: string | null;
}

const initialState: ForumState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchQuestions = createAsyncThunk('forum/fetchQuestions', async () => {
  const response = await api.get('/forum/questions');
  return response.data;
});

export const fetchQuestionById = createAsyncThunk('forum/fetchQuestionById', async (id: string) => {
  const response = await api.get(`/forum/questions/${id}`);
  return response.data;
});

export const createQuestion = createAsyncThunk('forum/createQuestion', async (questionData: { title: string; content: string; tags: string[]; teacherCode?: string | null }) => {
  const response = await api.post('/forum/questions', questionData);
  return response.data;
});

export const addAnswer = createAsyncThunk('forum/addAnswer', async ({ questionId, content }: { questionId: string; content: string }) => {
  const response = await api.post(`/forum/questions/${questionId}/answers`, { content });
  return { questionId, answer: response.data as Answer };
});

export const updateQuestionStatus = createAsyncThunk('forum/updateQuestionStatus', async ({ questionId, status }: { questionId: string; status: 'open' | 'resolved' }) => {
  const response = await api.patch(`/forum/questions/${questionId}/status`, { status });
  return response.data;
});


const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<Question[]>) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch questions';
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action: PayloadAction<Question>) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch question';
      })
      .addCase(createQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        state.questions.unshift(action.payload);
      })
      .addCase(addAnswer.fulfilled, (state, action: PayloadAction<{ questionId: string; answer: Answer }>) => {
        if (state.currentQuestion && state.currentQuestion._id === action.payload.questionId) {
          state.currentQuestion.answers.push(action.payload.answer);
        }
        const questionIndex = state.questions.findIndex((question) => question._id === action.payload.questionId);
        if (questionIndex !== -1) {
          state.questions[questionIndex].answers.push(action.payload.answer);
        }
      })
      .addCase(updateQuestionStatus.fulfilled, (state, action: PayloadAction<Question>) => {
        if (state.currentQuestion && state.currentQuestion._id === action.payload._id) {
          state.currentQuestion = action.payload;
        }
        const index = state.questions.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      });
  },
});

export const selectForum = (state: RootState) => state.forum;
export default forumSlice.reducer;
