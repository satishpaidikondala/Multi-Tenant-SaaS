// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Container,
  Navbar,
  Nav,
  Card,
  Button,
  Row,
  Col,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data.projects);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", newProject);
      setShowModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Navigation */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>SaaS Platform</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Projects</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + New Project
          </Button>
        </div>

        {/* Project List */}
        <Row>
          {projects.length === 0 ? (
            <Col>
              <div className="alert alert-info">
                No projects found. Create one to get started!
              </div>
            </Col>
          ) : (
            projects.map((project) => (
              <Col md={4} key={project.id} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title>{project.name}</Card.Title>
                      <Badge
                        bg={
                          project.status === "active" ? "success" : "secondary"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted mt-2">
                      {project.description || "No description"}
                    </Card.Text>
                    <hr />
                    <div className="d-flex justify-content-between text-muted small">
                      <span>Tasks: {project.task_count || 0}</span>
                      <span>Creator: {project.creator_name}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>

      {/* Create Project Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateProject}>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Create Project
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;
