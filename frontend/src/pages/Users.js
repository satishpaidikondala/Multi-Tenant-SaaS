import React, { useState, useEffect } from "react";
import { Container, Navbar, Button, Table, Badge, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user",
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) navigate("/login");
    setCurrentUser(user);
    if (user.role !== "tenant_admin") {
       alert("Access Denied");
       navigate("/dashboard");
    }
    fetchUsers(user.tenantId);
  }, [navigate]);

  const fetchUsers = async (tenantId) => {
    try {
      const res = await api.get(`/tenants/${tenantId}/users`);
      setUsers(res.data.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser?.tenantId) return;
      await api.post(`/tenants/${currentUser.tenantId}/users`, formData);
      setShowModal(false);
      setFormData({ email: "", password: "", fullName: "", role: "user" });
      fetchUsers(currentUser.tenantId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers(currentUser.tenantId);
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand onClick={() => navigate("/dashboard")} style={{cursor: 'pointer'}}>SaaS Platform</Navbar.Brand>
          <Button variant="outline-light" onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
          }}>
            Logout
          </Button>
        </Container>
      </Navbar>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>User Management</h2>
          <Button variant="success" onClick={() => setShowModal(true)}>
            + Add User
          </Button>
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td><Badge bg={u.role === 'tenant_admin' ? 'info' : 'primary'}>{u.role}</Badge></td>
                <td>{u.isActive ? "Active" : "Inactive"}</td>
                <td>
                    {u.id !== currentUser?.id && (
                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(u.id)}>Delete</Button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateUser}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </Form.Group>
             <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="user">User</option>
                  <option value="tenant_admin">Tenant Admin</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" className="w-100">Add User</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Users;
