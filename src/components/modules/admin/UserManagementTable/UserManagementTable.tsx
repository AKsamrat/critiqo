"use client";

import { useState, useEffect, useMemo } from "react";
import { Eye, RotateCcw, Trash2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { deleteUser } from "@/services/User";
import UserDetailsModal from "./UserDetailsModal";
import { TUser } from "@/types/user";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/ui/core/NMModal/DeleteConfirmationModal";

// Interface for component props
interface UserManagementTableProps {
  users?: TUser[];
  defaultPage?: number;
  defaultLimit?: number;
  defaultSearch?: string;
}

// Service function for fetching all users (no pagination parameters)
const fetchAllUsers = async (): Promise<TUser[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch users: ${response.status} ${errorData}`);
  }

  const data = await response.json();

  // Handle different response structures
  return data.users || data.data || data || [];
};

const UserManagementTable = ({
  users: initialUsers = [],
  defaultPage = 1,
  defaultLimit = 10,
  defaultSearch = ""
}: UserManagementTableProps) => {
  // All users data (fetched once)
  const [allUsers, setAllUsers] = useState<TUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Frontend pagination and search state
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage, setItemsPerPage] = useState(defaultLimit);

  // Existing state
  const [showStatusDropdown, setShowStatusDropdown] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch all users once
  const fetchUsersData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching all users...');
      const data = await fetchAllUsers();
      console.log('Fetched users data:', data);
      setAllUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to fetch users");
      toast.error("Failed to fetch users");

      // Fallback to initial data if provided
      if (initialUsers && Array.isArray(initialUsers)) {
        setAllUsers(initialUsers);
      } else {
        setAllUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPage = urlParams.get('page');
    const urlSearch = urlParams.get('search');
    const urlLimit = urlParams.get('limit');

    if (urlPage) setCurrentPage(parseInt(urlPage));
    if (urlSearch) setSearchTerm(urlSearch);
    if (urlLimit) setItemsPerPage(parseInt(urlLimit));

    // Only fetch if we don't have initial data
    if (!initialUsers.length) {
      fetchUsersData();
    }
  }, []);

  // Frontend filtering and pagination logic
  const { paginatedUsers, totalPages, totalCount } = useMemo(() => {
    // Filter users based on search term
    const filtered = allUsers.filter(user => {
      const searchLower = searchTerm.toLowerCase().trim();
      if (!searchLower) return true;

      const name = user.guest?.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';

      return name.includes(searchLower) || email.includes(searchLower);
    });

    // Calculate total pages
    const pages = Math.ceil(filtered.length / itemsPerPage) || 1;

    // Get current page data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      filteredUsers: filtered,
      paginatedUsers: paginated,
      totalPages: pages,
      totalCount: filtered.length
    };
  }, [allUsers, searchTerm, currentPage, itemsPerPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
    updateURLParams({ page: 1, search: searchTerm });
  }, [searchTerm]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
    updateURLParams({ page: 1, limit: itemsPerPage });
  }, [itemsPerPage]);

  // Update URL parameters
  const updateURLParams = (params: Record<string, any>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '' && value !== defaultPage && key === 'page' && value === 1) {
        url.searchParams.delete(key);
      } else if (value && value !== '') {
        url.searchParams.set(key, value.toString());
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, '', url.toString());
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      updateURLParams({ page: page === 1 ? null : page });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setItemsPerPage(defaultLimit);
    updateURLParams({ page: null, search: null, limit: null });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...' as any);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...' as any);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...' as any);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...' as any);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const viewUserDetails = (user: TUser) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const handleDeleteClick = (user: TUser) => {
    setSelectedItem({ id: user.id, name: user.guest?.name || user.email });
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    const result = await deleteUser(selectedItem.id);
    if (result.success) {
      // Remove from local state
      setAllUsers((prev) => prev.filter((user) => user.id !== selectedItem.id));

      // If current page becomes empty and it's not the first page, go to previous page
      const newFilteredCount = allUsers.filter(user =>
        user.id !== selectedItem.id &&
        (searchTerm === '' ||
          user.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ).length;

      const newTotalPages = Math.ceil(newFilteredCount / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        handlePageChange(newTotalPages);
      }

      toast.success(result.message);
    } else {
      toast.error(result.message || "There was an error.");
    }

    setModalOpen(false);
    setSelectedItem(null);
  };

  if (loading && allUsers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="text-sm text-gray-600">
          Total: {totalCount} users {searchTerm && `(filtered from ${allUsers.length})`}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>

          {searchTerm && (
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
          )}

          <button
            onClick={fetchUsersData}
            disabled={loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={fetchUsersData}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Created At</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{user.guest?.name || "N/A"}</td>
                  <td className="py-3 px-4 text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowStatusDropdown(showStatusDropdown === user.id ? "" : user.id)
                        }
                        className={`px-2 py-1 rounded-full text-xs flex items-center ${user.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                      >
                        {user.status}
                        <RotateCcw className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        disabled={user.role === "ADMIN"}
                        onClick={() => handleDeleteClick(user)}
                        className={`p-1 transition-colors ${user.role === "ADMIN"
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-800"
                          }`}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-sm py-8 text-gray-500">
                  {searchTerm ? `No users found matching "${searchTerm}"` : "No users found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>

            <div className="flex space-x-1">
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <UserDetailsModal
        isOpen={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        user={selectedUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        name={selectedItem?.name || ""}
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UserManagementTable;