import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '../ui/sheet';
import './NotesSidebar.css';

const NotesSidebar = ({ isOpen, onClose, applicantId, applicantName }) => {
    const { token, user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, noteId: null, noteContent: '' });

    // Fetch notes when sidebar opens
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
            // Sort by created_at descending (most recent first)
            const sortedNotes = notesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotes(sortedNotes);
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
            // Add to beginning of array (most recent)
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
        try {
            const date = new Date(dateString);
            return format(date, 'MMM d, yyyy h:mm a');
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const canEditNote = (note) => {
        const currentUserId = user?.user_id || user?.id || user?.userId;
        return currentUserId && currentUserId === note.created_by;
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="right" className="notes-sidebar">
                    <div className="notes-sidebar__header">
                        <div className="notes-sidebar__title-wrapper">
                            <span className="notes-sidebar__title">
                                Notes for {applicantName}
                            </span>
                        </div>
                    </div>

                    <div className="notes-sidebar__content">
                        {/* Add new note form at the top */}
                        <form onSubmit={handleAddNote} className="notes-sidebar__add-form">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a new note about this applicant..."
                                rows={3}
                                className="notes-sidebar__textarea"
                            />
                            <button 
                                type="submit" 
                                disabled={!newNote.trim() || addingNote}
                                className="notes-sidebar__add-btn"
                            >
                                {addingNote ? 'Adding...' : 'Add Note'}
                            </button>
                        </form>

                        {error && (
                            <div className="notes-sidebar__error">
                                {error}
                            </div>
                        )}

                        {/* Notes list */}
                        <div className="notes-sidebar__list">
                            {loading ? (
                                <div className="notes-sidebar__loading">
                                    <div className="spinner"></div>
                                    <p>Loading notes...</p>
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="notes-sidebar__empty">
                                    <p>No notes yet for this applicant.</p>
                                </div>
                            ) : (
                                notes.map((note, index) => (
                                    <div 
                                        key={note.note_id} 
                                        className="notes-sidebar__note"
                                        style={{ animationDelay: `${0.05 + index * 0.03}s` }}
                                    >
                                        <div className="notes-sidebar__note-header">
                                            <span className="notes-sidebar__note-author">
                                                {note.created_by_first_name} {note.created_by_last_name}
                                            </span>
                                            <span className="notes-sidebar__note-date">
                                                {formatDate(note.created_at)}
                                                {note.updated_at !== note.created_at && ' (edited)'}
                                            </span>
                                        </div>
                                        
                                        {editingNoteId === note.note_id ? (
                                            <div className="notes-sidebar__edit-form">
                                                <textarea
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    rows={3}
                                                    className="notes-sidebar__textarea notes-sidebar__textarea--edit"
                                                />
                                                <div className="notes-sidebar__edit-actions">
                                                    <button 
                                                        onClick={() => handleEditNote(note.note_id, editingContent)}
                                                        className="notes-sidebar__save-btn"
                                                        disabled={!editingContent.trim()}
                                                    >
                                                        Save
                                                    </button>
                                                    <button onClick={cancelEdit} className="notes-sidebar__cancel-btn">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="notes-sidebar__note-content">
                                                    {note.note_content}
                                                </div>
                                                {canEditNote(note) && (
                                                    <div className="notes-sidebar__note-actions">
                                                        <button onClick={() => startEdit(note)} className="notes-sidebar__edit-btn">
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => showDeleteConfirmation(note.note_id, note.note_content)} 
                                                            className="notes-sidebar__delete-btn"
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
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation Modal */}
            {deleteConfirmModal.isOpen && (
                <div className="notes-sidebar__delete-overlay">
                    <div className="notes-sidebar__delete-modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this note?</p>
                        <div className="notes-sidebar__note-preview">
                            "{deleteConfirmModal.noteContent}"
                        </div>
                        <div className="notes-sidebar__delete-actions">
                            <button 
                                onClick={hideDeleteConfirmation}
                                className="notes-sidebar__cancel-delete-btn"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteNote}
                                className="notes-sidebar__confirm-delete-btn"
                            >
                                Delete Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotesSidebar;

