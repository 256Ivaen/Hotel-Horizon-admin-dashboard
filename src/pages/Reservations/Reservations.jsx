import React, { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiTrash2,
  FiEdit,
  FiSearch,
  FiShield,
  FiX,
  FiCheck,
  FiClock,
  FiMail
} from 'react-icons/fi';
import { get, del, put } from '../../utils/service';
import DataTable from '../../components/ui/table/DataTable';
import Pagination from '../../components/ui/table/Pagination';
import Drawer from '../../components/ui/drawer';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { toast } from 'sonner';

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 5,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
    color: 'red'
  });
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
    color: 'yellow'
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
    fetchReservations();
  }, [currentPage, searchTerm]);

  const fetchReservations = async () => {
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

      const response = await get(`/reservations?${params.toString()}`);

      if (response.success) {
        setReservations(response.data || []);
        setPagination(response.pagination || pagination);
      } else {
        setError('Failed to fetch reservations');
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (reservationId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Reservation",
      message: "Are you sure you want to delete this reservation? This action cannot be undone.",
      confirmText: "Delete Reservation",
      color: "red",
      onConfirm: () => handleDeleteConfirm(reservationId)
    });
  };

  const handleDeleteConfirm = async (reservationId) => {
    try {
      const response = await del(`/reservations/${reservationId}`);

      if (response.success) {
        toast.success('Reservation deleted successfully');
        fetchReservations();
      } else {
        setError('Failed to delete reservation');
      }
    } catch (err) {
      console.error('Error deleting reservation:', err);
      setError('Failed to delete reservation');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleStatusChangeClick = (reservation) => {
    setSelectedReservation(reservation);
    setStatusModal({
      isOpen: true,
      title: "Update Reservation Status",
      message: `Are you sure you want to mark this reservation as cancelled?`,
      confirmText: "Yes, Cancel Reservation",
      color: "yellow",
      onConfirm: () => handleStatusChangeConfirm(reservation.id)
    });
  };

  const handleStatusChangeConfirm = async (reservationId) => {
    try {
      const response = await put(`/reservations/${reservationId}/status`, {
        status: "cancelled"
      });

      if (response.success) {
        toast.success('Reservation status updated successfully');
        fetchReservations();
      } else {
        setError('Failed to update reservation status');
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Failed to update reservation status');
    } finally {
      setStatusModal({ ...statusModal, isOpen: false });
      setSelectedReservation(null);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDrawerOpen(true);
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

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString()}`;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-500', dot: 'bg-green-500' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-500', dot: 'bg-yellow-500' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-500', dot: 'bg-red-500' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-500', dot: 'bg-blue-500' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center text-xs ${config.text}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const getEmailStatusBadge = (status) => {
    return status === 'sent' ? (
      <span className="inline-flex items-center text-green-600 text-xs">
        <FiCheck className="mr-1" size={12} />
        Sent
      </span>
    ) : (
      <span className="inline-flex items-center text-yellow-600 text-xs">
        <FiClock className="mr-1" size={12} />
        Pending
      </span>
    );
  };

  const columns = [
    {
      key: 'confirmation',
      label: 'Confirmation #',
      render: (value, row) => (
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {row.confirmationNumber}
          </p>
          <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatDateTime(row.createdAt)}
          </p>
        </div>
      )
    },
    {
      key: 'guest',
      label: 'Guest',
      render: (value, row) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {row.guest?.firstName} {row.guest?.lastName}
        </p>
      )
    },
    {
      key: 'room',
      label: 'Room',
      render: (value, row) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {row.booking?.roomType}
        </p>
      )
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (value, row) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {formatDate(row.booking?.checkIn)} - {formatDate(row.booking?.checkOut)}
        </p>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (value, row) => (
        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {formatCurrency(row.booking?.finalPrice)}
        </p>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => getStatusBadge(row.status)
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (row) => handleViewDetails(row),
      icon: <FiCalendar size={14} />,
      className: isDarkMode ? 'text-blue-400' : 'text-blue-600'
    },
    {
      label: 'Cancel Reservation',
      onClick: (row) => handleStatusChangeClick(row),
      icon: <FiX size={14} />,
      className: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
      hidden: (row) => row.status === 'cancelled' || row.status === 'completed'
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
      <div className={drawerOpen ? 'blur-sm pointer-events-none' : ''}>
        <div className="space-y-6">
          {/* Header */}
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Reservations Management
                </h1>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Manage all hotel reservations at Hotel Horizon
                </p>
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

          {/* Reservations Table */}
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>

            {loading ? (
              <TableSkeleton />
            ) : reservations.length > 0 ? (
              <>
                <DataTable
                  columns={columns}
                  data={reservations}
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
                  <FiCalendar size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No reservations found</p>
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
          setSelectedReservation(null);
        }}
        position="right"
        size="xl"
        title={`Reservation Details - ${selectedReservation?.confirmationNumber || ''}`}
      >
        <ReservationDetails
          reservation={selectedReservation}
          isDarkMode={isDarkMode}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedReservation(null);
          }}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          formatCurrency={formatCurrency}
          getStatusBadge={getStatusBadge}
          getEmailStatusBadge={getEmailStatusBadge}
        />
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

      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() => {
          setStatusModal({ ...statusModal, isOpen: false });
          setSelectedReservation(null);
        }}
        onConfirm={statusModal.onConfirm}
        title={statusModal.title}
        message={statusModal.message}
        confirmText={statusModal.confirmText}
        confirmButtonColor={statusModal.color}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

const ReservationDetails = ({ 
  reservation, 
  isDarkMode, 
  onClose,
  formatDate,
  formatDateTime,
  formatCurrency,
  getStatusBadge,
  getEmailStatusBadge
}) => {
  if (!reservation) return null;

  return (
    <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-6 space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div>
            {getStatusBadge(reservation.status)}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <FiX size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Confirmation Info */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Booking Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Confirmation #</span>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reservation.confirmationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDateTime(reservation.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDateTime(reservation.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Guest Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</span>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {reservation.guest?.firstName} {reservation.guest?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reservation.guest?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reservation.guest?.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Booking Details
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Room Type</span>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reservation.booking?.roomType}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Check In</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDate(reservation.booking?.checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Check Out</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDate(reservation.booking?.checkOut)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nights</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reservation.booking?.nights}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Guests</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {reservation.booking?.adults} Adult(s), {reservation.booking?.children} Child(ren)
              </span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Price Breakdown
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price per Night</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatCurrency(reservation.booking?.pricePerNight)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Room Total</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatCurrency(reservation.booking?.roomTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Extras Total</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatCurrency(reservation.booking?.extrasTotal)}</span>
            </div>
            <div className="pt-2 border-t border-dashed flex justify-between font-medium">
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Final Price</span>
              <span className={`text-sm font-bold text-primary`}>{formatCurrency(reservation.booking?.finalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Extras */}
        {reservation.extras && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Extras
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Airport Pickup:</span>
                <span className={`ml-2 text-xs ${reservation.extras.airportPick ? 'text-green-600' : 'text-red-600'}`}>
                  {reservation.extras.airportPick ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Airport Drop:</span>
                <span className={`ml-2 text-xs ${reservation.extras.airportDrop ? 'text-green-600' : 'text-red-600'}`}>
                  {reservation.extras.airportDrop ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Half Board:</span>
                <span className={`ml-2 text-xs ${reservation.extras.halfBoard ? 'text-green-600' : 'text-red-600'}`}>
                  {reservation.extras.halfBoard ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Board:</span>
                <span className={`ml-2 text-xs ${reservation.extras.fullBoard ? 'text-green-600' : 'text-red-600'}`}>
                  {reservation.extras.fullBoard ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Special Requests */}
        {reservation.specialRequests && reservation.specialRequests !== 'None' && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h4 className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Special Requests
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {reservation.specialRequests}
            </p>
          </div>
        )}

        {/* Email Status */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email Status
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Guest Email</span>
              <span>{getEmailStatusBadge(reservation.emailStatus?.guest)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hotel Email</span>
              <span>{getEmailStatusBadge(reservation.emailStatus?.hotel)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsManagement;