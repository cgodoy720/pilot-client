import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import './NotesModal.css';

const NotesModal = ({ isOpen, onClose, applicantId, applicantName }) => {
    const { token, user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, noteId: null, noteContent: '' });

    // Fetch notes when modal opens
    useEffect(() => {
        if (isOpen && applicantId) {
            fetchNotes();
        }
    }, [isOpen, applicantId]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/notes/${applicantId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            const notesData = await response.json();
            setNotes(notesData);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setError('Failed to load notes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            setAddingNote(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/notes/${applicantId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note_content: newNote.trim() })
            });

            if (!response.ok) {
                throw new Error('Failed to add note');
            }

            const addedNote = await response.json();
            setNotes([addedNote, ...notes]);
            setNewNote('');
        } catch (error) {
            console.error('Error adding note:', error);
            setError('Failed to add note. Please try again.');
        } finally {
            setAddingNote(false);
        }
    };

    const handleEditNote = async (noteId, content) => {
        try {
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note_content: content })
            });

            if (!response.ok) {
                throw new Error('Failed to update note');
            }

            const updatedNote = await response.json();
            setNotes(notes.map(note => 
                note.note_id === noteId 
                    ? { ...note, ...updatedNote }
                    : note
            ));
            setEditingNoteId(null);
            setEditingContent('');
        } catch (error) {
            console.error('Error updating note:', error);
            setError('Failed to update note. Please try again.');
        }
    };

    const showDeleteConfirmation = (noteId, noteContent) => {
        setDeleteConfirmModal({ 
            isOpen: true, 
            noteId, 
            noteContent: noteContent.length > 50 ? noteContent.substring(0, 50) + '...' : noteContent 
        });
    };

    const hideDeleteConfirmation = () => {
        setDeleteConfirmModal({ isOpen: false, noteId: null, noteContent: '' });
    };

    const handleDeleteNote = async () => {
        const noteId = deleteConfirmModal.noteId;
        
        try {
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            setNotes(notes.filter(note => note.note_id !== noteId));
            hideDeleteConfirmation();
        } catch (error) {
            console.error('Error deleting note:', error);
            setError('Failed to delete note. Please try again.');
        }
    };

    const startEdit = (note) => {
        setEditingNoteId(note.note_id);
        setEditingContent(note.note_content);
    };

    const cancelEdit = () => {
        setEditingNoteId(null);
        setEditingContent('');
    };

    const formatDate = (dateString) => {
        // Backend now returns timestamps already converted to EST
        try {
            const date = new Date(dateString);
            return format(date, 'MMM d, yyyy h:mm a');
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString; // Fallback to original string
        }
    };

    const canEditNote = (note) => {
        // User can edit/delete their own notes
        // Check different possible user ID fields from the auth context
        const currentUserId = user?.user_id || user?.id || user?.userId;
        return currentUserId && currentUserId === note.created_by;
    };

    if (!isOpen) return null;

    return (
        <div className="notes-modal-overlay" onClick={onClose}>
            <div className="notes-modal" onClick={e => e.stopPropagation()}>
                <div className="notes-modal__header">
                    <h2>Notes for {applicantName}</h2>
                    <button onClick={onClose} className="notes-modal__close-btn">×</button>
                </div>

                <div className="notes-modal__content">
                    {/* Add new note form */}
                    <form onSubmit={handleAddNote} className="add-note-form">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a new note about this applicant..."
                            rows={3}
                            className="add-note-textarea"
                        />
                        <button 
                            type="submit" 
                            disabled={!newNote.trim() || addingNote}
                            className="add-note-btn"
                        >
                            {addingNote ? 'Adding...' : 'Add Note'}
                        </button>
                    </form>

                    {error && (
                        <div className="notes-error">
                            {error}
                        </div>
                    )}

                    {/* Notes list */}
                    <div className="notes-list">
                        {loading ? (
                            <div className="notes-loading">
                                <div className="spinner"></div>
                                <p>Loading notes...</p>
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="no-notes">
                                <p>No notes yet for this applicant.</p>
                            </div>
                        ) : (
                            notes.map(note => (
                                <div key={note.note_id} className="note-item">
                                    <div className="note-item__header">
                                        <span className="note-author">
                                            {note.created_by_first_name} {note.created_by_last_name}
                                        </span>
                                        <span className="note-date">
                                            {formatDate(note.created_at)}
                                            {note.updated_at !== note.created_at && ' (edited)'}
                                        </span>
                                    </div>
                                    
                                    {editingNoteId === note.note_id ? (
                                        <div className="note-edit-form">
                                            <textarea
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                rows={3}
                                                className="edit-note-textarea"
                                            />
                                            <div className="note-edit-actions">
                                                <button 
                                                    onClick={() => handleEditNote(note.note_id, editingContent)}
                                                    className="save-edit-btn"
                                                    disabled={!editingContent.trim()}
                                                >
                                                    Save
                                                </button>
                                                <button onClick={cancelEdit} className="cancel-edit-btn">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="note-content">
                                                {note.note_content}
                                            </div>
                                            {canEditNote(note) && (
                                                <div className="note-actions">
                                                    <button onClick={() => startEdit(note)} className="edit-note-btn">
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => showDeleteConfirmation(note.note_id, note.note_content)} 
                                                        className="delete-note-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmModal.isOpen && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this note?</p>
                        <div className="note-preview">
                            "{deleteConfirmModal.noteContent}"
                        </div>
                        <div className="delete-confirm-actions">
                            <button 
                                onClick={hideDeleteConfirmation}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteNote}
                                className="confirm-delete-btn"
                            >
                                Delete Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesModal; 