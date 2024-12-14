'use client';

import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@shared/components/ui/alert-dialog';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void; // Added `onClose` explicitly
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'OK',
  onConfirm,
}) => {
  return (
    <ShadcnAlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              onConfirm?.(); // Call confirm handler
              onClose(); // Close dialog
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ShadcnAlertDialog>
  );
};

export default AlertDialog;
