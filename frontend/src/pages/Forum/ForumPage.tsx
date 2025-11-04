import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchQuestions, createQuestion, selectForum, Question, AssignedTeacher } from '../../features/forum/forumSlice';
import api from '../../services/api';

const ForumPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { questions, loading, error } = useAppSelector(selectForum);
  const { user } = useAppSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<AssignedTeacher | null>(null);
  const [teacherSearchError, setTeacherSearchError] = useState<string | null>(null);
  const [isSearchingTeacher, setIsSearchingTeacher] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  const handleInputChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(event.target.value);
  };

  const handleSearchTeacher = async () => {
    if (!teacherCode.trim()) {
      setTeacherSearchError('Please enter a teacher ID before searching.');
      setSelectedTeacher(null);
      return;
    }

    setIsSearchingTeacher(true);
    setTeacherSearchError(null);

    try {
      const response = await api.get(`/teachers/search/${teacherCode.trim()}`);
      const teacher: AssignedTeacher = {
        _id: response.data._id,
        registrationNumber: response.data.firstName || response.data.registrationNumber || 'Unknown',
        teacherCode: response.data.teacherCode,
        subject: response.data.subject,
      };
      setSelectedTeacher(teacher);
    } catch (searchError: any) {
      const message = searchError?.response?.data?.message || 'Unable to find a teacher with that ID.';
      setTeacherSearchError(message);
      setSelectedTeacher(null);
    } finally {
      setIsSearchingTeacher(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!title.trim() || !content.trim()) {
      setFormError('Please provide both a title and detailed content for your question.');
      return;
    }

    if (user?.role === 'student' && !selectedTeacher) {
      setTeacherSearchError('Please search and select a teacher ID before submitting your question.');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setFormError(null);
    setIsSubmittingQuestion(true);

    try {
      await dispatch(
        createQuestion({
          title: title.trim(),
          content: content.trim(),
          tags: tagsArray,
          teacherCode: user?.role === 'student' ? selectedTeacher?.teacherCode ?? null : undefined,
        })
      ).unwrap();

      setTitle('');
      setContent('');
      setTags('');
      setTeacherCode('');
      setSelectedTeacher(null);
      setTeacherSearchError(null);
      setShowForm(false);
    } catch (submitError: any) {
      const message = submitError?.message || 'Failed to submit your question. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const questionsAssignedToStaff = useMemo(() => {
    if (user?.role !== 'staff') {
      return [];
    }
    return questions.filter((question) => question.assignedTeacher?._id === user._id);
  }, [questions, user]);

  const otherQuestions = useMemo(() => {
    if (user?.role !== 'staff') {
      return questions;
    }
    return questions.filter((question) => question.assignedTeacher?._id !== user._id);
  }, [questions, user]);

  const renderQuestionCard = (question: Question) => {
    const askedBy = question.author?.registrationNumber || question.author?.name || 'Unknown user';
    const isAssignedToCurrentStaff = user?.role === 'staff' && question.assignedTeacher?._id === user._id;

    return (
      <div key={question._id} className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${isAssignedToCurrentStaff ? 'ring-1 ring-emerald-400' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-semibold">
            <Link to={`/dashboard/forum/${question._id}`} className="text-blue-600 hover:underline">
              {question.title}
            </Link>
          </h2>
          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${question.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {question.status}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between text-sm text-gray-500 gap-2">
          <span>
            Asked by <span className="font-medium text-gray-700">{askedBy}</span>
          </span>
          <span>{new Date(question.createdAt).toLocaleString()}</span>
        </div>
        {user?.role === 'staff' && (
          <div className="mt-1 text-sm text-gray-500">
            Student ID: {question.author?.registrationNumber || 'N/A'}
          </div>
        )}

        {question.assignedTeacher ? (
          <div className={`mt-2 text-sm ${isAssignedToCurrentStaff ? 'text-emerald-700 font-medium' : 'text-gray-600'}`}>
            Assigned to {question.assignedTeacher.registrationNumber}
            {question.assignedTeacher.teacherCode ? ` (${question.assignedTeacher.teacherCode})` : ''}
            {question.assignedTeacher.subject ? ` • ${question.assignedTeacher.subject}` : ''}
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500">Not assigned to a teacher yet</div>
        )}

        {question.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {question.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Discussion Forum</h1>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? 'Cancel' : 'Ask a Question'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold">Ask a New Question</h2>
          </div>
          <div className="space-y-4 px-6 py-4">
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Question Title"
              value={title}
              onChange={handleInputChange(setTitle)}
            />
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Describe your question in detail..."
              value={content}
              rows={4}
              onChange={handleInputChange(setContent)}
            />
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Tags (comma-separated, e.g., assignments, exams)"
              value={tags}
              onChange={handleInputChange(setTags)}
            />
            {user?.role === 'student' && (
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Assign to a Teacher</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter teacher ID (code)"
                    value={teacherCode}
                    onChange={(event) => {
                      setTeacherCode(event.target.value);
                      setTeacherSearchError(null);
                      setSelectedTeacher(null);
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                    onClick={handleSearchTeacher}
                    disabled={isSearchingTeacher}
                  >
                    {isSearchingTeacher ? 'Searching...' : 'Search Teacher'}
                  </button>
                </div>
                {teacherSearchError && <p className="mt-2 text-sm text-red-600">{teacherSearchError}</p>}
                {selectedTeacher && (
                  <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    <p className="font-semibold">Teacher found:</p>
                    <p>ID: {selectedTeacher.registrationNumber}</p>
                    {selectedTeacher.teacherCode && <p>Code: {selectedTeacher.teacherCode}</p>}
                    {selectedTeacher.subject && <p>Subject: {selectedTeacher.subject}</p>}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              onClick={handleAskQuestion}
              disabled={isSubmittingQuestion}
            >
              {isSubmittingQuestion ? 'Submitting...' : 'Submit Question'}
            </button>
          </div>
        </div>
      )}

      {loading && <p>Loading questions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {user?.role === 'staff' ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Questions Assigned To You</h2>
            {questionsAssignedToStaff.length === 0 ? (
              <p className="text-sm text-gray-600">No student questions have been assigned to you yet.</p>
            ) : (
              <div className="space-y-4">
                {questionsAssignedToStaff.map(renderQuestionCard)}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Other Forum Questions</h2>
            {otherQuestions.length === 0 ? (
              <p className="text-sm text-gray-600">No other forum questions available.</p>
            ) : (
              <div className="space-y-4">
                {otherQuestions.map(renderQuestionCard)}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(renderQuestionCard)}
        </div>
      )}
    </div>
  );
};

export default ForumPage;
