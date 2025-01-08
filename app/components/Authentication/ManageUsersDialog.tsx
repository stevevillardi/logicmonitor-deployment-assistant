'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { supabaseBrowser } from '@/app/lib/supabase';
import { UserRole } from '@/app/types/auth';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users } from 'lucide-react';

interface AlertState {
    show: boolean;
    title: string;
    message: string;
    variant: 'default' | 'destructive';
}

interface User {
    id: string;
    email: string;
    role: UserRole;
    is_disabled?: boolean;
}

interface ManageUsersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ManageUsersDialog = memo(function ManageUsersDialog({ open, onOpenChange }: ManageUsersDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        title: '',
        message: '',
        variant: 'default'
    });

    const showAlert = useCallback((title: string, message: string, variant: 'default' | 'destructive' = 'default') => {
        setAlert({ show: true, title, message, variant });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const { data, error } = await supabaseBrowser
                .from('profiles')
                .select('id, email, role, is_disabled');
            
            if (error) throw error;
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showAlert('Error', 'Failed to fetch users', 'destructive');
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    useEffect(() => {
        if (open && loading) {
            fetchUsers();
        }
        if (!open) {
            setLoading(true);
        }
    }, [open, loading, fetchUsers]);

    const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
        try {
            const { error } = await supabaseBrowser
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users => users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
            showAlert('Success', 'User role updated successfully');
        } catch (error) {
            console.error('Error updating user role:', error);
            showAlert('Error', 'Failed to update user role', 'destructive');
        }
    }, [showAlert]);

    const toggleUserAccess = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabaseBrowser
                .from('profiles')
                .update({ is_disabled: !currentStatus })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_disabled: !currentStatus } : user
            ));
            showAlert('Success', `User ${currentStatus ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error('Error toggling user access:', error);
            showAlert('Error', 'Failed to update user access', 'destructive');
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                    <DialogHeader className="pb-4 border-b border-blue-200 dark:border-gray-700">
                        <DialogTitle className="text-xl font-semibold text-blue-900 dark:text-gray-100">
                            Manage Users
                        </DialogTitle>
                        <DialogDescription className="text-blue-700 dark:text-blue-300">
                            Manage user roles and access. You can change roles or disable user access.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
                        {loading ? (
                            <div className="text-center py-4 text-blue-700 dark:text-blue-300">Loading...</div>
                        ) : users.length === 0 ? (
                            <div className="border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-lg p-6 text-center bg-white dark:bg-gray-900">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Users className="h-8 w-8 text-blue-400 dark:text-blue-500" />
                                    <h3 className="font-medium text-blue-900 dark:text-gray-100">No Users Found</h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-300">
                                        No users are currently registered in the system
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-blue-200 dark:border-gray-700 hover:bg-transparent">
                                            <TableHead className="text-sm font-semibold text-blue-900 dark:text-gray-300">
                                                Email
                                            </TableHead>
                                            <TableHead className="text-sm font-semibold text-blue-900 dark:text-gray-300">
                                                Role
                                            </TableHead>
                                            <TableHead className="text-sm font-semibold text-blue-900 dark:text-gray-300">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-sm font-semibold text-blue-900 dark:text-gray-300">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow 
                                                key={user.id}
                                                className="border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                            >
                                                <TableCell className="font-medium text-blue-900 dark:text-gray-300">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value: UserRole) => 
                                                            updateUserRole(user.id, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-32 bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white dark:bg-gray-900">
                                                            <SelectItem 
                                                                value="admin" 
                                                                className="text-blue-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                                                            >
                                                                Administrator
                                                            </SelectItem>
                                                            <SelectItem 
                                                                value="lm_user" 
                                                                className="text-blue-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                                                            >
                                                                LM User
                                                            </SelectItem>
                                                            <SelectItem 
                                                                value="viewer" 
                                                                className="text-blue-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                                                            >
                                                                Viewer
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        user.is_disabled 
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    }`}>
                                                        {user.is_disabled ? 'Disabled' : 'Active'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => toggleUserAccess(user.id, user.is_disabled!)}
                                                        className={user.is_disabled 
                                                            ? "bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
                                                            : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-200"
                                                        }
                                                    >
                                                        {user.is_disabled ? 'Enable' : 'Disable'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alert.show}>
                <AlertDialogContent className={`
                    ${alert.variant === 'destructive' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}
                    dark:bg-gray-800 dark:border-gray-700
                `}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={
                            alert.variant === 'destructive' ? 'text-red-700' : 'text-blue-700'
                        }>
                            {alert.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={
                            alert.variant === 'destructive' ? 'text-red-600' : 'text-blue-600'
                        }>
                            {alert.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});

export default ManageUsersDialog; 