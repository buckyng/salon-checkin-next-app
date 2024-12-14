'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { toast } from 'react-toastify';

interface AssignOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (email: string) => Promise<'success' | 'user-not-found'>;
  assigning: boolean;
}

const AssignOwnerDialog: React.FC<AssignOwnerDialogProps> = ({
  isOpen,
  onClose,
  onAssign,
  assigning,
}) => {
  const [email, setEmail] = useState('');

  const handleAssign = async () => {
    if (!email.trim()) return;

    try {
      const status = await onAssign(email.trim());

      if (status === 'user-not-found') {
        toast.error('User with the given email does not exist.');
      } else if (status === 'success') {
        toast.success('Owner assigned successfully!');
        setEmail('');
        onClose();
      }
    } catch (error) {
      console.error('Error assigning owner:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Assign Owner</DialogTitle>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Owner's Email"
          type="email"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={assigning}>
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignOwnerDialog;
