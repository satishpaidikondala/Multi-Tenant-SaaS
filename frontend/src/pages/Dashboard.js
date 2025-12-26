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
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data.projects);
    } catch (err) {
      if (err.response && err.response.status === 401) handleLogout();
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", newProject);
      setShowModal(false);
      setNewProject({ name: "", description: "", status: "active" });
      fetchProjects();
    } catch (err) {
      alert("Failed to create project");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>SaaS Platform</Navbar.Brand>
          <Button variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        </Container>
      </Navbar>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Projects</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + New Project
          </Button>
        </div>

        <Row>
          {projects.map((project) => (
            <Col md={4} key={project.id} className="mb-3">
              <Card
                className="h-100 shadow-sm"
                // --- FIX STARTS HERE ---
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                onClick={() => navigate(`/projects/${project.id}`)}
                // --- FIX ENDS HERE ---
              >
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <Card.Title>{project.name}</Card.Title>
                    <Badge
                      bg={project.status === "active" ? "success" : "secondary"}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted mt-2">
                    {project.description}
                  </Card.Text>
                  <hr />
                  <div className="d-flex justify-content-between text-muted small">
                    <span>Tasks: {project.task_count || 0}</span>
                    <span>Creator: {project.creator_name}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateProject}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
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
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
              />
            </Form.Group>
            <Button type="submit" className="w-100">
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;
