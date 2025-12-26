import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Container,
  Button,
  Card,
  ListGroup,
  Badge,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState({ name: "Loading..." });
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch tasks for this project
      const taskRes = await api.get(`/projects/${id}/tasks`);
      setTasks(taskRes.data.data.tasks);
      // Note: In a real app, you might want a separate endpoint to get single project details
      // For now, we rely on the tasks call or pass state, but let's assume tasks load fine.
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, newTask);
      setShowModal(false);
      setNewTask({ title: "", priority: "medium" });
      fetchData(); // Refresh tasks
    } catch (err) {
      alert("Failed to add task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="mt-4">
      <Button
        variant="outline-secondary"
        className="mb-3"
        onClick={() => navigate("/dashboard")}
      >
        &larr; Back to Dashboard
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Project Tasks</h2>
        <Button variant="success" onClick={() => setShowModal(true)}>
          + Add Task
        </Button>
      </div>

      <Row>
        {tasks.length === 0 ? (
          <p className="text-muted">No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <Col md={12} key={task.id} className="mb-2">
              <Card>
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5
                      className={
                        task.status === "completed"
                          ? "text-decoration-line-through text-muted"
                          : ""
                      }
                    >
                      {task.title}
                    </h5>
                    <Badge bg={task.priority === "high" ? "danger" : "info"}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div>
                    <select
                      className="form-select form-select-sm"
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Add Task Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddTask}>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" className="w-100">
              Save Task
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProjectDetails;
