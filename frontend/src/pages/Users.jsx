import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { RoleBadge, StatusBadge, LoadingSpinner } from '../components/BadgesAndCards';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal, ResetPasswordModal } from './UserModals';
import { formatDate, formatDateTime } from '../utils/formatters';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export const Users = () => {
  const { user: currentUser, isMasterAdmin, isAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordResetUser, setPasswordResetUser] = useState(null);

  // Destructive confirmations
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
      });
      // Handle paginated or plain array
      setUsers(data.results ? data.results : data);
    } catch (err) {
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleActivate = async (targetUser) => {
    try {
      await userService.activateUser(targetUser.id);
      toast.success(`User ${targetUser.username} activated.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to activate user.');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    setActionLoading(true);
    try {
      await userService.deactivateUser(userToDeactivate.id);
      toast.success('User deactivated successfully.');
      setUserToDeactivate(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to deactivate user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('Record deleted successfully.');
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 text-amber-500" />
            <span>USER MANAGEMENT</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Configure administrative accounts, operational roles, and enforce security policies.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>CREATE USER</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-500 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Roles</option>
            <option value="MASTER_ADMIN">Master Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setRoleFilter('');
              setStatusFilter('');
              fetchUsers();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Retrieving registered system users..." />
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No user accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isTargetMasterAdmin = u.role === 'MASTER_ADMIN';
                  const canModify = isMasterAdmin || (isAdmin && u.role === 'STAFF');
                  const canDelete = isMasterAdmin ? !isTargetMasterAdmin : (isAdmin && u.role === 'STAFF');

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-100 whitespace-nowrap">
                        {u.full_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400/90 whitespace-nowrap">
                        {u.username}
                      </td>
                      <td className="py-3 px-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {formatDateTime(u.last_login)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {formatDateTime(u.last_active)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          {canModify && (
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                              title="Edit User"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reset Password */}
                          {canModify && (
                            <button
                              onClick={() => setPasswordResetUser(u)}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                              title="Reset Password"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}

                          {/* Activate / Deactivate */}
                          {canModify && !isTargetMasterAdmin && (
                            u.status === 'ACTIVE' ? (
                              <button
                                onClick={() => setUserToDeactivate(u)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                                title="Deactivate User"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(u)}
                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                                title="Activate User"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={fetchUsers}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={fetchUsers}
        />
      )}

      {/* Reset Password Modal */}
      {passwordResetUser && (
        <ResetPasswordModal
          isOpen={!!passwordResetUser}
          user={passwordResetUser}
          onClose={() => setPasswordResetUser(null)}
          onPasswordReset={fetchUsers}
        />
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="DELETE RECORD?"
        message={`Are you sure you want to delete user account "${userToDelete?.full_name}" (${userToDelete?.username})?`}
        confirmText="DELETE"
        cancelText="CANCEL"
        isLoading={actionLoading}
        isDanger={true}
      />

      {/* Confirm Deactivation Dialog */}
      <ConfirmDialog
        isOpen={!!userToDeactivate}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        title="DEACTIVATE USER?"
        message={`Are you sure you want to deactivate "${userToDeactivate?.full_name}"? The user will immediately be barred from signing in.`}
        confirmText="DEACTIVATE"
        cancelText="CANCEL"
        isLoading={actionLoading}
        isDanger={false}
      />
    </div>
  );
};
