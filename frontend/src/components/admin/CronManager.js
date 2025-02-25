import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Card,
  Row,
  Col,
  Spinner
} from 'react-bootstrap';
import axios from 'axios';
import cronstrue from 'cronstrue';

const CronManager = () => {
  const [automations, setAutomations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'schedule',
    cronExpression: '',
    actions: []
  });

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/automations?type=schedule');
      setAutomations(response.data);
      setError(null);
    } catch (err) {
      setError('Error loading automations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAutomation) {
        await axios.put(`/api/automations/${selectedAutomation.id}`, formData);
      } else {
        await axios.post('/api/automations', {
          ...formData,
          type: 'schedule',
          config: {
            cronExpression: formData.cronExpression,
            actions: formData.actions
          }
        });
      }
      setShowModal(false);
      loadAutomations();
    } catch (err) {
      setError('Error saving automation: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      try {
        await axios.delete(`/api/automations/${id}`);
        loadAutomations();
      } catch (err) {
        setError('Error deleting automation: ' + err.message);
      }
    }
  };

  const handleEdit = (automation) => {
    setSelectedAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description,
      cronExpression: automation.config.cronExpression,
      actions: automation.config.actions
    });
    setShowModal(true);
  };

  const handleAddAction = () => {
    setFormData({
      ...formData,
      actions: [
        ...formData.actions,
        {
          type: 'moduleFunction',
          function: '',
          params: {}
        }
      ]
    });
  };

  const handleRemoveAction = (index) => {
    const actions = [...formData.actions];
    actions.splice(index, 1);
    setFormData({ ...formData, actions });
  };

  const handleActionChange = (index, field, value) => {
    const actions = [...formData.actions];
    actions[index] = { ...actions[index], [field]: value };
    setFormData({ ...formData, actions });
  };

  const getStatusBadge = (automation) => {
    if (!automation.isActive) return <Badge bg="secondary">Inactive</Badge>;
    if (automation.stats?.failedRuns > 0) return <Badge bg="danger">Failed</Badge>;
    return <Badge bg="success">Active</Badge>;
  };

  const formatNextRun = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString();
  };

  const validateCronExpression = (expression) => {
    try {
      cronstrue.toString(expression);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="p-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Cron Manager</h4>
          <Button variant="primary" onClick={() => {
            setSelectedAutomation(null);
            setFormData({
              name: '',
              description: '',
              type: 'schedule',
              cronExpression: '',
              actions: []
            });
            setShowModal(true);
          }}>
            Add New Task
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Schedule</th>
                  <th>Next Run</th>
                  <th>Status</th>
                  <th>Last Run</th>
                  <th>Success Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {automations.map(automation => (
                  <tr key={automation.id}>
                    <td>{automation.name}</td>
                    <td>
                      <span title={cronstrue.toString(automation.config.cronExpression)}>
                        {automation.config.cronExpression}
                      </span>
                    </td>
                    <td>{formatNextRun(automation.nextRun)}</td>
                    <td>{getStatusBadge(automation)}</td>
                    <td>{automation.lastRun ? new Date(automation.lastRun).toLocaleString() : 'Never'}</td>
                    <td>
                      {automation.stats ? (
                        `${Math.round((automation.stats.successfulRuns / automation.stats.totalRuns) * 100)}%`
                      ) : '0%'}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(automation)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(automation.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAutomation ? 'Edit Task' : 'New Task'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cron Expression</Form.Label>
              <Form.Control
                type="text"
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                isInvalid={formData.cronExpression && !validateCronExpression(formData.cronExpression)}
                required
              />
              {formData.cronExpression && validateCronExpression(formData.cronExpression) && (
                <Form.Text className="text-muted">
                  {cronstrue.toString(formData.cronExpression)}
                </Form.Text>
              )}
              <Form.Control.Feedback type="invalid">
                Invalid cron expression
              </Form.Control.Feedback>
            </Form.Group>

            <div className="mb-3">
              <label className="form-label d-flex justify-content-between align-items-center">
                Actions
                <Button variant="outline-primary" size="sm" onClick={handleAddAction}>
                  Add Action
                </Button>
              </label>

              {formData.actions.map((action, index) => (
                <Card key={index} className="mb-2">
                  <Card.Body>
                    <Row>
                      <Col>
                        <Form.Group>
                          <Form.Label>Type</Form.Label>
                          <Form.Select
                            value={action.type}
                            onChange={(e) => handleActionChange(index, 'type', e.target.value)}
                          >
                            <option value="moduleFunction">Module Function</option>
                            <option value="notification">Notification</option>
                            <option value="database">Database Action</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group>
                          <Form.Label>Function</Form.Label>
                          <Form.Control
                            type="text"
                            value={action.function}
                            onChange={(e) => handleActionChange(index, 'function', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs="auto" className="d-flex align-items-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveAction(index)}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CronManager;
