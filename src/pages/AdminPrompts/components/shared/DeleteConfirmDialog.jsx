import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';

const DeleteConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  itemName 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-proxima-bold text-[#1E1E1E]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-proxima text-[#666]">
            {itemName ? (
              <>
                Are you sure you want to delete "<span className="font-medium text-[#1E1E1E]">{itemName}</span>"? {description}
              </>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;

