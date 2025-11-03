import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchNotes, createNote, updateNote, deleteNote, searchNotes, searchStaffNotes, saveSearchedNote, clearSearchResults } from '../store/notesSlice';
import { RootState, AppDispatch } from '../store';

const Notepad: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notes, isLoading, searchResults, currentStaffInfo } = useSelector((state: RootState) => state.notes);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Load notes on component mount
  useEffect(() => {
    dispatch(fetchNotes());
    return () => {
      // Clear search results when component unmounts
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSaveNote = async (silent: boolean = false) => {
    if (!title.trim() || !content.trim()) {
      if (!silent) alert('Please enter both title and content');
      setSaveStatus(null);
      return false;
    }

    try {
      setSaveStatus('saving');
      
      // Log the request details for debugging
      console.log('💾 Saving note with data:', {
        title: title.trim(),
        contentLength: content.length,
        tags,
        isShared: user?.role === 'staff' ? isShared : false,
        selectedNote: selectedNote ? selectedNote._id : null,
        userRole: user?.role,
      });
      
      // Construct the note data
      const noteData = {
        title: title.trim(),
        content,
        tags,
        isShared: user?.role === 'staff' ? isShared : false,
      };

      // Check if we're updating or creating
      if (selectedNote) {
        console.log(`🔄 Updating note with ID: ${selectedNote._id}`);
        await dispatch(updateNote({ id: selectedNote._id, ...noteData })).unwrap();
        console.log('✅ Note updated successfully');
        if (!silent) alert('Note updated successfully!');
      } else {
        console.log('➕ Creating new note');
        const result = await dispatch(createNote(noteData)).unwrap();
        console.log('✅ Note created successfully, result:', result);
        if (!silent) alert('Note created successfully!');
      }
      
      // Only reset and close if not silent (auto-save)
      if (!silent) {
        // Reset form and close editor
        setIsEditing(false);
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setTags([]);
        setIsShared(false);
      }
      
      // Refresh notes list
      console.log('🔄 Refreshing notes list');
      await dispatch(fetchNotes()).unwrap();
      setSaveStatus('saved');
      
      // Set back to null after showing saved status
      setTimeout(() => {
        if (saveStatus === 'saved') setSaveStatus(null);
      }, 3000);
      
      return true;
    } catch (error: any) {
      console.error('❌ Failed to save note:', error);
      
      // Enhanced error logging
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      if (error.response) {
        console.error('❌ Error response data:', error.response.data);
        console.error('❌ Error response status:', error.response.status);
        console.error('❌ Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('❌ No response received. Request details:', error.request);
      } else {
        console.error('❌ Error occurred setting up the request');
      }
      
      setSaveStatus('error');
      
      // Display more informative error message
      if (!silent) {
        let errorMessage = 'Failed to save note. Please try again.';
        
        if (error.response?.data?.message) {
          errorMessage = `Server error: ${error.response.data.message}`;
        } else if (error.message && error.message.includes('Network')) {
          errorMessage = 'Network error: Cannot connect to the server. Please check your connection.';
        }
        
        // Log the final error message we're showing to the user
        console.error('❌ Showing error to user:', errorMessage);
        alert(errorMessage);
      }
      
      return false;
    }
  };

  // Auto-save functionality when content changes
  useEffect(() => {
    if (selectedNote && isEditing && (title.trim() !== '' || content.trim() !== '')) {
      // Don't auto-save on every change, rely on the timer
      // This was causing infinite re-renders
    }
  }, [selectedNote, isEditing, title, content]);

  // Set up auto-save timer
  useEffect(() => {
    if (isEditing && (title.trim() !== '' || content.trim() !== '')) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      const timer = setTimeout(() => {
        handleSaveNote(true);
      }, 30000); // Auto-save every 30 seconds
      setAutoSaveTimer(timer);
    }
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, title, content]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
    setTitle('');
    setContent('');
    setTags([]);
    setIsShared(false);
    // On mobile, hide the list and show the editor
    if (window.innerWidth < 768) {
      setIsMobileListVisible(false);
    }
  };

  const handleEditNote = (note: any) => {
    setSelectedNote(note);
    setIsEditing(true);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setIsShared(note.shared || false);
    // On mobile, hide the list and show the editor
    if (window.innerWidth < 768) {
      setIsMobileListVisible(false);
    }
  };

  const handleCancelEdit = () => {
    // Ask for confirmation if there are changes
    if (title || content) {
      if (!window.confirm('Discard unsaved changes?')) {
        return;
      }
    }
    
    setIsEditing(false);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setTags([]);
    setIsShared(false);
    
    // On mobile, show the list again
    if (window.innerWidth < 768) {
      setIsMobileListVisible(true);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(deleteNote(noteId)).unwrap();
        alert('Note deleted successfully!');
        
        // If the deleted note was selected, reset form
        if (selectedNote && selectedNote._id === noteId) {
          setSelectedNote(null);
          setIsEditing(false);
          setTitle('');
          setContent('');
          setTags([]);
          setIsShared(false);
        }
        
        // Refresh notes list
        await dispatch(fetchNotes()).unwrap();
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Function to save a staff note to student's account
  const handleSaveStaffNote = async (noteId: string) => {
    try {
      await dispatch(saveSearchedNote(noteId)).unwrap();
      alert('Note saved to your account successfully!');
      // Refresh notes list after saving
      await dispatch(fetchNotes()).unwrap();
    } catch (error) {
      console.error('Failed to save staff note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleSearchNotes = async () => {
    if (searchInput.trim()) {
      // If the input looks like a staff ID, search for staff notes
      if (user?.role === 'student') {
        setIsSearchMode(true);
        await dispatch(searchStaffNotes(searchInput.trim()));
      } else {
        // Regular search for staff users
        await dispatch(searchNotes({ query: searchInput.trim(), tags: [] }));
      }
    } else {
      // Clear search and show all notes
      setIsSearchMode(false);
      dispatch(clearSearchResults());
      await dispatch(fetchNotes());
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setIsSearchMode(false);
    dispatch(clearSearchResults());
    dispatch(fetchNotes());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchNotes();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
  };

  // Sort notes by most recent first
  const sortedNotes = [...(notes || [])].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Determine which notes to display: search results or user notes
  const displayedNotes = isSearchMode && searchResults && searchResults.length > 0 ? searchResults : sortedNotes;

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-semibold">Notes</h1>
        <div className="flex space-x-2">
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              Exit Fullscreen
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Note List - hidden on mobile when editing */}
        <div className={`${isMobileListVisible ? 'block' : 'hidden'} md:block w-full md:w-1/3 border-r bg-gray-50 overflow-y-auto`}>
          <div className="p-4 border-b sticky top-0 bg-gray-50 z-10">
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Search staff ID..."
                className="flex-1 p-2 border rounded"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button
                onClick={handleSearchNotes}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Search
              </button>
            </div>
            {isSearchMode && currentStaffInfo && (
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="font-medium">Staff: {currentStaffInfo.name}</div>
                <div className="text-sm">Subject: {currentStaffInfo.subject}</div>
                <div className="text-sm">Found {currentStaffInfo.totalNotes} notes</div>
                <button 
                  onClick={handleClearSearch}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Search
                </button>
              </div>
            )}
            <button
              onClick={handleCreateNote}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              + New Note
            </button>
          </div>

          <div className="divide-y">
            {isLoading ? (
              <div className="p-4 text-center">Loading notes...</div>
            ) : displayedNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {isSearchMode ? 'No notes found for this staff ID' : 'No notes found. Create your first note!'}
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div
                  key={note._id}
                  className={`p-4 cursor-pointer hover:bg-gray-100 ${
                    selectedNote && selectedNote._id === note._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div onClick={() => isSearchMode ? null : handleEditNote(note)} className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                      <div className="text-sm text-gray-500">
                        {new Date(note.updatedAt).toLocaleString()}
                      </div>
                      <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {note.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {note.shared && (
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                            Shared
                          </span>
                        </div>
                      )}
                      {isSearchMode && user?.role === 'student' && (
                        <button
                          onClick={() => handleSaveStaffNote(note._id)}
                          className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Save to My Notes
                        </button>
                      )}
                    </div>
                    {!isSearchMode && (
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Editor - shown on mobile when editing */}
        <div className={`${!isMobileListVisible ? 'block' : 'hidden'} md:block w-full md:w-2/3 flex flex-col overflow-hidden`}>
          {isEditing ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {selectedNote ? 'Edit Note' : 'New Note'}
                  </h2>
                  <div className="flex space-x-2">
                    {/* Mobile back button */}
                    <button
                      onClick={handleBackToList}
                      className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    >
                      Back to List
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Note Title"
                  className="w-full mt-2 p-2 border rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex-1 flex">
                    <input
                      type="text"
                      placeholder="Add tags..."
                      className="flex-1 p-2 border rounded-l"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      onClick={handleAddTag}
                      className="bg-blue-500 text-white px-4 py-2 rounded-r"
                    >
                      Add
                    </button>
                  </div>
                  {user?.role === 'staff' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="shared"
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="shared">Share with students</label>
                    </div>
                  )}
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-800 hover:text-blue-900"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="h-full"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      [{ indent: '-1' }, { indent: '+1' }],
                      ['link', 'image'],
                      [{ color: [] }, { background: [] }],
                      ['clean'],
                    ],
                  }}
                />
              </div>
              <div className="p-4 border-t flex justify-between items-center">
                <div className="text-sm">
                  {saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
                  {saveStatus === 'saved' && <span className="text-green-500">Saved!</span>}
                  {saveStatus === 'error' && <span className="text-red-500">Error saving</span>}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveNote(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No note selected</h3>
                <p className="mt-1 text-gray-500">
                  Select a note from the list or create a new one to get started.
                </p>
                <button
                  onClick={handleCreateNote}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Create New Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Notepad as default };
