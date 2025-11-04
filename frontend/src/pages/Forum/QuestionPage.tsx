import React, { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchQuestionById, addAnswer, updateQuestionStatus, selectForum, Answer as ForumAnswer } from '../../features/forum/forumSlice';

const QuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentQuestion, loading, error } = useAppSelector(selectForum);
  const { user } = useAppSelector((state) => state.auth);
  const [answerContent, setAnswerContent] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchQuestionById(id));
    }
  }, [dispatch, id]);

  const handleAnswerChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setAnswerContent(event.target.value);
  };

  const handleAddAnswer = () => {
    if (answerContent.trim() && id) {
      dispatch(addAnswer({ questionId: id, content: answerContent.trim() }));
      setAnswerContent('');
    }
  };

  const handleStatusChange = (status: 'open' | 'resolved') => {
    if (id) {
      dispatch(updateQuestionStatus({ questionId: id, status }));
    }
  };

  if (loading) return <p>Loading question...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!currentQuestion) return <p>Question not found.</p>;

  const isAuthor = user?._id === currentQuestion.author._id;
  const isStaff = user?.role === 'staff';
  const isAssignedToCurrentStaff = isStaff && currentQuestion.assignedTeacher?._id === user._id;
  const studentRegistration = currentQuestion.author?.registrationNumber;
  const askedByLabel = currentQuestion.author?.name || studentRegistration || 'Unknown user';

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{currentQuestion.title}</h1>
            <p className="text-sm text-gray-500">
              Asked by {askedByLabel} on {new Date(currentQuestion.createdAt).toLocaleDateString()}
            </p>
            {studentRegistration && (
              <p className="text-sm text-gray-500">Student ID: {studentRegistration}</p>
            )}
            {currentQuestion.assignedTeacher ? (
              <p className={`text-sm ${isAssignedToCurrentStaff ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                Assigned Teacher: {currentQuestion.assignedTeacher.registrationNumber}
                {currentQuestion.assignedTeacher.teacherCode ? ` (${currentQuestion.assignedTeacher.teacherCode})` : ''}
                {currentQuestion.assignedTeacher.subject ? ` • ${currentQuestion.assignedTeacher.subject}` : ''}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Not assigned to any teacher.</p>
            )}
          </div>
          <span className="inline-flex h-8 items-center rounded-full bg-emerald-100 px-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {currentQuestion.status}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-gray-700">{currentQuestion.content}</p>

        {currentQuestion.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentQuestion.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {(isAuthor || isStaff) && currentQuestion.status === 'open' && (
          <button
            type="button"
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            onClick={() => handleStatusChange('resolved')}
          >
            Mark as Resolved
          </button>
        )}
      </div>

      <h2 className="mt-8 text-2xl font-semibold text-gray-900">Answers</h2>
      <div className="mt-4 space-y-4">
        {currentQuestion.answers.map((answer: ForumAnswer) => (
          <div key={answer._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Answered by {answer.author.registrationNumber || answer.author.name || 'Unknown user'} on{' '}
              {new Date(answer.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-2 text-gray-700">{answer.content}</p>
          </div>
        ))}
        {currentQuestion.answers.length === 0 && <p className="text-gray-500">No answers yet.</p>}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
        <textarea
          className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Type your answer here..."
          value={answerContent}
          rows={4}
          onChange={handleAnswerChange}
        />
        <button
          type="button"
          className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          onClick={handleAddAnswer}
        >
          Post Answer
        </button>
      </div>
    </div>
  );
};

export default QuestionPage;
