import React, { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import axios from "axios";

const DataManagement = () => {
  const [activeTab, setActiveTab] = useState("Customers");
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("Add");
  const [currentRecord, setCurrentRecord] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSQLPopup, setShowSQLPopup] = useState(false);  // For the SQL popup

  // Fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:6001/api/${activeTab.toLowerCase()}`,
        {
          params: { search: searchTerm },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, searchTerm]);

  // Add/Edit Modal
  const handleShowModal = (type, record = {}) => {
    setModalType(type);
    setCurrentRecord(record); // Pass the selected record to the modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRecord({});
  };

  // Submit Form (Add or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiEndpoint = `http://localhost:6001/api/${activeTab.toLowerCase()}`;
      if (modalType === "Add") {
        await axios.post(apiEndpoint, currentRecord);
      } else {
        const primaryKey = currentRecord.Invoice_ID || currentRecord.Customer_ID || currentRecord.Product_ID || currentRecord.ID;
        await axios.put(`${apiEndpoint}/${primaryKey}`, currentRecord); // Use the correct primary key
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:6001/api/${activeTab.toLowerCase()}/${id}`);
      fetchData();  // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const handlePaginationClick = (eventKey) => {
    setCurrentPage(eventKey);
  };

  // Pagination Component
  const renderPagination = () => {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const pages = [];

    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pages.push(i);
    }

    if (currentPage > 4 && totalPages > 5) pages.push("...");

    for (let i = Math.max(currentPage - 1, 4); i <= Math.min(currentPage + 1, totalPages - 3); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3 && totalPages > 5) pages.push("...");

    for (let i = totalPages - 2; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <Pagination>
        {pages.map((page, index) => (
          <Pagination.Item
            key={index}
            active={page === currentPage}
            onClick={() => handlePaginationClick(page)}
          >
            {page}
          </Pagination.Item>
        ))}
      </Pagination>
    );
  };

  // Show Add New Modal
  const handleAddNewRecord = () => {
    setModalType("Add");
    setCurrentRecord({});
    setShowModal(true);
  };

  // Show SQL Popup
  const handleShowSQLPopup = () => {
    setShowSQLPopup(true);
  };

  const handleCloseSQLPopup = () => {
    setShowSQLPopup(false);
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Advanced Data Management</h1>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Tab eventKey="Customers" title="Customers" />
        <Tab eventKey="Branches" title="Branches" />
        <Tab eventKey="Products" title="Products" />
        <Tab eventKey="Sales" title="Sales" />
        <Tab eventKey="Financials" title="Financials" />
      </Tabs>

      {/* Show SQL Commands Button */}
      <Button variant="info" onClick={handleShowSQLPopup}>
        Show SQL Commands
      </Button>

      {/* Search and Add */}
      <Row className="mb-3 justify-content-center">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ display: "block", margin: "0 auto" }}
          />
        </Col>
        <Col md={6} className="text-end">
          <Button variant="success" onClick={handleAddNewRecord}>
            Add New Record
          </Button>
        </Col>
      </Row>

      {/* Total Rows */}
      <Row className="mb-3">
        <Col className="text-center">
          <h5>
            Total Rows: <strong>{data.length}</strong>
          </h5>
        </Col>
      </Row>

      {/* Rows per Page Dropdown */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            as="select"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
          >
            <option value={5}>5 rows per page</option>
            <option value={10}>10 rows per page</option>
            <option value={15}>15 rows per page</option>
          </Form.Control>
        </Col>
      </Row>

      {/* Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => {
                if (key.toLowerCase() === "sales") return null;
                return <th key={key}>{key}</th>;
              })}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((record) => (
            <tr key={record.id || record.Customer_ID || record.Product_ID || record.ID}>
              {Object.keys(record).map((key) => {
                if (key.toLowerCase() === "sales") return null;
                return <td key={key}>{record[key]}</td>;
              })}
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShowModal("Edit", record)} className="me-2">
                  Edit
                </Button>
                {activeTab === "Branches" || activeTab === "Financials" ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(record.id || record.Customer_ID || record.Product_ID || record.ID)}
                  >
                    Delete
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {renderPagination()}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType} Record</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => {
                if (key.toLowerCase() === "sales") return null;
                return (
                  <Form.Group className="mb-3" key={key}>
                    <Form.Label>{key}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={`Enter ${key}`}
                      value={currentRecord[key] || ""}
                      onChange={(e) =>
                        setCurrentRecord({
                          ...currentRecord,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                );
              })}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              {modalType === "Add" ? "Add" : "Update"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* SQL Popup Modal */}
      <Modal show={showSQLPopup} onHide={handleCloseSQLPopup}>
        <Modal.Header closeButton>
          <Modal.Title>SQL Commands Used</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Create</h5>
          <p>
            INSERT INTO {activeTab} ({/* Columns to insert */}) VALUES ({/* Values */});
          </p>
          <h5>Read</h5>
          <p>
            SELECT * FROM {activeTab};
          </p>
          <h5>Update</h5>
          <p>
  UPDATE {activeTab} SET {"<column_name> = <new_value>"} WHERE {activeTab}_ID = {"<ID>"};
</p>
          <h5>Delete</h5>
          <p>
  UPDATE {activeTab} SET {"<column_name> = <new_value>"} WHERE {activeTab}_ID = {"<ID>"};
</p>
          <p><strong>Note:</strong> The delete command will not perform on tables with foreign key constraints due to references in other tables.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSQLPopup}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DataManagement;