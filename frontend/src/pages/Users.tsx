import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/useAuth";

import {
  changeUserPassword,
  createUser,
  getUsers,
  updateUser,
} from "../api/users";

import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserRole,
} from "../types/user";

const USER_ROLES: UserRole[] = [
  "ADMIN",
  "SALES",
  "WAREHOUSE",
  "ACCOUNTS",
];

const emptyCreateForm: CreateUserInput = {
  name: "",
  email: "",
  password: "",
  role: "SALES",
};

export const Users = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [createForm, setCreateForm] =
    useState<CreateUserInput>(
      emptyCreateForm,
    );

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [editForm, setEditForm] =
    useState<UpdateUserInput>({});

  const [passwordUser, setPasswordUser] =
    useState<User | null>(null);

  const [newPassword, setNewPassword] =
    useState("");

  const loadUsers = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getUsers();

        setUsers(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load users",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      await loadUsers();
    })();
  }, [loadUsers]);

  const handleCreate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createUser({
        name: createForm.name.trim(),
        email:
          createForm.email
            .trim()
            .toLowerCase(),
        password:
          createForm.password,
        role: createForm.role,
      });

      setCreateForm(
        emptyCreateForm,
      );

      setSuccess(
        "User created successfully.",
      );

      await loadUsers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create user",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (
    selectedUser: User,
  ) => {
    setError("");
    setSuccess("");

    setEditingUser(
      selectedUser,
    );

    setEditForm({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      isActive:
        selectedUser.isActive,
    });
  };

  const handleUpdate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateUser(
        editingUser.id,
        editForm,
      );

      setEditingUser(null);
      setEditForm({});

      setSuccess(
        "User updated successfully.",
      );

      await loadUsers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update user",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (
    selectedUser: User,
  ) => {
    if (
      selectedUser.id ===
        currentUser?.id &&
      selectedUser.isActive
    ) {
      setError(
        "You cannot deactivate your own account.",
      );
      return;
    }

    const action =
      selectedUser.isActive
        ? "deactivate"
        : "activate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${selectedUser.name}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateUser(
        selectedUser.id,
        {
          isActive:
            !selectedUser.isActive,
        },
      );

      setSuccess(
        `User ${action}d successfully.`,
      );

      await loadUsers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : `Failed to ${action} user`,
      );
    } finally {
      setSaving(false);
    }
  };

  const openPasswordChange = (
    selectedUser: User,
  ) => {
    setError("");
    setSuccess("");
    setNewPassword("");
    setPasswordUser(
      selectedUser,
    );
  };

  const handlePasswordChange =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      if (!passwordUser) {
        return;
      }

      if (newPassword.length < 8) {
        setError(
          "Password must be at least 8 characters.",
        );
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await changeUserPassword(
          passwordUser.id,
          {
            password: newPassword,
          },
        );

        setPasswordUser(null);
        setNewPassword("");

        setSuccess(
          "User password changed successfully.",
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to change password",
        );
      } finally {
        setSaving(false);
      }
    };

  if (
    currentUser?.role !== "ADMIN"
  ) {
    return (
      <div className="dashboard-error">
        You do not have permission to
        access User Management.
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>

          <p>
            Create and manage CRM users
            and their access roles.
          </p>
        </div>

        <strong>
          {users.length} Users
        </strong>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {success && (
        <div className="page-success">
          {success}
        </div>
      )}

      <form
        className="customer-form"
        onSubmit={handleCreate}
      >
        <h2>Create User</h2>

        <div className="form-grid">
          <label>
            Name *
            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={createForm.name}
              onChange={(event) =>
                setCreateForm(
                  (current) => ({
                    ...current,
                    name:
                      event.target
                        .value,
                  }),
                )
              }
              placeholder="User name"
            />
          </label>

          <label>
            Email *
            <input
              type="email"
              required
              maxLength={255}
              value={createForm.email}
              onChange={(event) =>
                setCreateForm(
                  (current) => ({
                    ...current,
                    email:
                      event.target
                        .value,
                  }),
                )
              }
              placeholder="user@company.com"
            />
          </label>

          <label>
            Password *
            <input
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={
                createForm.password
              }
              onChange={(event) =>
                setCreateForm(
                  (current) => ({
                    ...current,
                    password:
                      event.target
                        .value,
                  }),
                )
              }
              placeholder="Minimum 8 characters"
            />
          </label>

          <label>
            Role *
            <select
              value={createForm.role}
              onChange={(event) =>
                setCreateForm(
                  (current) => ({
                    ...current,
                    role:
                      event.target
                        .value as UserRole,
                  }),
                )
              }
            >
              {USER_ROLES.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create User"}
          </button>
        </div>
      </form>

      <div className="inventory-section">
        <div className="section-header">
          <div>
            <h2>Users</h2>

            <p>
              Manage employee access to
              the CRM.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="page-message">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state-box">
            No users found.
          </div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (item) => (
                    <tr
                      key={item.id}
                    >
                      <td>
                        <strong>
                          {item.name}
                        </strong>
                      </td>

                      <td>
                        {item.email}
                      </td>

                      <td>
                        <span className="role-badge">
                          {item.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            item.isActive
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {item.isActive
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          item.createdAt,
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              openEdit(
                                item,
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              openPasswordChange(
                                item,
                              )
                            }
                          >
                            Password
                          </button>

                          <button
                            type="button"
                            className={
                              item.isActive
                                ? "danger-button"
                                : "primary-button"
                            }
                            disabled={
                              saving ||
                              (item.id ===
                                currentUser?.id &&
                                item.isActive)
                            }
                            onClick={() =>
                              handleToggleActive(
                                item,
                              )
                            }
                          >
                            {item.isActive
                              ? "Disable"
                              : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>
                  Edit User
                </h2>

                <p>
                  {editingUser.email}
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setEditingUser(
                    null,
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleUpdate
              }
            >
              <div className="modal-content">
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      type="text"
                      required
                      value={
                        editForm.name ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            name: event
                              .target
                              .value,
                          }),
                        )
                      }
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      required
                      value={
                        editForm.email ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            email:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </label>

                  <label>
                    Role
                    <select
                      value={
                        editForm.role ??
                        editingUser.role
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            role:
                              event
                                .target
                                .value as UserRole,
                          }),
                        )
                      }
                    >
                      {USER_ROLES.map(
                        (role) => (
                          <option
                            key={role}
                            value={
                              role
                            }
                          >
                            {role}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    Status
                    <select
                      value={
                        editForm.isActive ??
                        editingUser.isActive
                          ? "ACTIVE"
                          : "INACTIVE"
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            isActive:
                              event
                                .target
                                .value ===
                              "ACTIVE",
                          }),
                        )
                      }
                    >
                      <option value="ACTIVE">
                        ACTIVE
                      </option>

                      <option value="INACTIVE">
                        INACTIVE
                      </option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setEditingUser(
                      null,
                    )
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>
                  Change Password
                </h2>

                <p>
                  {passwordUser.name}
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setPasswordUser(
                    null,
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handlePasswordChange
              }
            >
              <div className="modal-content">
                <label>
                  New Password
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={
                      newPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewPassword(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Minimum 8 characters"
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Changing..."
                    : "Change Password"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setPasswordUser(
                      null,
                    )
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};