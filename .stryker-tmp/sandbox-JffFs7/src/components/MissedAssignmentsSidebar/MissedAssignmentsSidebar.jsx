// @ts-nocheck
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import './MissedAssignmentsSidebar.css';

const MissedAssignmentsSidebar = ({ isOpen, onClose, onNavigateToDay }) => {
  const [missedAssignments, setMissedAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMissedAssignments();
    }
  }, [isOpen]);

  const fetchMissedAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/missed-assignments-list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMissedAssignments(data);
      } else {
        console.error('Failed to fetch missed assignments');
      }
    } catch (error) {
      console.error('Error fetching missed assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}.${day}.${year}`;
  };

  const handleGoClick = (assignment) => {
    onNavigateToDay(assignment.day_id, assignment.task_id);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="missed-assignments-sidebar">
        <div className="missed-assignments-sidebar__header">
          <div className="missed-assignments-sidebar__title-wrapper">
            <button onClick={onClose} className="missed-assignments-sidebar__close-btn">
              <X className="missed-assignments-sidebar__icon" />
            </button>
            <span className="missed-assignments-sidebar__title">
              ( {missedAssignments.length} ) missed assignments
            </span>
          </div>
        </div>

        <div className="missed-assignments-sidebar__content">
          <h2 className="missed-assignments-sidebar__subtitle">Let's keep going!</h2>

          {loading ? (
            <div className="missed-assignments-sidebar__loading">Loading...</div>
          ) : missedAssignments.length === 0 ? (
            <div className="missed-assignments-sidebar__empty">
              No missed assignments! Great work! 🎉
            </div>
          ) : (
            <div className="missed-assignments-sidebar__list">
              {missedAssignments.map((assignment, index) => (
                <div key={`${assignment.task_id}-${index}`} className="missed-assignments-sidebar__item">
                  <div className="missed-assignments-sidebar__item-content">
                    <div className="missed-assignments-sidebar__date">
                      {formatDate(assignment.day_date)}
                    </div>
                    <div className="missed-assignments-sidebar__task-title">
                      {assignment.task_title}
                    </div>
                  </div>
                  <button
                    className="missed-assignments-sidebar__go-btn"
                    onClick={() => handleGoClick(assignment)}
                  >
                    Go
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MissedAssignmentsSidebar;

