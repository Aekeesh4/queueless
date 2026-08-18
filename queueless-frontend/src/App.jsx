import { useEffect, useState } from "react";
import "./App.css";

const API = "/api";

function App() {
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  const [selectedService, setSelectedService] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [queue, setQueue] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [nextWaiting, setNextWaiting] = useState(null);
  const [waitingCount, setWaitingCount] = useState(0);

  // ================= CUSTOMER TICKET =================

  const [ticket, setTicket] = useState(() => {
    const savedTicket =
      localStorage.getItem("queuelessTicket");

    return savedTicket
      ? JSON.parse(savedTicket)
      : null;
  });

  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] =
    useState(0);

  // ================= SERVICE MANAGEMENT =================

  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] =
    useState("");
  const [averageServiceTime, setAverageServiceTime] =
    useState("");

  const [editingServiceId, setEditingServiceId] =
    useState(null);

  const [showServiceForm, setShowServiceForm] =
    useState(false);

  // ================= COMMON =================

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] =
    useState(false);

  const [viewMode, setViewMode] =
    useState("customer");

  // ==================================================
  // CUSTOMER TICKET STORAGE
  // ==================================================

  useEffect(() => {
    if (ticket) {
      localStorage.setItem(
        "queuelessTicket",
        JSON.stringify(ticket)
      );
    } else {
      localStorage.removeItem("queuelessTicket");
    }
  }, [ticket]);

  // ==================================================
  // LOAD ACTIVE SERVICES
  // ==================================================

  const loadServices = async () => {
    try {
      const response = await fetch(
        `${API}/services/active`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load active services"
        );
      }

      setServices(data);

      const selectedStillActive = data.some(
        (service) =>
          String(service.id) ===
          String(selectedService)
      );

      if (
        data.length > 0 &&
        (!selectedService ||
          !selectedStillActive)
      ) {
        setSelectedService(
          String(data[0].id)
        );
      }

      if (data.length === 0) {
        setSelectedService("");
      }
    } catch (error) {
      setMessage(
        error.message ||
          "Failed to connect to backend"
      );
    }
  };

  // ==================================================
  // LOAD ALL SERVICES
  // ==================================================

  const loadAllServices = async () => {
    try {
      const response = await fetch(
        `${API}/services`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load all services"
        );
      }

      setAllServices(data);
    } catch (error) {
      setMessage(
        error.message ||
          "Failed to load service management data"
      );
    }
  };

  // ==================================================
  // LOAD QUEUE
  // ==================================================

  const loadQueue = async () => {
    if (!selectedService) return;

    try {
      const response = await fetch(
        `${API}/queue/${selectedService}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load queue"
        );
      }

      setQueue(data);

      const serving = data.find(
        (customer) =>
          customer.status === "SERVING"
      );

      const waiting = data.filter(
        (customer) =>
          customer.status === "WAITING"
      );

      setCurrentCustomer(
        serving || null
      );

      setNextWaiting(
        waiting.length > 0
          ? waiting[0]
          : null
      );

      setWaitingCount(
        waiting.length
      );

      // Update customer's own ticket
      if (ticket?.id) {
        const updatedTicket =
          data.find(
            (customer) =>
              customer.id === ticket.id
          );

        if (updatedTicket) {
          setTicket(updatedTicket);
        }
      }
    } catch (error) {
      setMessage(
        error.message ||
          "Failed to load queue"
      );
    }
  };

  // ==================================================
  // LOAD TICKET POSITION
  // ==================================================

  const loadTicketPosition = async () => {
    if (!ticket?.id) return;

    if (
      ticket.status === "COMPLETED" ||
      ticket.status === "CANCELLED"
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/queue/ticket/${ticket.id}/position`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load ticket position"
        );
      }

      setPeopleAhead(
        data.peopleAhead ?? 0
      );

      setEstimatedWaitMinutes(
        data.estimatedWaitMinutes ?? 0
      );
    } catch (error) {
      console.error(
        "Ticket position error:",
        error
      );
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadServices();
    loadAllServices();
  }, []);

  // ==================================================
  // RELOAD QUEUE WHEN SERVICE CHANGES
  // ==================================================

  useEffect(() => {
    if (selectedService) {
      loadQueue();
    } else {
      setQueue([]);
      setCurrentCustomer(null);
      setNextWaiting(null);
      setWaitingCount(0);
    }
  }, [selectedService]);

  // ==================================================
  // AUTO REFRESH
  // ==================================================

  useEffect(() => {
    if (!ticket?.id) return;

    loadTicketPosition();

    const interval = setInterval(() => {
      loadTicketPosition();
      loadQueue();
    }, 10000);

    return () => clearInterval(interval);
  }, [ticket?.id]);

  // ==================================================
  // SERVICE MANAGEMENT
  // ==================================================

  const resetServiceForm = () => {
    setServiceName("");
    setServiceDescription("");
    setAverageServiceTime("");
    setEditingServiceId(null);
    setShowServiceForm(false);
  };

  const startEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceName(service.name);
    setServiceDescription(
      service.description || ""
    );
    setAverageServiceTime(
      String(service.averageServiceTime)
    );

    setShowServiceForm(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const saveService = async (e) => {
    e.preventDefault();

    if (!serviceName.trim()) {
      setMessage(
        "Service name cannot be empty"
      );
      return;
    }

    const serviceTime =
      Number(averageServiceTime);

    if (
      !averageServiceTime ||
      Number.isNaN(serviceTime) ||
      serviceTime <= 0
    ) {
      setMessage(
        "Average service time must be greater than 0"
      );
      return;
    }

    setServiceLoading(true);
    setMessage("");

    try {
      const payload = {
        name: serviceName.trim(),
        description:
          serviceDescription.trim(),
        averageServiceTime: serviceTime,
        active: true,
      };

      const url = editingServiceId
        ? `${API}/services/${editingServiceId}`
        : `${API}/services`;

      const method = editingServiceId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = null;

      if (response.status !== 204) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to save service"
        );
      }

      setMessage(
        editingServiceId
          ? "Service updated successfully."
          : "Service created successfully."
      );

      resetServiceForm();

      await loadServices();
      await loadAllServices();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to save service"
      );
    } finally {
      setServiceLoading(false);
    }
  };

  const deactivateService = async (
    serviceId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this service?"
    );

    if (!confirmed) return;

    setServiceLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/services/${serviceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let data = null;

        try {
          data = await response.json();
        } catch {
          // Empty response
        }

        throw new Error(
          data?.message ||
            "Unable to deactivate service"
        );
      }

      setMessage(
        "Service deactivated successfully."
      );

      await loadServices();
      await loadAllServices();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to deactivate service"
      );
    } finally {
      setServiceLoading(false);
    }
  };

  const activateService = async (
    service
  ) => {
    setServiceLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/services/${service.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: service.name,
            description:
              service.description || "",
            averageServiceTime:
              service.averageServiceTime,
            active: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to activate service"
        );
      }

      setMessage(
        "Service activated successfully."
      );

      await loadServices();
      await loadAllServices();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to activate service"
      );
    } finally {
      setServiceLoading(false);
    }
  };

  // ==================================================
  // CUSTOMER - JOIN QUEUE
  // ==================================================

  const joinQueue = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setMessage(
        "Please enter customer name"
      );
      return;
    }

    if (!selectedService) {
      setMessage(
        "Please select a service"
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/queue/join?customerName=${encodeURIComponent(
          customerName.trim()
        )}&serviceId=${selectedService}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to join queue"
        );
      }

      setTicket(data);

      setPeopleAhead(0);
      setEstimatedWaitMinutes(0);

      setMessage(
        `Token ${data.tokenNumber} generated successfully for ${data.customerName}`
      );

      setCustomerName("");

      await loadQueue();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to generate token"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // STAFF - CALL NEXT
  // ==================================================

  const callNext = async () => {
    if (!selectedService) {
      setMessage(
        "Please select a service"
      );
      return;
    }

    if (currentCustomer) {
      setMessage(
        `${currentCustomer.customerName} is already being served. Complete the current customer first.`
      );
      return;
    }

    if (!nextWaiting) {
      setMessage(
        "No customers are waiting in the queue"
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/queue/${selectedService}/next`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to call next customer"
        );
      }

      setMessage(
        `${data.customerName} (Token ${data.tokenNumber}) is now being served`
      );

      await loadQueue();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to call next customer"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // STAFF - COMPLETE CURRENT
  // ==================================================

  const completeCurrent = async () => {
    if (!selectedService) {
      setMessage(
        "Please select a service"
      );
      return;
    }

    if (!currentCustomer) {
      setMessage(
        "No customer is currently being served"
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/queue/${selectedService}/complete-current`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to complete current customer"
        );
      }

      setMessage(
        data.message ||
          "Customer completed. Next customer is now being served."
      );

      await loadQueue();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to complete current customer"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // STAFF - CANCEL CUSTOMER
  // ==================================================

  const cancelCustomer = async (
    ticketId
  ) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/queue/ticket/${ticketId}/cancel`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to cancel customer"
        );
      }

      if (ticket?.id === ticketId) {
        setTicket(data);
        setPeopleAhead(0);
        setEstimatedWaitMinutes(0);
      }

      setMessage(
        `${data.customerName} (Token ${data.tokenNumber}) cancelled successfully`
      );

      await loadQueue();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to cancel customer"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // CUSTOMER - CLEAR LOCAL TICKET
  // ==================================================

  const clearMyTicket = () => {
    setTicket(null);
    setPeopleAhead(0);
    setEstimatedWaitMinutes(0);

    setMessage(
      "Your ticket has been removed from this screen."
    );
  };

  // ==================================================
  // WAITING CUSTOMERS
  // ==================================================

  const waitingCustomers =
    queue.filter(
      (customer) =>
        customer.status === "WAITING"
    );

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>
          <h1>QueueLess</h1>

          <p>
            Smart Queue Management System
          </p>
        </div>

        <div className="header-actions">

          <div className="mode-switch">

            <button
              className={
                viewMode === "customer"
                  ? "mode-btn active"
                  : "mode-btn"
              }
              onClick={() =>
                setViewMode("customer")
              }
            >
              Customer
            </button>

            <button
              className={
                viewMode === "staff"
                  ? "mode-btn active"
                  : "mode-btn"
              }
              onClick={() =>
                setViewMode("staff")
              }
            >
              Staff
            </button>

          </div>

          <div className="status">

            <span className="status-dot"></span>

            Backend Connected

          </div>

        </div>

      </header>

      <main className="container">

        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="message">

            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ================= SERVICE SELECTION ================= */}

        <section className="card service-card">

          <div>

            <h2>
              Select Service
            </h2>

            <p>
              Choose the service for today's queue.
            </p>

          </div>

          <select
            value={selectedService}
            onChange={(e) =>
              setSelectedService(
                e.target.value
              )
            }
            disabled={
              loading ||
              serviceLoading
            }
          >

            {services.length === 0 && (
              <option value="">
                No active services
              </option>
            )}

            {services.map(
              (service) => (
                <option
                  key={service.id}
                  value={String(
                    service.id
                  )}
                >
                  {service.name} —{" "}
                  {service.averageServiceTime}{" "}
                  min
                </option>
              )
            )}

          </select>

        </section>

        {/* ==================================================
            CUSTOMER VIEW
        ================================================== */}

        {viewMode === "customer" && (
          <>
            {/* ================= JOIN QUEUE ================= */}

            <section className="card">

              <div className="section-title">

                <div>

                  <h2>
                    Join Queue
                  </h2>

                  <p>
                    Generate a new queue token.
                  </p>

                </div>

              </div>

              <form
                onSubmit={joinQueue}
              >

                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />

                <button
                  className="primary-btn"
                  type="submit"
                  disabled={
                    loading ||
                    !selectedService ||
                    !customerName.trim()
                  }
                >
                  {loading
                    ? "Processing..."
                    : "Generate Token"}
                </button>

              </form>

            </section>

            {/* ================= MY TICKET ================= */}

            {ticket && (
              <section className="card ticket-card">

                <div className="ticket-header">

                  <div>

                    <h2>
                      Your Queue Ticket
                    </h2>

                    <p>
                      Track your position in the queue.
                    </p>

                  </div>

                  <span className="ticket-status">
                    {ticket.status}
                  </span>

                </div>

                <div className="ticket-main">

                  <div className="big-token">
                    #{ticket.tokenNumber}
                  </div>

                  <div className="ticket-details">

                    <h3>
                      {ticket.customerName}
                    </h3>

                    <p>
                      {ticket.service?.name}
                    </p>

                  </div>

                </div>

                <div className="ticket-stats">

                  <div>

                    <span>
                      People Ahead
                    </span>

                    <strong>
                      {ticket.status ===
                      "SERVING"
                        ? 0
                        : peopleAhead}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Estimated Wait
                    </span>

                    <strong>
                      {ticket.status ===
                      "SERVING"
                        ? "Now"
                        : `${estimatedWaitMinutes} min`}
                    </strong>

                  </div>

                </div>

                <div className="action-row">

                  <button
                    className="refresh-btn"
                    onClick={() => {
                      loadTicketPosition();
                      loadQueue();
                    }}
                    disabled={loading}
                  >
                    Refresh My Position
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={clearMyTicket}
                    disabled={loading}
                  >
                    Clear My Ticket
                  </button>

                </div>

              </section>
            )}

            {!ticket && (
              <section className="card customer-info-card">

                <div className="empty">

                  <h3>
                    No active ticket
                  </h3>

                  <p>
                    Enter your name above to generate a queue token.
                  </p>

                </div>

              </section>
            )}
          </>
        )}

        {/* ==================================================
            STAFF VIEW
        ================================================== */}

        {viewMode === "staff" && (
          <>
            {/* ================= CURRENTLY SERVING ================= */}

            <section className="card serving-card">

              <div className="section-title">

                <div>

                  <h2>
                    Currently Serving
                  </h2>

                  <p>
                    Customer currently being served.
                  </p>

                </div>

              </div>

              {currentCustomer ? (

                <div className="serving-box">

                  <div className="token">
                    #{currentCustomer.tokenNumber}
                  </div>

                  <div>

                    <h3>
                      {
                        currentCustomer.customerName
                      }
                    </h3>

                    <span>
                      SERVING
                    </span>

                  </div>

                </div>

              ) : (

                <div className="empty">
                  No customer is currently being served.
                </div>

              )}

              <div className="action-row">

                <button
                  className="secondary-btn"
                  onClick={callNext}
                  disabled={
                    loading ||
                    !selectedService ||
                    !!currentCustomer ||
                    !nextWaiting
                  }
                  title={
                    currentCustomer
                      ? "Complete the current customer first"
                      : !nextWaiting
                      ? "No waiting customers"
                      : "Call next customer"
                  }
                >
                  {currentCustomer
                    ? "Already Serving"
                    : "Call Next"}
                </button>

                <button
                  className="success-btn"
                  onClick={
                    completeCurrent
                  }
                  disabled={
                    loading ||
                    !currentCustomer
                  }
                >
                  Complete & Next
                </button>

              </div>

            </section>

            {/* ================= STATS ================= */}

            <section className="stats-grid">

              <div className="stat-card">

                <span>
                  Waiting
                </span>

                <strong>
                  {waitingCount}
                </strong>

              </div>

              <div className="stat-card">

                <span>
                  Currently Serving
                </span>

                <strong>
                  {currentCustomer
                    ? `#${currentCustomer.tokenNumber}`
                    : "—"}
                </strong>

              </div>

              <div className="stat-card">

                <span>
                  Next Customer
                </span>

                <strong>
                  {nextWaiting
                    ? `#${nextWaiting.tokenNumber}`
                    : "—"}
                </strong>

              </div>

            </section>

            {/* ================= WAITING QUEUE ================= */}

            <section className="card">

              <div className="queue-header">

                <div>

                  <h2>
                    Waiting Queue
                  </h2>

                  <p>
                    Customers waiting for the selected service.
                  </p>

                </div>

                <button
                  className="refresh-btn"
                  onClick={loadQueue}
                  disabled={
                    loading ||
                    !selectedService
                  }
                >
                  {loading
                    ? "Loading..."
                    : "Refresh"}
                </button>

              </div>

              {waitingCustomers.length ===
              0 ? (

                <div className="empty queue-empty">
                  No customers are waiting in the queue.
                </div>

              ) : (

                <div className="queue-list">

                  {waitingCustomers.map(
                    (
                      customer,
                      index
                    ) => (

                      <div
                        className="queue-item"
                        key={customer.id}
                      >

                        <div className="queue-position">
                          {index + 1}
                        </div>

                        <div className="customer-info">

                          <h3>
                            {
                              customer.customerName
                            }
                          </h3>

                          <p>
                            Token #
                            {
                              customer.tokenNumber
                            }
                          </p>

                        </div>

                        <div className="queue-status">

                          <span>
                            WAITING
                          </span>

                        </div>

                        <button
                          className="cancel-btn"
                          onClick={() =>
                            cancelCustomer(
                              customer.id
                            )
                          }
                          disabled={loading}
                        >
                          Cancel
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

            {/* ==================================================
                SERVICE MANAGEMENT
            ================================================== */}

            <section className="card service-management">

              <div className="queue-header">

                <div>

                  <h2>
                    Service Management
                  </h2>

                  <p>
                    Create, update and manage queue services.
                  </p>

                </div>

                <button
                  className="primary-small-btn"
                  onClick={() => {
                    if (showServiceForm) {
                      resetServiceForm();
                    } else {
                      setShowServiceForm(
                        true
                      );
                    }
                  }}
                  disabled={
                    serviceLoading
                  }
                >
                  {showServiceForm
                    ? "Close Form"
                    : "+ Add Service"}
                </button>

              </div>

              {/* ================= SERVICE FORM ================= */}

              {showServiceForm && (
                <form
                  className="service-form"
                  onSubmit={saveService}
                >

                  <h3>
                    {editingServiceId
                      ? "Edit Service"
                      : "Add New Service"}
                  </h3>

                  <div className="service-form-grid">

                    <div>

                      <label>
                        Service Name
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Dental Consultation"
                        value={
                          serviceName
                        }
                        onChange={(e) =>
                          setServiceName(
                            e.target.value
                          )
                        }
                        disabled={
                          serviceLoading
                        }
                      />

                    </div>

                    <div>

                      <label>
                        Average Service Time
                      </label>

                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 15"
                        value={
                          averageServiceTime
                        }
                        onChange={(e) =>
                          setAverageServiceTime(
                            e.target.value
                          )
                        }
                        disabled={
                          serviceLoading
                        }
                      />

                    </div>

                  </div>

                  <label>
                    Description
                  </label>

                  <input
                    type="text"
                    placeholder="Describe this service"
                    value={
                      serviceDescription
                    }
                    onChange={(e) =>
                      setServiceDescription(
                        e.target.value
                      )
                    }
                    disabled={
                      serviceLoading
                    }
                  />

                  <div className="action-row">

                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={
                        serviceLoading
                      }
                    >
                      {serviceLoading
                        ? "Saving..."
                        : editingServiceId
                        ? "Update Service"
                        : "Create Service"}
                    </button>

                    <button
                      type="button"
                      className="refresh-btn"
                      onClick={
                        resetServiceForm
                      }
                      disabled={
                        serviceLoading
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </form>
              )}

              {/* ================= SERVICE LIST ================= */}

              <div className="managed-services">

                <div className="managed-services-header">

                  <h3>
                    All Services
                  </h3>

                  <button
                    className="refresh-btn"
                    onClick={() => {
                      loadServices();
                      loadAllServices();
                    }}
                    disabled={
                      serviceLoading
                    }
                  >
                    Refresh
                  </button>

                </div>

                {allServices.length ===
                0 ? (

                  <div className="empty">
                    No services found.
                  </div>

                ) : (

                  <div className="service-list">

                    {allServices.map(
                      (service) => (

                        <div
                          className="managed-service-item"
                          key={service.id}
                        >

                          <div className="managed-service-info">

                            <div className="managed-service-title">

                              <h3>
                                {service.name}
                              </h3>

                              <span
                                className={
                                  service.active
                                    ? "active-badge"
                                    : "inactive-badge"
                                }
                              >
                                {service.active
                                  ? "ACTIVE"
                                  : "INACTIVE"}
                              </span>

                            </div>

                            <p>
                              {
                                service.description ||
                                "No description provided."
                              }
                            </p>

                            <small>
                              Average service time:{" "}
                              {
                                service.averageServiceTime
                              }{" "}
                              minutes
                            </small>

                          </div>

                          <div className="managed-service-actions">

                            <button
                              className="secondary-btn"
                              onClick={() =>
                                startEditService(
                                  service
                                )
                              }
                              disabled={
                                serviceLoading
                              }
                            >
                              Edit
                            </button>

                            {service.active ? (

                              <button
                                className="cancel-btn"
                                onClick={() =>
                                  deactivateService(
                                    service.id
                                  )
                                }
                                disabled={
                                  serviceLoading
                                }
                              >
                                Deactivate
                              </button>

                            ) : (

                              <button
                                className="success-btn"
                                onClick={() =>
                                  activateService(
                                    service
                                  )
                                }
                                disabled={
                                  serviceLoading
                                }
                              >
                                Activate
                              </button>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>
          </>
        )}

        {/* ================= FOOTER ================= */}

        <footer>

          <p>
            QueueLess • Smart Queue Management System
          </p>

        </footer>

      </main>

    </div>
  );
}

export default App;