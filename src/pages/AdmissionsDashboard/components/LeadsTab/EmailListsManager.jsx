import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';

const EmailListsManager = ({ token, emailLists, onUpdate }) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddList = async () => {
    if (!newListName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/email-lists`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            name: newListName.trim(), 
            description: newListDescription.trim() || null 
          })
        }
      );

      if (response.ok) {
        setNewListName('');
        setNewListDescription('');
        setIsAddingList(false);
        onUpdate();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create list');
      }
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateList = async () => {
    if (!editingList || !newListName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/email-lists/${editingList.list_id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            name: newListName.trim(), 
            description: newListDescription.trim() || null 
          })
        }
      );

      if (response.ok) {
        setEditingList(null);
        setNewListName('');
        setNewListDescription('');
        onUpdate();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update list');
      }
    } catch (err) {
      console.error('Error updating list:', err);
      setError('Failed to update list');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list? This will remove all lead associations.')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/email-lists/${listId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  const startEditing = (list) => {
    setEditingList(list);
    setNewListName(list.name);
    setNewListDescription(list.description || '');
    setError(null);
  };

  const cancelEditing = () => {
    setEditingList(null);
    setNewListName('');
    setNewListDescription('');
    setError(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Lists
          </CardTitle>
          <Button size="sm" onClick={() => setIsAddingList(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Add List
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Manage email lists for segmenting leads and A/B testing campaigns.
        </p>
      </CardHeader>
      <CardContent>
        {emailLists.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No email lists created yet.</p>
            <p className="text-sm">Create a list to start segmenting your leads.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailLists.map((list) => (
                <TableRow key={list.list_id}>
                  <TableCell className="font-medium">{list.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {list.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{list.member_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => startEditing(list)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteList(list.list_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddingList || !!editingList} onOpenChange={() => {
        setIsAddingList(false);
        cancelEditing();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingList ? 'Edit Email List' : 'Create Email List'}
            </DialogTitle>
            <DialogDescription>
              {editingList 
                ? 'Update the details of this email list.'
                : 'Create a new list to segment your leads for targeted campaigns.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g., A/B Test Group A"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="e.g., Testing new email subject lines"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddingList(false);
              cancelEditing();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingList ? handleUpdateList : handleAddList}
              disabled={!newListName.trim() || loading}
            >
              {loading ? 'Saving...' : (editingList ? 'Save Changes' : 'Create List')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmailListsManager;
