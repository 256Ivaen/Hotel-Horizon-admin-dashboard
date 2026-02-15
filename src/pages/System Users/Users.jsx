// UsersManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiTrash2,
  FiEdit,
  FiSearch,
  FiShield,
  FiX,
  FiCheck,
  FiClock,
  FiMail,
  FiUserPlus,
  FiKey,
  FiLock
} from 'react-icons/fi';
import { get, del, put, post } from '../../utils/service';
import DataTable from '../../components/ui/table/DataTable';
import Pagination from '../../components/ui/table/Pagination';
import Drawer from '../../components/ui/drawer';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { toast } from 'sonner';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userFormDrawer, setUserFormDrawer] = useState(false);
  const [passwordDrawer, setPasswordDrawer] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist'
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
    color: 'red'
  });

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        per_page: pagination.per_page.toString(),
        page: currentPage.toString()
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (roleFilter) {
        params.append('role', roleFilter);
      }

      const response = await get(`/users?${params.toString()}`);

      if (response.success) {
        setUsers(response.data || []);
        setPagination(response.pagination || pagination);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User",
      message: "Are you sure you want to delete this user? This action cannot be undone.",
      confirmText: "Delete User",
      color: "red",
      onConfirm: () => handleDeleteConfirm(userId)
    });
  };

  const handleDeleteConfirm = async (userId) => {
    try {
      const response = await del(`/users/${userId}`);

      if (response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleAddUser = () => {
    setFormMode('add');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'receptionist'
    });
    setUserFormDrawer(true);
  };

  const handleEditUser = (user) => {
    setFormMode('edit');
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'receptionist'
    });
    setSelectedUser(user);
    setUserFormDrawer(true);
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordDrawer(true);
  };

  const handleResetPassword = (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Reset User Password",
      message: `Are you sure you want to reset password for ${user.name}? They will need to use the new password to login.`,
      confirmText: "Reset Password",
      color: "yellow",
      onConfirm: () => handleResetPasswordConfirm(user.id)
    });
  };

  const handleResetPasswordConfirm = async (userId) => {
    try {
      const newPassword = 'Password123!';
      
      const response = await post(`/users/${userId}/reset-password`, {
        new_password: newPassword
      });

      if (response.success) {
        toast.success(`Password reset successfully. New password: ${newPassword}`);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Failed to reset password');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (formMode === 'add' && !formData.password) {
      toast.error('Password is required for new users');
      setSubmitting(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setSubmitting(false);
      return;
    }

    try {
      let response;

      if (formMode === 'add') {
        response = await post('/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
      } else {
        response = await put(`/users/${selectedUser.id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
      }

      if (response.success) {
        toast.success(formMode === 'add' ? 'User created successfully' : 'User updated successfully');
        setUserFormDrawer(false);
        fetchUsers();
      } else {
        toast.error(response.message || `Failed to ${formMode} user`);
      }
    } catch (err) {
      console.error(`Error ${formMode}ing user:`, err);
      toast.error(`Failed to ${formMode} user`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('Please fill in all password fields');
      setSubmitting(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      setSubmitting(false);
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const response = await post(`/users/${selectedUser.id}/change-password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      if (response.success) {
        toast.success('Password changed successfully');
        setPasswordDrawer(false);
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      super_admin: { bg: 'bg-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
      admin: { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
      receptionist: { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' }
    };
    
    const config = roleConfig[role] || roleConfig.receptionist;
    
    return (
      <span className={`inline-flex items-center text-xs ${config.text}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (value, row) => (
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {row.name}
          </p>
          <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {row.email}
          </p>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value, row) => getRoleBadge(row.role)
    },
    {
      key: 'created',
      label: 'Created',
      render: (value, row) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {formatDate(row.created_at)}
        </p>
      )
    },
    {
      key: 'updated',
      label: 'Last Updated',
      render: (value, row) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {formatDate(row.updated_at)}
        </p>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (row) => handleViewDetails(row),
      icon: <FiUsers size={14} />,
      className: isDarkMode ? 'text-blue-400' : 'text-blue-600'
    },
    {
      label: 'Edit User',
      onClick: (row) => handleEditUser(row),
      icon: <FiEdit size={14} />,
      className: isDarkMode ? 'text-green-400' : 'text-green-600'
    },
    {
      label: 'Change Password',
      onClick: (row) => handleChangePassword(row),
      icon: <FiLock size={14} />,
      className: isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
    },
    {
      label: 'Reset Password',
      onClick: (row) => handleResetPassword(row),
      icon: <FiKey size={14} />,
      className: isDarkMode ? 'text-orange-400' : 'text-orange-600'
    },
    {
      label: 'Delete',
      onClick: (row) => handleDeleteClick(row.id),
      icon: <FiTrash2 size={14} />,
      className: isDarkMode ? 'text-red-400' : 'text-red-600'
    }
  ];

  const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className={`h-12 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      ))}
    </div>
  );

  return (
    <>
      <div className={drawerOpen || userFormDrawer || passwordDrawer ? 'blur-sm pointer-events-none' : ''}>
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Users Management
                </h1>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Manage system users, roles and permissions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:border-primary`}
                >
                  <option value="">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="receptionist">Receptionist</option>
                </select>

                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <FiUserPlus size={14} />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <FiShield className={`mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</span>
              </div>
            </div>
          )}

          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {loading ? (
              <TableSkeleton />
            ) : users.length > 0 ? (
              <>
                <DataTable
                  columns={columns}
                  data={users}
                  actions={actions}
                  isDarkMode={isDarkMode}
                />
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  onPageChange={handlePageChange}
                  itemsPerPage={pagination.per_page}
                  totalItems={pagination.total}
                  isDarkMode={isDarkMode}
                />
              </>
            ) : (
              <div className="px-4 py-12 text-center">
                <div className={`flex flex-col items-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <FiUsers size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No users found</p>
                  {searchTerm && (
                    <p className="text-xs mt-1">Try adjusting your search terms</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUser(null);
        }}
        position="right"
        size="xl"
        title={`User Details - ${selectedUser?.name || ''}`}
      >
        <UserDetails
          user={selectedUser}
          isDarkMode={isDarkMode}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedUser(null);
          }}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          getRoleBadge={getRoleBadge}
          onEdit={() => {
            setDrawerOpen(false);
            handleEditUser(selectedUser);
          }}
          onChangePassword={() => {
            setDrawerOpen(false);
            handleChangePassword(selectedUser);
          }}
          onResetPassword={() => {
            setDrawerOpen(false);
            handleResetPassword(selectedUser);
          }}
        />
      </Drawer>

      <Drawer
        isOpen={userFormDrawer}
        onClose={() => setUserFormDrawer(false)}
        position="right"
        size="md"
        title={formMode === 'add' ? 'Add New User' : 'Edit User'}
      >
        <form onSubmit={handleFormSubmit} className="h-full flex flex-col">
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:border-primary`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:border-primary`}
                required
              />
            </div>

            {formMode === 'add' && (
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:border-primary`}
                  required={formMode === 'add'}
                  minLength={6}
                />
                <p className="text-[10px] text-gray-400 mt-1">Minimum 6 characters</p>
              </div>
            )}

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:border-primary`}
                required
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setUserFormDrawer(false)}
              disabled={submitting}
              className={`px-4 py-2 text-xs rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{formMode === 'add' ? 'Creating...' : 'Updating...'}</span>
                </>
              ) : (
                <span>{formMode === 'add' ? 'Create User' : 'Update User'}</span>
              )}
            </button>
          </div>
        </form>
      </Drawer>

      <Drawer
        isOpen={passwordDrawer}
        onClose={() => setPasswordDrawer(false)}
        position="right"
        size="md"
        title={`Change Password - ${selectedUser?.name || ''}`}
      >
        <form onSubmit={handlePasswordSubmit} className="h-full flex flex-col">
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Current Password *
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:border-primary`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                New Password *
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:border-primary`}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm New Password *
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:border-primary`}
                required
              />
            </div>

            <p className="text-[10px] text-gray-400">
              Password must be at least 6 characters long
            </p>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPasswordDrawer(false)}
              disabled={submitting}
              className={`px-4 py-2 text-xs rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Changing...</span>
                </>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </div>
        </form>
      </Drawer>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmButtonColor={confirmModal.color}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

const UserDetails = ({ 
  user, 
  isDarkMode, 
  onClose,
  formatDate,
  formatDateTime,
  getRoleBadge,
  onEdit,
  onChangePassword,
  onResetPassword
}) => {
  if (!user) return null;

  return (
    <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            {getRoleBadge(user.role)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Edit User"
            >
              <FiEdit size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            <button
              onClick={onChangePassword}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Change Password"
            >
              <FiLock size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            <button
              onClick={onResetPassword}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Reset Password"
            >
              <FiKey size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <FiX size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            User Information
          </h4>
          <div className="space-y-3">
            <div>
              <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user.name}</p>
            </div>
            <div>
              <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user.email}</p>
            </div>
            <div>
              <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</p>
              <p className={`text-xs font-medium capitalize ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user.role}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Account Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>User ID</span>
              <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDateTime(user.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDateTime(user.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onChangePassword}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
              isDarkMode 
                ? 'border-gray-700 hover:bg-gray-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FiLock size={20} className="text-primary" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Change Password
            </span>
          </button>
          <button
            onClick={onResetPassword}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
              isDarkMode 
                ? 'border-gray-700 hover:bg-gray-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FiKey size={20} className="text-yellow-600" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reset Password
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;