// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import './NotesModal.css';
const NotesModal = ({
  isOpen,
  onClose,
  applicantId,
  applicantName
}) => {
  if (stryMutAct_9fa48("2137")) {
    {}
  } else {
    stryCov_9fa48("2137");
    const {
      token,
      user
    } = useAuth();
    const [notes, setNotes] = useState(stryMutAct_9fa48("2138") ? ["Stryker was here"] : (stryCov_9fa48("2138"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("2139") ? true : (stryCov_9fa48("2139"), false));
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState(stryMutAct_9fa48("2140") ? "Stryker was here!" : (stryCov_9fa48("2140"), ''));
    const [addingNote, setAddingNote] = useState(stryMutAct_9fa48("2141") ? true : (stryCov_9fa48("2141"), false));
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingContent, setEditingContent] = useState(stryMutAct_9fa48("2142") ? "Stryker was here!" : (stryCov_9fa48("2142"), ''));
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(stryMutAct_9fa48("2143") ? {} : (stryCov_9fa48("2143"), {
      isOpen: stryMutAct_9fa48("2144") ? true : (stryCov_9fa48("2144"), false),
      noteId: null,
      noteContent: stryMutAct_9fa48("2145") ? "Stryker was here!" : (stryCov_9fa48("2145"), '')
    }));

    // Fetch notes when modal opens
    useEffect(() => {
      if (stryMutAct_9fa48("2146")) {
        {}
      } else {
        stryCov_9fa48("2146");
        if (stryMutAct_9fa48("2149") ? isOpen || applicantId : stryMutAct_9fa48("2148") ? false : stryMutAct_9fa48("2147") ? true : (stryCov_9fa48("2147", "2148", "2149"), isOpen && applicantId)) {
          if (stryMutAct_9fa48("2150")) {
            {}
          } else {
            stryCov_9fa48("2150");
            fetchNotes();
          }
        }
      }
    }, stryMutAct_9fa48("2151") ? [] : (stryCov_9fa48("2151"), [isOpen, applicantId]));
    const fetchNotes = async () => {
      if (stryMutAct_9fa48("2152")) {
        {}
      } else {
        stryCov_9fa48("2152");
        try {
          if (stryMutAct_9fa48("2153")) {
            {}
          } else {
            stryCov_9fa48("2153");
            setLoading(stryMutAct_9fa48("2154") ? false : (stryCov_9fa48("2154"), true));
            setError(null);
            const response = await fetch(stryMutAct_9fa48("2155") ? `` : (stryCov_9fa48("2155"), `${import.meta.env.VITE_API_URL}/api/admissions/notes/${applicantId}`), stryMutAct_9fa48("2156") ? {} : (stryCov_9fa48("2156"), {
              headers: stryMutAct_9fa48("2157") ? {} : (stryCov_9fa48("2157"), {
                'Authorization': stryMutAct_9fa48("2158") ? `` : (stryCov_9fa48("2158"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("2159") ? "" : (stryCov_9fa48("2159"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("2162") ? false : stryMutAct_9fa48("2161") ? true : stryMutAct_9fa48("2160") ? response.ok : (stryCov_9fa48("2160", "2161", "2162"), !response.ok)) {
              if (stryMutAct_9fa48("2163")) {
                {}
              } else {
                stryCov_9fa48("2163");
                throw new Error(stryMutAct_9fa48("2164") ? "" : (stryCov_9fa48("2164"), 'Failed to fetch notes'));
              }
            }
            const notesData = await response.json();
            setNotes(notesData);
          }
        } catch (error) {
          if (stryMutAct_9fa48("2165")) {
            {}
          } else {
            stryCov_9fa48("2165");
            console.error(stryMutAct_9fa48("2166") ? "" : (stryCov_9fa48("2166"), 'Error fetching notes:'), error);
            setError(stryMutAct_9fa48("2167") ? "" : (stryCov_9fa48("2167"), 'Failed to load notes. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("2168")) {
            {}
          } else {
            stryCov_9fa48("2168");
            setLoading(stryMutAct_9fa48("2169") ? true : (stryCov_9fa48("2169"), false));
          }
        }
      }
    };
    const handleAddNote = async e => {
      if (stryMutAct_9fa48("2170")) {
        {}
      } else {
        stryCov_9fa48("2170");
        e.preventDefault();
        if (stryMutAct_9fa48("2173") ? false : stryMutAct_9fa48("2172") ? true : stryMutAct_9fa48("2171") ? newNote.trim() : (stryCov_9fa48("2171", "2172", "2173"), !(stryMutAct_9fa48("2174") ? newNote : (stryCov_9fa48("2174"), newNote.trim())))) return;
        try {
          if (stryMutAct_9fa48("2175")) {
            {}
          } else {
            stryCov_9fa48("2175");
            setAddingNote(stryMutAct_9fa48("2176") ? false : (stryCov_9fa48("2176"), true));
            setError(null);
            const response = await fetch(stryMutAct_9fa48("2177") ? `` : (stryCov_9fa48("2177"), `${import.meta.env.VITE_API_URL}/api/admissions/notes/${applicantId}`), stryMutAct_9fa48("2178") ? {} : (stryCov_9fa48("2178"), {
              method: stryMutAct_9fa48("2179") ? "" : (stryCov_9fa48("2179"), 'POST'),
              headers: stryMutAct_9fa48("2180") ? {} : (stryCov_9fa48("2180"), {
                'Authorization': stryMutAct_9fa48("2181") ? `` : (stryCov_9fa48("2181"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("2182") ? "" : (stryCov_9fa48("2182"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("2183") ? {} : (stryCov_9fa48("2183"), {
                note_content: stryMutAct_9fa48("2184") ? newNote : (stryCov_9fa48("2184"), newNote.trim())
              }))
            }));
            if (stryMutAct_9fa48("2187") ? false : stryMutAct_9fa48("2186") ? true : stryMutAct_9fa48("2185") ? response.ok : (stryCov_9fa48("2185", "2186", "2187"), !response.ok)) {
              if (stryMutAct_9fa48("2188")) {
                {}
              } else {
                stryCov_9fa48("2188");
                throw new Error(stryMutAct_9fa48("2189") ? "" : (stryCov_9fa48("2189"), 'Failed to add note'));
              }
            }
            const addedNote = await response.json();
            setNotes(stryMutAct_9fa48("2190") ? [] : (stryCov_9fa48("2190"), [addedNote, ...notes]));
            setNewNote(stryMutAct_9fa48("2191") ? "Stryker was here!" : (stryCov_9fa48("2191"), ''));
          }
        } catch (error) {
          if (stryMutAct_9fa48("2192")) {
            {}
          } else {
            stryCov_9fa48("2192");
            console.error(stryMutAct_9fa48("2193") ? "" : (stryCov_9fa48("2193"), 'Error adding note:'), error);
            setError(stryMutAct_9fa48("2194") ? "" : (stryCov_9fa48("2194"), 'Failed to add note. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("2195")) {
            {}
          } else {
            stryCov_9fa48("2195");
            setAddingNote(stryMutAct_9fa48("2196") ? true : (stryCov_9fa48("2196"), false));
          }
        }
      }
    };
    const handleEditNote = async (noteId, content) => {
      if (stryMutAct_9fa48("2197")) {
        {}
      } else {
        stryCov_9fa48("2197");
        try {
          if (stryMutAct_9fa48("2198")) {
            {}
          } else {
            stryCov_9fa48("2198");
            setError(null);
            const response = await fetch(stryMutAct_9fa48("2199") ? `` : (stryCov_9fa48("2199"), `${import.meta.env.VITE_API_URL}/api/admissions/notes/${noteId}`), stryMutAct_9fa48("2200") ? {} : (stryCov_9fa48("2200"), {
              method: stryMutAct_9fa48("2201") ? "" : (stryCov_9fa48("2201"), 'PUT'),
              headers: stryMutAct_9fa48("2202") ? {} : (stryCov_9fa48("2202"), {
                'Authorization': stryMutAct_9fa48("2203") ? `` : (stryCov_9fa48("2203"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("2204") ? "" : (stryCov_9fa48("2204"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("2205") ? {} : (stryCov_9fa48("2205"), {
                note_content: content
              }))
            }));
            if (stryMutAct_9fa48("2208") ? false : stryMutAct_9fa48("2207") ? true : stryMutAct_9fa48("2206") ? response.ok : (stryCov_9fa48("2206", "2207", "2208"), !response.ok)) {
              if (stryMutAct_9fa48("2209")) {
                {}
              } else {
                stryCov_9fa48("2209");
                throw new Error(stryMutAct_9fa48("2210") ? "" : (stryCov_9fa48("2210"), 'Failed to update note'));
              }
            }
            const updatedNote = await response.json();
            setNotes(notes.map(stryMutAct_9fa48("2211") ? () => undefined : (stryCov_9fa48("2211"), note => (stryMutAct_9fa48("2214") ? note.note_id !== noteId : stryMutAct_9fa48("2213") ? false : stryMutAct_9fa48("2212") ? true : (stryCov_9fa48("2212", "2213", "2214"), note.note_id === noteId)) ? stryMutAct_9fa48("2215") ? {} : (stryCov_9fa48("2215"), {
              ...note,
              ...updatedNote
            }) : note)));
            setEditingNoteId(null);
            setEditingContent(stryMutAct_9fa48("2216") ? "Stryker was here!" : (stryCov_9fa48("2216"), ''));
          }
        } catch (error) {
          if (stryMutAct_9fa48("2217")) {
            {}
          } else {
            stryCov_9fa48("2217");
            console.error(stryMutAct_9fa48("2218") ? "" : (stryCov_9fa48("2218"), 'Error updating note:'), error);
            setError(stryMutAct_9fa48("2219") ? "" : (stryCov_9fa48("2219"), 'Failed to update note. Please try again.'));
          }
        }
      }
    };
    const showDeleteConfirmation = (noteId, noteContent) => {
      if (stryMutAct_9fa48("2220")) {
        {}
      } else {
        stryCov_9fa48("2220");
        setDeleteConfirmModal(stryMutAct_9fa48("2221") ? {} : (stryCov_9fa48("2221"), {
          isOpen: stryMutAct_9fa48("2222") ? false : (stryCov_9fa48("2222"), true),
          noteId,
          noteContent: (stryMutAct_9fa48("2226") ? noteContent.length <= 50 : stryMutAct_9fa48("2225") ? noteContent.length >= 50 : stryMutAct_9fa48("2224") ? false : stryMutAct_9fa48("2223") ? true : (stryCov_9fa48("2223", "2224", "2225", "2226"), noteContent.length > 50)) ? (stryMutAct_9fa48("2227") ? noteContent : (stryCov_9fa48("2227"), noteContent.substring(0, 50))) + (stryMutAct_9fa48("2228") ? "" : (stryCov_9fa48("2228"), '...')) : noteContent
        }));
      }
    };
    const hideDeleteConfirmation = () => {
      if (stryMutAct_9fa48("2229")) {
        {}
      } else {
        stryCov_9fa48("2229");
        setDeleteConfirmModal(stryMutAct_9fa48("2230") ? {} : (stryCov_9fa48("2230"), {
          isOpen: stryMutAct_9fa48("2231") ? true : (stryCov_9fa48("2231"), false),
          noteId: null,
          noteContent: stryMutAct_9fa48("2232") ? "Stryker was here!" : (stryCov_9fa48("2232"), '')
        }));
      }
    };
    const handleDeleteNote = async () => {
      if (stryMutAct_9fa48("2233")) {
        {}
      } else {
        stryCov_9fa48("2233");
        const noteId = deleteConfirmModal.noteId;
        try {
          if (stryMutAct_9fa48("2234")) {
            {}
          } else {
            stryCov_9fa48("2234");
            setError(null);
            const response = await fetch(stryMutAct_9fa48("2235") ? `` : (stryCov_9fa48("2235"), `${import.meta.env.VITE_API_URL}/api/admissions/notes/${noteId}`), stryMutAct_9fa48("2236") ? {} : (stryCov_9fa48("2236"), {
              method: stryMutAct_9fa48("2237") ? "" : (stryCov_9fa48("2237"), 'DELETE'),
              headers: stryMutAct_9fa48("2238") ? {} : (stryCov_9fa48("2238"), {
                'Authorization': stryMutAct_9fa48("2239") ? `` : (stryCov_9fa48("2239"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("2240") ? "" : (stryCov_9fa48("2240"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("2243") ? false : stryMutAct_9fa48("2242") ? true : stryMutAct_9fa48("2241") ? response.ok : (stryCov_9fa48("2241", "2242", "2243"), !response.ok)) {
              if (stryMutAct_9fa48("2244")) {
                {}
              } else {
                stryCov_9fa48("2244");
                throw new Error(stryMutAct_9fa48("2245") ? "" : (stryCov_9fa48("2245"), 'Failed to delete note'));
              }
            }
            setNotes(stryMutAct_9fa48("2246") ? notes : (stryCov_9fa48("2246"), notes.filter(stryMutAct_9fa48("2247") ? () => undefined : (stryCov_9fa48("2247"), note => stryMutAct_9fa48("2250") ? note.note_id === noteId : stryMutAct_9fa48("2249") ? false : stryMutAct_9fa48("2248") ? true : (stryCov_9fa48("2248", "2249", "2250"), note.note_id !== noteId)))));
            hideDeleteConfirmation();
          }
        } catch (error) {
          if (stryMutAct_9fa48("2251")) {
            {}
          } else {
            stryCov_9fa48("2251");
            console.error(stryMutAct_9fa48("2252") ? "" : (stryCov_9fa48("2252"), 'Error deleting note:'), error);
            setError(stryMutAct_9fa48("2253") ? "" : (stryCov_9fa48("2253"), 'Failed to delete note. Please try again.'));
          }
        }
      }
    };
    const startEdit = note => {
      if (stryMutAct_9fa48("2254")) {
        {}
      } else {
        stryCov_9fa48("2254");
        setEditingNoteId(note.note_id);
        setEditingContent(note.note_content);
      }
    };
    const cancelEdit = () => {
      if (stryMutAct_9fa48("2255")) {
        {}
      } else {
        stryCov_9fa48("2255");
        setEditingNoteId(null);
        setEditingContent(stryMutAct_9fa48("2256") ? "Stryker was here!" : (stryCov_9fa48("2256"), ''));
      }
    };
    const formatDate = dateString => {
      if (stryMutAct_9fa48("2257")) {
        {}
      } else {
        stryCov_9fa48("2257");
        // Backend now returns timestamps already converted to EST
        try {
          if (stryMutAct_9fa48("2258")) {
            {}
          } else {
            stryCov_9fa48("2258");
            const date = new Date(dateString);
            return format(date, stryMutAct_9fa48("2259") ? "" : (stryCov_9fa48("2259"), 'MMM d, yyyy h:mm a'));
          }
        } catch (error) {
          if (stryMutAct_9fa48("2260")) {
            {}
          } else {
            stryCov_9fa48("2260");
            console.error(stryMutAct_9fa48("2261") ? "" : (stryCov_9fa48("2261"), 'Error formatting date:'), error);
            return dateString; // Fallback to original string
          }
        }
      }
    };
    const canEditNote = note => {
      if (stryMutAct_9fa48("2262")) {
        {}
      } else {
        stryCov_9fa48("2262");
        // User can edit/delete their own notes
        // Check different possible user ID fields from the auth context
        const currentUserId = stryMutAct_9fa48("2265") ? (user?.user_id || user?.id) && user?.userId : stryMutAct_9fa48("2264") ? false : stryMutAct_9fa48("2263") ? true : (stryCov_9fa48("2263", "2264", "2265"), (stryMutAct_9fa48("2267") ? user?.user_id && user?.id : stryMutAct_9fa48("2266") ? false : (stryCov_9fa48("2266", "2267"), (stryMutAct_9fa48("2268") ? user.user_id : (stryCov_9fa48("2268"), user?.user_id)) || (stryMutAct_9fa48("2269") ? user.id : (stryCov_9fa48("2269"), user?.id)))) || (stryMutAct_9fa48("2270") ? user.userId : (stryCov_9fa48("2270"), user?.userId)));
        return stryMutAct_9fa48("2273") ? currentUserId || currentUserId === note.created_by : stryMutAct_9fa48("2272") ? false : stryMutAct_9fa48("2271") ? true : (stryCov_9fa48("2271", "2272", "2273"), currentUserId && (stryMutAct_9fa48("2275") ? currentUserId !== note.created_by : stryMutAct_9fa48("2274") ? true : (stryCov_9fa48("2274", "2275"), currentUserId === note.created_by)));
      }
    };
    if (stryMutAct_9fa48("2278") ? false : stryMutAct_9fa48("2277") ? true : stryMutAct_9fa48("2276") ? isOpen : (stryCov_9fa48("2276", "2277", "2278"), !isOpen)) return null;
    return <div className="notes-modal-overlay" onClick={onClose}>
            <div className="notes-modal" onClick={stryMutAct_9fa48("2279") ? () => undefined : (stryCov_9fa48("2279"), e => e.stopPropagation())}>
                <div className="notes-modal__header">
                    <h2>Notes for {applicantName}</h2>
                    <button onClick={onClose} className="notes-modal__close-btn">×</button>
                </div>

                <div className="notes-modal__content">
                    {/* Add new note form */}
                    <form onSubmit={handleAddNote} className="add-note-form">
                        <textarea value={newNote} onChange={stryMutAct_9fa48("2280") ? () => undefined : (stryCov_9fa48("2280"), e => setNewNote(e.target.value))} placeholder="Add a new note about this applicant..." rows={3} className="add-note-textarea" />
                        <button type="submit" disabled={stryMutAct_9fa48("2283") ? !newNote.trim() && addingNote : stryMutAct_9fa48("2282") ? false : stryMutAct_9fa48("2281") ? true : (stryCov_9fa48("2281", "2282", "2283"), (stryMutAct_9fa48("2284") ? newNote.trim() : (stryCov_9fa48("2284"), !(stryMutAct_9fa48("2285") ? newNote : (stryCov_9fa48("2285"), newNote.trim())))) || addingNote)} className="add-note-btn">
                            {addingNote ? stryMutAct_9fa48("2286") ? "" : (stryCov_9fa48("2286"), 'Adding...') : stryMutAct_9fa48("2287") ? "" : (stryCov_9fa48("2287"), 'Add Note')}
                        </button>
                    </form>

                    {stryMutAct_9fa48("2290") ? error || <div className="notes-error">
                            {error}
                        </div> : stryMutAct_9fa48("2289") ? false : stryMutAct_9fa48("2288") ? true : (stryCov_9fa48("2288", "2289", "2290"), error && <div className="notes-error">
                            {error}
                        </div>)}

                    {/* Notes list */}
                    <div className="notes-list">
                        {loading ? <div className="notes-loading">
                                <div className="spinner"></div>
                                <p>Loading notes...</p>
                            </div> : (stryMutAct_9fa48("2293") ? notes.length !== 0 : stryMutAct_9fa48("2292") ? false : stryMutAct_9fa48("2291") ? true : (stryCov_9fa48("2291", "2292", "2293"), notes.length === 0)) ? <div className="no-notes">
                                <p>No notes yet for this applicant.</p>
                            </div> : notes.map(stryMutAct_9fa48("2294") ? () => undefined : (stryCov_9fa48("2294"), note => <div key={note.note_id} className="note-item">
                                    <div className="note-item__header">
                                        <span className="note-author">
                                            {note.created_by_first_name} {note.created_by_last_name}
                                        </span>
                                        <span className="note-date">
                                            {formatDate(note.created_at)}
                                            {stryMutAct_9fa48("2297") ? note.updated_at !== note.created_at || ' (edited)' : stryMutAct_9fa48("2296") ? false : stryMutAct_9fa48("2295") ? true : (stryCov_9fa48("2295", "2296", "2297"), (stryMutAct_9fa48("2299") ? note.updated_at === note.created_at : stryMutAct_9fa48("2298") ? true : (stryCov_9fa48("2298", "2299"), note.updated_at !== note.created_at)) && (stryMutAct_9fa48("2300") ? "" : (stryCov_9fa48("2300"), ' (edited)')))}
                                        </span>
                                    </div>
                                    
                                    {(stryMutAct_9fa48("2303") ? editingNoteId !== note.note_id : stryMutAct_9fa48("2302") ? false : stryMutAct_9fa48("2301") ? true : (stryCov_9fa48("2301", "2302", "2303"), editingNoteId === note.note_id)) ? <div className="note-edit-form">
                                            <textarea value={editingContent} onChange={stryMutAct_9fa48("2304") ? () => undefined : (stryCov_9fa48("2304"), e => setEditingContent(e.target.value))} rows={3} className="edit-note-textarea" />
                                            <div className="note-edit-actions">
                                                <button onClick={stryMutAct_9fa48("2305") ? () => undefined : (stryCov_9fa48("2305"), () => handleEditNote(note.note_id, editingContent))} className="save-edit-btn" disabled={stryMutAct_9fa48("2306") ? editingContent.trim() : (stryCov_9fa48("2306"), !(stryMutAct_9fa48("2307") ? editingContent : (stryCov_9fa48("2307"), editingContent.trim())))}>
                                                    Save
                                                </button>
                                                <button onClick={cancelEdit} className="cancel-edit-btn">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div> : <>
                                            <div className="note-content">
                                                {note.note_content}
                                            </div>
                                            {stryMutAct_9fa48("2310") ? canEditNote(note) || <div className="note-actions">
                                                    <button onClick={() => startEdit(note)} className="edit-note-btn">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => showDeleteConfirmation(note.note_id, note.note_content)} className="delete-note-btn">
                                                        Delete
                                                    </button>
                                                </div> : stryMutAct_9fa48("2309") ? false : stryMutAct_9fa48("2308") ? true : (stryCov_9fa48("2308", "2309", "2310"), canEditNote(note) && <div className="note-actions">
                                                    <button onClick={stryMutAct_9fa48("2311") ? () => undefined : (stryCov_9fa48("2311"), () => startEdit(note))} className="edit-note-btn">
                                                        Edit
                                                    </button>
                                                    <button onClick={stryMutAct_9fa48("2312") ? () => undefined : (stryCov_9fa48("2312"), () => showDeleteConfirmation(note.note_id, note.note_content))} className="delete-note-btn">
                                                        Delete
                                                    </button>
                                                </div>)}
                                        </>}
                                </div>))}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {stryMutAct_9fa48("2315") ? deleteConfirmModal.isOpen || <div className="delete-confirm-overlay">
                    <div className="delete-confirm-modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this note?</p>
                        <div className="note-preview">
                            "{deleteConfirmModal.noteContent}"
                        </div>
                        <div className="delete-confirm-actions">
                            <button onClick={hideDeleteConfirmation} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleDeleteNote} className="confirm-delete-btn">
                                Delete Note
                            </button>
                        </div>
                    </div>
                </div> : stryMutAct_9fa48("2314") ? false : stryMutAct_9fa48("2313") ? true : (stryCov_9fa48("2313", "2314", "2315"), deleteConfirmModal.isOpen && <div className="delete-confirm-overlay">
                    <div className="delete-confirm-modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this note?</p>
                        <div className="note-preview">
                            "{deleteConfirmModal.noteContent}"
                        </div>
                        <div className="delete-confirm-actions">
                            <button onClick={hideDeleteConfirmation} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleDeleteNote} className="confirm-delete-btn">
                                Delete Note
                            </button>
                        </div>
                    </div>
                </div>)}
        </div>;
  }
};
export default NotesModal;